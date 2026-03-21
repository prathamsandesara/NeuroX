const supabase = require('../config/supabase');
const pistonService = require('../services/pistonService');
const aiClient = require('../utils/aiClient');
const pdf = require('pdf-parse');
const axios = require('axios');

const generatePersonalizedQuestions = async (resumeUrl, jobTitle, jobSkills) => {
    try {
        console.log(`[Persona] Generating personalized questions from: ${resumeUrl}`);
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        const pdfData = await pdf(response.data);
        const resumeText = pdfData.text;

        const prompt = `You are a high-level technical interviewer.
        Candidate Resume Content: ${resumeText.substring(0, 4000)}
        Target Role: ${jobTitle}
        Core Skills: ${jobSkills}

        Rules:
        - Generate exactly 2 subjective questions that link the candidate's SPECIFIC past experience to the requirements of the new role.
        - Output STRICT JSON only.
        - Each question is worth 5 marks.

        Output Format:
        [
          {"id": "persona_1", "type": "PERSONALIZED", "question": "string", "expected_concepts": ["concept1"], "marks": 5},
          {"id": "persona_2", "type": "PERSONALIZED", "question": "string", "expected_concepts": ["concept1"], "marks": 5}
        ]`;

        const aiResponse = await aiClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4
        });

        const content = aiResponse.choices[0].message.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('[Persona] Generation Failed:', error.message);
        return [];
    }
};

const startAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.body;
        const user_id = req.user.id;

        const { data: existing, error: fetchErr } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user_id)
            .eq('assessment_id', assessmentId);

        if (fetchErr) throw fetchErr;
        const activeAttempt = existing.find(sub => sub.status === 'IN_PROGRESS') || existing[0];

        let finalSubmission;
        if (activeAttempt) {
            if (activeAttempt.status === 'COMPLETED' || activeAttempt.status === 'SUBMITTED' || activeAttempt.status === 'TERMINATED_DUE_TO_VIOLATION') {
                return res.status(403).json({ error: 'Assessment already attempted.' });
            }
            finalSubmission = activeAttempt;
        } else {
            const { data: submission, error: subError } = await supabase
                .from('submissions')
                .insert([{ user_id, assessment_id: assessmentId, status: 'IN_PROGRESS', attempts_left: 1 }])
                .select().single();
            if (subError) throw subError;
            finalSubmission = submission;
        }

        if (!finalSubmission.details?.personalizedQuestions) {
            const { data: userData } = await supabase.from('users').select('resume_url').eq('id', user_id).single();
            const { data: jobData } = await supabase.from('assessments').select('jobs(title, skills)').eq('id', assessmentId).single();
            if (userData?.resume_url) {
                const personaQuestions = await generatePersonalizedQuestions(userData.resume_url, jobData.jobs.title, jobData.jobs.skills?.map(s => s.skill_name).join(', '));
                if (personaQuestions.length > 0) {
                    const { data: updatedSub } = await supabase.from('submissions').update({
                        details: { ...(finalSubmission.details || {}), personalizedQuestions: personaQuestions }
                    }).eq('id', finalSubmission.id).select().single();
                    if (updatedSub) finalSubmission = updatedSub;
                }
            }
        }
        res.json({ submissionId: finalSubmission.id });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const evaluateSubmission = async (submissionId) => {
    const { data: submission, error: subErr } = await supabase.from('submissions').select('*, assessments(questions(*))').eq('id', submissionId).single();
    if (subErr || !submission) throw new Error('Submission not found');

    const questions = submission.assessments.questions;
    const answers = submission.details?.rawAnswers || {};
    let totalScore = 0, totalMax = 0, mcqScore = 0, subjectiveScore = 0, codingScore = 0, mcqMax = 0, subjectiveMax = 0, codingMax = 0;
    const evaluationDetails = [];

    questions.forEach(q => {
        if (q.type === 'MCQ') {
            const userAnswer = answers[q.id];
            const qMax = q.marks || 1;
            const isCorrect = userAnswer === q.content.correct_answer;
            const qScore = isCorrect ? qMax : 0;
            mcqScore += qScore; mcqMax += qMax; totalScore += qScore; totalMax += qMax;
            evaluationDetails.push({ questionId: q.id, type: 'MCQ', passed: isCorrect, score: qScore, max: qMax });
        }
    });

    const evalTasks = [];
    questions.filter(q => q.type === 'SUBJECTIVE').forEach(q => {
        const qMax = q.marks || 4; subjectiveMax += qMax; totalMax += qMax;
        evalTasks.push((async () => {
            try {
                const prompt = `Evaluate subjective answer: Question: ${q.content.question}. Answer: ${answers[q.id] || ''}. Output JSON: { "similarity_percentage": number, "reasoning_summary": "string", "reference_answer": "string", "ai_forensics_score": number }`;
                const response = await aiClient.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.1 });
                const aiResult = JSON.parse(response.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
                const qScore = (aiResult.similarity_percentage / 100) * qMax;
                subjectiveScore += qScore; totalScore += qScore;
                evaluationDetails.push({ questionId: q.id, type: 'SUBJECTIVE', score: qScore, max: qMax, ai_analysis: aiResult, reference_answer: aiResult.reference_answer });
            } catch (err) { evaluationDetails.push({ questionId: q.id, type: 'SUBJECTIVE', score: 0, max: qMax, error: 'AI Eval Failed' }); }
        })());
    });

    questions.filter(q => q.type === 'CODING').forEach(q => {
        const qMax = q.marks || 10; codingMax += qMax; totalMax += qMax;
        const userAnswer = answers[q.id];
        const code = typeof userAnswer === 'object' ? userAnswer.code : userAnswer;
        const language = typeof userAnswer === 'object' ? (userAnswer.lang || 'python') : 'python';
        evalTasks.push((async () => {
            const testResults = await Promise.all((q.content.test_cases || []).map(async (test) => {
                try {
                    const runResult = await pistonService.executeCode(language, code, test.input);
                    return { passed: (runResult.stdout || "").trim() === (test.output || "").trim(), input: test.input };
                } catch (err) { return { passed: false, error: err.message }; }
            }));
            const testsPassed = testResults.filter(r => r.passed).length;
            const qScore = (q.content.test_cases?.length > 0) ? (testsPassed / q.content.test_cases.length) * qMax : 0;
            codingScore += qScore; totalScore += qScore;
            evaluationDetails.push({ questionId: q.id, type: 'CODING', score: qScore, max: qMax, testResults });
        })());
    });

    (submission.details?.personalizedQuestions || []).forEach(q => {
        const qMax = q.marks || 5; totalMax += qMax;
        evalTasks.push((async () => {
            try {
                const prompt = `Evaluate personalized: ${q.question}. Answer: ${answers[q.id] || ''}. Output JSON: { "similarity_percentage": number, "reasoning_summary": "string", "ai_forensics_score": number }`;
                const response = await aiClient.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.1 });
                const aiResult = JSON.parse(response.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
                const qScore = (aiResult.similarity_percentage / 100) * qMax;
                totalScore += qScore;
                evaluationDetails.push({ questionId: q.id, type: 'PERSONALIZED', score: qScore, max: qMax, ai_analysis: aiResult });
            } catch (err) { evaluationDetails.push({ questionId: q.id, type: 'PERSONALIZED', score: 0, max: qMax, error: 'AI Eval Failed' }); }
        })());
    });

    try {
        console.log(`[EVAL] Starting Promise.all for ${evalTasks.length} tasks...`);
        const startTime = Date.now();
        await Promise.all(evalTasks.map(t => Promise.race([t, new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 45000))])));
        console.log(`[EVAL] All tasks completed in ${Date.now() - startTime}ms.`);
    } catch (err) { console.error('[EVAL_CRITICAL] Timeout or error in evalTasks:', err.message); }

    const finalPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const finalStatus = submission.status === 'TERMINATED_DUE_TO_VIOLATION' ? 'TERMINATED_DUE_TO_VIOLATION' : 'COMPLETED';
    console.log(`[EVAL] Final scores: Total ${totalScore}/${totalMax} (${finalPercentage.toFixed(2)}%)`);

    const { error: updateErr } = await supabase.from('submissions').update({ score: finalPercentage, result_generated: true, status: finalStatus }).eq('id', submissionId);
    if (updateErr) console.error('[EVAL_DB] Error updating submission:', updateErr.message);

    const { error: insertErr } = await supabase.from('results').insert([{
        submission_id: submissionId,
        details: { evaluationDetails, sectionScores: { mcq: mcqScore, subjective: subjectiveScore, coding: codingScore }, sectionMaxScores: { mcq: mcqMax, subjective: subjectiveMax, coding: codingMax }, totalPoints: Math.round(totalScore), maxPoints: totalMax, passStatus: finalPercentage >= 50, rawAnswers: answers }
    }]);
    if (insertErr) console.error('[EVAL_DB] Error inserting result:', insertErr.message);

    console.log(`[EVAL] Successfully completed evaluateSubmission for ${submissionId}`);
    return { totalScore, finalPercentage };
};

