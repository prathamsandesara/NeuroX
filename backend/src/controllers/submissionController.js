const supabase = require('../config/supabase');
const pistonService = require('../services/pistonService');
const aiClient = require('../utils/aiClient');

const startAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.body;
        const user_id = req.user.id;

        // Check for existing attempts
        const { data: existing, error: fetchErr } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user_id)
            .eq('assessment_id', assessmentId);

        if (fetchErr) throw fetchErr;

        // Find an active attempt or the most recent one if multiple exist (though ideally there should be one)
        const activeAttempt = existing.find(sub => sub.status === 'IN_PROGRESS') || existing[0];

        if (activeAttempt) {
            if (activeAttempt.status === 'COMPLETED' || activeAttempt.status === 'SUBMITTED' || activeAttempt.status === 'TERMINATED_DUE_TO_VIOLATION' || activeAttempt.attempts_left <= 0) {
                return res.status(403).json({ error: 'Assessment already attempted. No further attempts allowed.' });
            }
            // If in progress, resume
            return res.json({ submissionId: activeAttempt.id, isResumed: true });
        }

        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .insert([{
                user_id,
                assessment_id: assessmentId,
                status: 'IN_PROGRESS',
                attempts_left: 1
            }])
            .select()
            .single();

        if (subError) throw subError;
        res.json({ submissionId: submission.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const evaluateSubmission = async (submissionId) => {
    // 1. Fetch Submission and Questions
    const { data: submission, error: subErr } = await supabase
        .from('submissions')
        .select('*, assessments(questions(*))')
        .eq('id', submissionId)
        .single();

    if (subErr || !submission) throw new Error('Submission not found');

    const questions = submission.assessments.questions;
    const answers = submission.details?.rawAnswers || {};

    let totalScore = 0;
    let totalMax = 0;
    let mcqScore = 0;
    let subjectiveScore = 0;
    let codingScore = 0;
    let mcqMax = 0;
    let subjectiveMax = 0;
    let codingMax = 0;
    const evaluationDetails = [];

    for (const q of questions) {
        const userAnswer = answers[q.id];
        const type = q.type;
        const content = q.content;
        const qMax = q.marks || (type === 'MCQ' ? 1 : type === 'SUBJECTIVE' ? 4 : 10);
        let qScore = 0;

        if (type === 'MCQ') {
            const isCorrect = userAnswer === content.correct_answer;
            qScore = isCorrect ? qMax : 0;
            mcqScore += qScore;
            mcqMax += qMax;
            evaluationDetails.push({ questionId: q.id, type, passed: isCorrect, score: qScore, max: qMax });
        }
        else if (type === 'SUBJECTIVE') {
            subjectiveMax += qMax;
            try {
                // AI Evaluation for Subjective with Partial Grading Logic
                const prompt = `Evaluate the following subjective answer for a technical assessment.
                Question: ${content.question}
                Expected Concepts: ${content.expected_concepts?.join(', ')}
                Candidate Answer: ${userAnswer || 'NO_ANSWER_PROVIDED'}

                Instructions:
                - Compare the candidate's answer with the expected concepts.
                - Award a similarity_percentage (0-100) based on how many concepts are correctly addressed.
                - Be flexible with formatting, spelling, and phrasing. If the core idea is there, give credit.
                - If the answer matches partially, provide a score reflecting that partial correctness.
                - Provide a reasoning_summary explaining why the specific score was given.
                - Also provide a 'reference_answer' which is a perfect concise response for the HR to see.

                Output Format (Strict JSON):
                {
                  "similarity_percentage": number,
                  "reasoning_summary": "string",
                  "reference_answer": "string"
                }`;

                const response = await aiClient.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1
                });

                const aiContent = response.choices[0].message.content;
                const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('AI returned invalid format');

                const aiResult = JSON.parse(jsonMatch[0]);
                qScore = (aiResult.similarity_percentage / 100) * qMax;
                subjectiveScore += qScore;
                evaluationDetails.push({
                    questionId: q.id,
                    type,
                    score: qScore,
                    max: qMax,
                    ai_analysis: aiResult,
                    reference_answer: aiResult.reference_answer
                });
            } catch (err) {
                console.error('Subjective AI Eval Error:', err.message);
                evaluationDetails.push({ questionId: q.id, type, score: 0, max: qMax, error: 'AI Evaluation failed' });
            }
        }
        else if (type === 'CODING') {
            codingMax += qMax;
            let testsPassed = 0;
            const testCases = content.test_cases || [];
            const testResults = [];

            const code = typeof userAnswer === 'object' ? userAnswer.code : userAnswer;
            const language = typeof userAnswer === 'object' ? (userAnswer.lang || 'python') : 'python';

            for (const test of testCases) {
                try {
                    const runResult = await pistonService.executeCode(language, code, test.input);
                    const cleanOutput = (runResult.stdout || "").trim();
                    const expected = (test.output || "").trim();
                    const passed = cleanOutput === expected;
                    if (passed) testsPassed++;
                    testResults.push({ passed, input: test.input });
                } catch (err) {
                    testResults.push({ passed: false, error: err.message });
                }
            }

            qScore = testCases.length > 0 ? (testsPassed / testCases.length) * qMax : 0;
            codingScore += qScore;

            // Generate Reference Code using AI for HR comparison
            let referenceCode = "";
            try {
                const codePrompt = `Generate a clean, optimized reference solution for the following coding problem.
                Problem: ${content.problem_statement}
                Input Format: ${content.input_format}
                Output Format: ${content.output_format}
                Language: ${language}

                Return ONLY the source code. No explanations.`;

                const codeResponse = await aiClient.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: codePrompt }],
                    temperature: 0.1
                });
                referenceCode = codeResponse.choices[0].message.content.trim().replace(/```[a-z]*\n|```/g, "");
            } catch (aiErr) {
                console.error("AI Reference Code Gen Error:", aiErr.message);
            }

            evaluationDetails.push({
                questionId: q.id,
                type,
                score: qScore,
                max: qMax,
                testResults,
                reference_code: referenceCode
            });
        }

        totalScore += qScore;
        totalMax += qMax;
    }

    const finalPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const finalStatus = submission.status === 'TERMINATED_DUE_TO_VIOLATION' ? 'TERMINATED_DUE_TO_VIOLATION' : 'COMPLETED';

    // Update Submission & Create Result
    await supabase.from('submissions').update({
        score: finalPercentage,
        result_generated: true,
        status: finalStatus
    }).eq('id', submissionId);

    // CRITICAL: Include rawAnswers in results so HR dashboard can display them
    await supabase.from('results').insert([{
        submission_id: submissionId,
        details: {
            evaluationDetails,
            sectionScores: { mcq: mcqScore, subjective: subjectiveScore, coding: codingScore },
            sectionMaxScores: { mcq: mcqMax, subjective: subjectiveMax, coding: codingMax },
            totalPoints: Math.round(totalScore),
            maxPoints: totalMax,
            passStatus: finalPercentage >= 50,
            rawAnswers: answers // Added rawAnswers to fix NO_RESPONSE_CAPTURED
        }
    }]);

    return { totalScore, finalPercentage };
};

