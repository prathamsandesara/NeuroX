const supabase = require('../config/supabase'); // Still used for storage
const db = require('../config/db');
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

        const { rows: existing } = await db.query(
            'SELECT * FROM submissions WHERE user_id = $1 AND assessment_id = $2',
            [user_id, assessmentId]
        );

        const activeAttempt = existing.find(sub => sub.status === 'IN_PROGRESS') || existing[0];

        let finalSubmission;
        if (activeAttempt) {
            if (activeAttempt.status === 'COMPLETED' || activeAttempt.status === 'SUBMITTED' || activeAttempt.status === 'TERMINATED_DUE_TO_VIOLATION') {
                return res.status(403).json({ error: 'Assessment already attempted.' });
            }
            finalSubmission = activeAttempt;
        } else {
            const { rows: subRows } = await db.query(
                `INSERT INTO submissions (user_id, assessment_id, status, attempts_left) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [user_id, assessmentId, 'IN_PROGRESS', 1]
            );
            finalSubmission = subRows[0];
        }

        if (!finalSubmission.details?.personalizedQuestions) {
            const { rows: userRows } = await db.query('SELECT resume_url FROM users WHERE id = $1', [user_id]);
            const userData = userRows[0];
            
            const { rows: jobRows } = await db.query(`
                SELECT j.title, j.skills 
                FROM assessments a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE a.id = $1
            `, [assessmentId]);
            const jobData = jobRows[0];

            if (userData?.resume_url && jobData) {
                const skillsArr = typeof jobData.skills === 'string' ? JSON.parse(jobData.skills) : jobData.skills;
                const personaQuestions = await generatePersonalizedQuestions(
                    userData.resume_url, 
                    jobData.title, 
                    skillsArr?.map(s => s.skill_name).join(', ')
                );
                if (personaQuestions.length > 0) {
                    const updatedDetails = {
                        ...(finalSubmission.details || {}),
                        personalizedQuestions: personaQuestions
                    };
                    const { rows: updatedSub } = await db.query(
                        'UPDATE submissions SET details = $1 WHERE id = $2 RETURNING *',
                        [updatedDetails, finalSubmission.id]
                    );
                    if (updatedSub.length > 0) finalSubmission = updatedSub[0];
                }
            }
        }
        res.json({ submissionId: finalSubmission.id });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const evaluateSubmission = async (submissionId) => {
    const query = `
        SELECT s.*, 
        COALESCE(
            json_agg(q.*) FILTER (WHERE q.id IS NOT NULL), '[]'
        ) AS questions
        FROM submissions s
        JOIN assessments a ON s.assessment_id = a.id
        LEFT JOIN questions q ON a.id = q.assessment_id
        WHERE s.id = $1
        GROUP BY s.id
    `;
    const { rows } = await db.query(query, [submissionId]);
    const submission = rows[0];

    if (!submission) throw new Error('Submission not found');

    const questions = submission.questions || [];
    const answers = submission.details?.rawAnswers || {};
    let totalScore = 0, totalMax = 0, mcqScore = 0, subjectiveScore = 0, codingScore = 0, mcqMax = 0, subjectiveMax = 0, codingMax = 0;
    const evaluationDetails = [];

    questions.forEach(q => {
        if (q.type === 'MCQ') {
            const userAnswer = answers[q.id];
            const qMax = q.marks || 1;
            const content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content;
            const isCorrect = userAnswer === content.correct_answer;
            const qScore = isCorrect ? qMax : 0;
            mcqScore += qScore; mcqMax += qMax; totalScore += qScore; totalMax += qMax;
            evaluationDetails.push({ questionId: q.id, type: 'MCQ', passed: isCorrect, score: qScore, max: qMax });
        }
    });

    const evalTasks = [];
    questions.filter(q => q.type === 'SUBJECTIVE').forEach(q => {
        const qMax = q.marks || 4; subjectiveMax += qMax; totalMax += qMax;
        const content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content;
        evalTasks.push((async () => {
            try {
                const prompt = `Evaluate subjective answer: Question: ${content.question}. Answer: ${answers[q.id] || ''}. Output JSON: { "similarity_percentage": number, "reasoning_summary": "string", "reference_answer": "string", "ai_forensics_score": number }`;
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
        const content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content;
        
        evalTasks.push((async () => {
            const testResults = await Promise.all((content.test_cases || []).map(async (test) => {
                try {
                    const runResult = await pistonService.executeCode(language, code, test.input);
                    return { passed: (runResult.stdout || "").trim() === (test.output || "").trim(), input: test.input };
                } catch (err) { return { passed: false, error: err.message }; }
            }));
            const testsPassed = testResults.filter(r => r.passed).length;
            const qScore = (content.test_cases?.length > 0) ? (testsPassed / content.test_cases.length) * qMax : 0;
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

    try {
        await db.query(
            'UPDATE submissions SET score = $1, result_generated = true, status = $2 WHERE id = $3',
            [finalPercentage, finalStatus, submissionId]
        );
    } catch (updateErr) {
        console.error('[EVAL_DB] Error updating submission:', updateErr.message);
    }

    const resultDetails = { 
        evaluationDetails, 
        sectionScores: { mcq: mcqScore, subjective: subjectiveScore, coding: codingScore }, 
        sectionMaxScores: { mcq: mcqMax, subjective: subjectiveMax, coding: codingMax }, 
        totalPoints: Math.round(totalScore), 
        maxPoints: totalMax, 
        passStatus: finalPercentage >= 50, 
        rawAnswers: answers 
    };

    try {
        await db.query(
            'INSERT INTO results (submission_id, details) VALUES ($1, $2)',
            [submissionId, JSON.stringify(resultDetails)]
        );
    } catch (insertErr) {
        console.error('[EVAL_DB] Error inserting result:', insertErr.message);
    }

    console.log(`[EVAL] Successfully completed evaluateSubmission for ${submissionId}`);
    return { totalScore, finalPercentage };
};

const submitAssessment = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;
        console.log(`[SUBMIT] Initiating submission for ${submissionId}`);
        
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const existingDetails = rows[0]?.details || {};
        const newDetails = { ...existingDetails, rawAnswers: answers };

        await db.query(
            'UPDATE submissions SET details = $1, status = $2, completed_at = NOW() WHERE id = $3',
            [newDetails, 'SUBMITTED', submissionId]
        );
        
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
        const query = `
            SELECT r.*, 
                   json_build_object(
                       'score', s.score, 
                       'status', s.status, 
                       'completed_at', s.completed_at, 
                       'proctoring_violations', s.proctoring_violations,
                       'assessments', json_build_object(
                           'job_id', a.job_id,
                           'jobs', json_build_object('title', j.title)
                       )
                   ) AS submissions
            FROM results r
            JOIN submissions s ON r.submission_id = s.id
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE r.submission_id = $1
        `;
        const { rows } = await db.query(query, [submissionId]);
        const result = rows[0];

        if (!result) return res.status(404).json({ error: 'RESULT_NOT_GENERATED' });
        res.json(result);
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Failed' }); 
    }
};

const logAssessmentViolation = async (req, res) => {
    try {
        const { assessment_id, candidate_id, violation_type, biometrics } = req.body;
        const userId = candidate_id || req.user.id;
        
        const { rows: submissions } = await db.query(
            'SELECT proctoring_violations, id, status FROM submissions WHERE user_id = $1 AND assessment_id = $2',
            [userId, assessment_id]
        );

        const submission = submissions?.find(s => s.status === 'IN_PROGRESS') || submissions?.[0];
        if (!submission) return res.status(404).json({ error: 'No submission found' });
        
        const updatedViolations = [...(typeof submission.proctoring_violations === 'string' ? JSON.parse(submission.proctoring_violations) : (submission.proctoring_violations || [])), { type: violation_type, timestamp: new Date().toISOString(), biometrics: biometrics || null }];
        
        await db.query(
            'UPDATE submissions SET proctoring_violations = $1, status = $2, attempts_left = 0, completed_at = NOW() WHERE id = $3',
            [JSON.stringify(updatedViolations), 'TERMINATED_DUE_TO_VIOLATION', submission.id]
        );
        res.json({ message: 'Violation logged' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const syncSnapshot = async (req, res) => {
    try {
        const { submissionId, snapshotUrl } = req.body;
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const currentDetails = rows[0]?.details || {};
        
        await db.query(
            'UPDATE submissions SET details = $1 WHERE id = $2',
            [{ ...currentDetails, last_snapshot_url: snapshotUrl }, submissionId]
        );
        res.json({ message: 'Snapshot synced' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const syncAnswers = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const currentDetails = rows[0]?.details || {};
        const rawAnswers = currentDetails.rawAnswers || {};

        await db.query(
            'UPDATE submissions SET details = $1 WHERE id = $2',
            [{ ...currentDetails, rawAnswers: { ...rawAnswers, ...answers } }, submissionId]
        );
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
        
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const currentDetails = rows[0]?.details || {};
        
        await db.query(
            'UPDATE submissions SET details = $1 WHERE id = $2',
            [{ ...currentDetails, last_snapshot_url: publicUrl }, submissionId]
        );
        res.json({ message: 'Snapshot uploaded', publicUrl });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const getPersonalizedQuestions = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const details = rows[0]?.details || {};
        res.json({ personalizedQuestions: details.personalizedQuestions || [] });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

const reportAudioViolation = async (req, res) => {
    try {
        const { submissionId, type, reason } = req.body;
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const currentDetails = rows[0]?.details || {};
        const currentViolations = currentDetails.proctoring_violations || [];
        
        const updatedDetails = { 
            ...currentDetails, 
            proctoring_violations: [...currentViolations, { type: type || 'AUDIO_ANOMALY', reason: reason || 'Multiple voices', timestamp: new Date().toISOString() }] 
        };
        
        await db.query('UPDATE submissions SET details = $1 WHERE id = $2', [updatedDetails, submissionId]);
        res.json({ message: 'Audio violation logged' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { startAssessment, submitAssessment, getResult, logAssessmentViolation, evaluateSubmission, syncSnapshot, syncAnswers, uploadSnapshot, getPersonalizedQuestions, reportAudioViolation };