const submitAssessment = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;
        console.log(`[SUBMIT] Initiating submission for ${submissionId}`);
        const { error: submitErr } = await supabase.from('submissions').update({ details: { rawAnswers: answers }, status: 'SUBMITTED', completed_at: new Date() }).eq('id', submissionId);
        if (submitErr) console.error('[SUBMIT_DB] Error updating raw answers:', submitErr.message);
        
        // Run in background to prevent frontend timeout!
        evaluateSubmission(submissionId).catch(evalErr => console.error('[SUBMIT_BACKGROUND] Eval Error:', evalErr.message));
        
        console.log(`[SUBMIT] Sent success response for ${submissionId}`);
        res.json({ message: 'Submitted successfully.' });
    } catch (error) { 
        console.error('[SUBMIT] Failed:', error.message);
        res.status(500).json({ error: 'Failed' }); 
    }
};

const getResult = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { data: result, error } = await supabase.from('results').select('*, submissions(score, status, completed_at, proctoring_violations, assessments(job_id, jobs(title)))').eq('submission_id', submissionId).single();
        if (error) return res.status(404).json({ error: 'RESULT_NOT_GENERATED' });
        res.json(result);
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

const logAssessmentViolation = async (req, res) => {
    try {
        const { assessment_id, candidate_id, violation_type, biometrics } = req.body;
        const userId = candidate_id || req.user.id;
        const { data: submissions } = await supabase.from('submissions').select('proctoring_violations, id, status').eq('user_id', userId).eq('assessment_id', assessment_id);
        const submission = submissions?.find(s => s.status === 'IN_PROGRESS') || submissions?.[0];
        if (!submission) return res.status(404).json({ error: 'No submission found' });
        const updatedViolations = [...(submission.proctoring_violations || []), { type: violation_type, timestamp: new Date().toISOString(), biometrics: biometrics || null }];
        await supabase.from('submissions').update({ proctoring_violations: updatedViolations, status: 'TERMINATED_DUE_TO_VIOLATION', attempts_left: 0, completed_at: new Date() }).eq('id', submission.id);
        res.json({ message: 'Violation logged' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const syncSnapshot = async (req, res) => {
    try {
        const { submissionId, snapshotUrl } = req.body;
        const { data } = await supabase.from('submissions').select('details').eq('id', submissionId).single();
        await supabase.from('submissions').update({ details: { ...(data.details || {}), last_snapshot_url: snapshotUrl } }).eq('id', submissionId);
        res.json({ message: 'Snapshot synced' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const syncAnswers = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;
        const { data } = await supabase.from('submissions').select('details').eq('id', submissionId).single();
        await supabase.from('submissions').update({ details: { ...(data.details || {}), rawAnswers: { ...(data.details?.rawAnswers || {}), ...answers } } }).eq('id', submissionId);
        res.json({ message: 'Answers synced' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const uploadSnapshot = async (req, res) => {
    try {
        const { submissionId, imageBase64 } = req.body;
        const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const fileName = `${submissionId}/${Date.now()}.jpg`;
        await supabase.storage.from('snapshots').upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
        const { data: { publicUrl } } = supabase.storage.from('snapshots').getPublicUrl(fileName);
        const { data: subData } = await supabase.from('submissions').select('details').eq('id', submissionId).single();
        await supabase.from('submissions').update({ details: { ...(subData.details || {}), last_snapshot_url: publicUrl } }).eq('id', submissionId);
        res.json({ message: 'Snapshot uploaded', publicUrl });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const getPersonalizedQuestions = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { data: submission } = await supabase.from('submissions').select('details').eq('id', submissionId).single();
        res.json({ personalizedQuestions: submission.details?.personalizedQuestions || [] });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

const reportAudioViolation = async (req, res) => {
    try {
        const { submissionId, type, reason } = req.body;
        const { data: sub } = await supabase.from('submissions').select('details').eq('id', submissionId).single();
        const currentDetails = sub?.details || {};
        const currentViolations = currentDetails.proctoring_violations || [];
        await supabase.from('submissions').update({ details: { ...currentDetails, proctoring_violations: [...currentViolations, { type: type || 'AUDIO_ANOMALY', reason: reason || 'Multiple voices', timestamp: new Date().toISOString() }] } }).eq('id', submissionId);
        res.json({ message: 'Audio violation logged' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { startAssessment, submitAssessment, getResult, logAssessmentViolation, evaluateSubmission, syncSnapshot, syncAnswers, uploadSnapshot, getPersonalizedQuestions, reportAudioViolation };