const submitAssessment = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;

        // Save raw answers first
        const { error: updateErr } = await supabase
            .from('submissions')
            .update({
                details: { rawAnswers: answers },
                status: 'SUBMITTED', // New status to indicate answers are in but not yet processed
                completed_at: new Date()
            })
            .eq('id', submissionId);

        if (updateErr) throw updateErr;

        // Auto-evaluate immediately so candidate can see results
        // Use try-catch here so the submission itself doesn't fail if AI evaluation has an issue
        try {
            await evaluateSubmission(submissionId);
        } catch (evalErr) {
            console.error('Auto-Evaluation Error:', evalErr.message);
        }

        res.json({ message: 'Assessment submitted and evaluated successfully.' });
    } catch (error) {
        console.error('Submission Error:', error.message);
        res.status(500).json({ error: 'Failed to submit assessment' });
    }
};

const getResult = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { data: result, error } = await supabase
            .from('results')
            .select('*, submissions(score, status, completed_at, proctoring_violations, assessments(job_id, jobs(title)))')
            .eq('submission_id', submissionId)
            .single();

        if (error) throw error;
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch result' });
    }
};

const logAssessmentViolation = async (req, res) => {
    try {
        const { assessment_id, candidate_id, violation_type, auto_submitted, biometrics } = req.body;
        const userId = candidate_id || req.user.id;

        console.log(`[VIOLATION] User: ${req.user.email} | Type: ${violation_type} | Assessment: ${assessment_id}`);

        // Fetch current submission
        const { data: submissions, error: fetchErr } = await supabase
            .from('submissions')
            .select('proctoring_violations, id, status')
            .eq('user_id', userId)
            .eq('assessment_id', assessment_id);

        if (fetchErr) {
            console.error('[VIOLATION] Fetch error:', fetchErr);
            throw fetchErr;
        }

        console.log(`[VIOLATION] Found ${submissions?.length || 0} submissions for user ${userId}`);

        // Find the active submission or the most recent one
        const submission = submissions?.find(s => s.status === 'IN_PROGRESS') || submissions?.[0];

        if (!submission) {
            console.error(`[VIOLATION] No submission found for user ${userId}, assessment ${assessment_id}`);
            return res.status(404).json({ error: 'No submission found for violation logging' });
        }

        console.log(`[VIOLATION] Logging on submission ${submission.id}, current violations: ${submission.proctoring_violations?.length || 0}`);

        const updatedViolations = [...(submission.proctoring_violations || []), {
            type: violation_type,
            timestamp: new Date().toISOString(),
            auto_submitted,
            biometrics: biometrics || null  // ← save biometrics with the violation
        }];

        const { error: updateErr } = await supabase
            .from('submissions')
            .update({
                proctoring_violations: updatedViolations,
                status: 'TERMINATED_DUE_TO_VIOLATION',
                attempts_left: 0,
                completed_at: new Date()
            })
            .eq('id', submission.id);

        if (updateErr) {
            console.error('[VIOLATION] Update error:', updateErr);
            throw updateErr;
        }

        console.log(`[VIOLATION] ✅ Successfully logged. Total violations: ${updatedViolations.length}`);
        res.json({ message: 'Violation logged and session terminated' });
    } catch (error) {
        console.error('Violation Log Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { startAssessment, submitAssessment, getResult, logAssessmentViolation, evaluateSubmission };
