const aiClient = require('../utils/aiClient');
const supabase = require('../config/supabase');
const pistonService = require('../services/pistonService');

const internalGenerateAssessment = async (jobId) => {
    // 1. Fetch Job and Assessment Metadata
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*, assessments(*)')
        .eq('id', jobId)
        .single();

    if (jobError || !job) throw new Error('Job not found');

    const assessment = job.assessments ? job.assessments[0] : null;
    if (!assessment) throw new Error('Assessment structure not found for job');

    const skills = Array.isArray(job.skills) ? job.skills : [];
    const difficulty = job.difficulty_level || 'INTERMEDIATE';
    const role = job.title;

    // Helper for Groq Safe Parsing
    const getCleanJson = (content) => {
        try {
            console.log('--- RAW AI RESPONSE ---');
            console.log(content);
            console.log('-----------------------');

            const jsonMatch = content.match(/```json?\s*([\s\S]*?)\s*```/);
            let extracted = jsonMatch ? jsonMatch[1].trim() : content.trim();

            // More aggressive cleanup for weird LLM formatting
            const cleaned = extracted
                .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
                .replace(/\\"/g, '§§') // Temporarily hide escaped quotes
                .replace(/"([^"]*?)"/g, (match, p1) => {
                    // Replace literal newlines and tabs only inside quoted strings
                    return `"${p1.replace(/\n/g, '\\n').replace(/\t/g, '    ').replace(/\r/g, '')}"`;
                })
                .replace(/§§/g, '\\"'); // Restore escaped quotes

            return JSON.parse(cleaned);
        } catch (e) {
            console.error('JSON Parsing Error:', e.message);
            console.error('Problematic Content:', content);
            throw new Error('FAILED_TO_PARSE_AI_PAYLOAD');
        }
    };

    // 2. Generation Logic per Type (using Parallel execution)
    const generateMCQs = async () => {
        const skillNames = skills.map(s => s.skill_name).join(', ');
        const prompt = `You are an assessment content generator.
Input:
Role: ${role}
Target Skills: ${skillNames}
Difficulty: ${difficulty}

Rules:
- STRICTLY DSA-BASED. Only use these topics: Arrays, Double Linked List, Binary Search Tree, Heap, Graph Algorithms, Dynamic Programming, Greedy Algorithms, Bit Manipulation.
- Output 3 MCQ questions.
- Each question must have 4 options and 1 correct answer (A/B/C/D).
- Do NOT include explanations
- Output STRICTLY valid JSON array
- Marking: Each question is worth 1 mark
- IMPORTANT: Use \\n for newlines in strings. No literal newlines.

Output Format:
[
  {
    "question": "string",
    "topic": "topic_name",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "correct_answer": "A"
  }
]`;
        const response = await aiClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });
        return getCleanJson(response.choices[0].message.content);
    };

    const generateSubjective = async () => {
        const skillNames = skills.map(s => s.skill_name).join(', ');
        const prompt = `You are a technical interviewer creating subjective questions.
Role: ${role}
Skills: ${skillNames}
Difficulty: ${difficulty}

Rules:
- STRICTLY DSA-BASED. Only use these topics: Time/Space Complexity, System Design Patterns (related to DSA), Memory Allocation, Recursion Depth, Tree/Graph Traversal Trade-offs.
- Output 2 subjective questions.
- Test reasoning, trade-offs, and decision making
- Output STRICT JSON only
- Marking: Each question is worth 4 marks
- IMPORTANT: Use \\n for newlines in strings. No literal newlines.

Output Format:
[
  {
    "type": "SUBJECTIVE",
    "question": "string",
    "expected_concepts": ["concept1", "concept2"],
    "marks": 4
  }
]`;

        const response = await aiClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });
        return getCleanJson(response.choices[0].message.content);
    };

    const generateCoding = async () => {
        const prompt = `You are a coding assessment generator specializing in professional high-level evaluation.
Base Problem: Solve a Data Structures and Algorithms (DSA) problem. This is a general technical assessment independent of the specific job role.
Difficulty Level: ${difficulty}

Rules:
- STRICTLY DSA-BASED. Focus on classic algorithmic challenges (e.g., Arrays, Strings, Hashing, Stack, Queue, Linked List, Trees, Graphs, Recursion, Dynamic Programming).
- The problem must be professional and standardized (LeetCode style).
- Ensure it is problem-solving oriented, NOT language trivia.
- Output STRICT JSON only.
- Marking: 10 marks total.
- IMPORTANT: Use \\n for newlines in strings. No literal newlines.
- NO BOILERPLATE: Do NOT generate starter code or function signatures. Candidate starts with an empty editor.

Output Format:
{
  "type": "CODING",
  "topic": "Arrays|Strings|Hashing|...", 
  "problem_statement": "string",
  "input_format": "string",
  "output_format": "string",
  "constraints": "string",
  "sample_input": "string",
  "sample_output": "string",
  "test_cases": [{"input": "string", "output": "string"}],
  "marks": 10
}
Include exactly 8-10 test cases in total. Only the first 3 will be shown to the candidate.`;

        const response = await aiClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });
        return getCleanJson(response.choices[0].message.content);
    };

    try {
        const [mcqResult, subjectiveResult, codingResult] = await Promise.all([
            generateMCQs(),
            generateSubjective(),
            generateCoding()
        ]);

        // 3. Validation & Store Questions
        const questionsToInsert = [];
        
        if (Array.isArray(mcqResult)) {
            mcqResult.forEach(q => questionsToInsert.push({ assessment_id: assessment.id, type: 'MCQ', content: q, marks: 1, difficulty }));
        }
        
        if (Array.isArray(subjectiveResult)) {
            subjectiveResult.forEach(q => questionsToInsert.push({ assessment_id: assessment.id, type: 'SUBJECTIVE', content: q, marks: 4, difficulty }));
        }

        if (codingResult && typeof codingResult === 'object') {
            // Ensure codingResult has mandatory fields
            const sanitizedCoding = {
                ...codingResult,
                problem_statement: codingResult.problem_statement || "Problem statement missing.",
                test_cases: Array.isArray(codingResult.test_cases) ? codingResult.test_cases : []
            };

            questionsToInsert.push({
                assessment_id: assessment.id,
                type: 'CODING',
                content: sanitizedCoding,
                marks: codingResult.marks || 10,
                topic: codingResult.topic || 'General',
                difficulty
            });
        }

        if (questionsToInsert.length === 0) {
            throw new Error('No valid questions were generated by the AI.');
        }

        const { error: insertError } = await supabase.from('questions').insert(questionsToInsert);
        if (insertError) {
            console.error('[DATABASE_INSERT_ERROR]:', insertError.message);
            throw insertError;
        }

        return questionsToInsert.length;
    } catch (err) {
        console.error('Groq Generation/DB Insert Failure:', err.message);
        throw err;
    }
};

const generateAssessment = async (req, res) => {
    try {
        const { jobId } = req.body;
        const count = await internalGenerateAssessment(jobId);
        res.json({ message: 'Assessment generated successfully', generated_count: count });
    } catch (error) {
        console.error('Assessment Gen Error:', error.message);
        res.status(error.message === 'Job not found' || error.message === 'Assessment structure not found for job' ? 404 : 500)
            .json({ error: error.message });
    }
};

const getAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        console.log(`[Assessment] Fetching questions for Assessment_ID: ${assessmentId} `);

        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .eq('assessment_id', assessmentId);

        if (error) {
            console.error('[Assessment] Supabase Error:', error);
            throw error;
        }

        console.log(`[Assessment] Found ${questions?.length || 0} questions.`);
        res.json(questions);
    } catch (error) {
        console.error('[Assessment] Fetch Failure:', error.message);
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
}

const submitCode = async (req, res) => {
    // Piston API integration
    try {
        const { source_code, language_id, test_cases } = req.body;

        // language_id is likely a string now (e.g., 'javascript', 'python')
        // Default to 'javascript' if not provided or if it was the old ID 63
        let language = language_id;
        if (!language || language === 63 || language === '63') {
            language = 'javascript';
        }

        const results = [];
        for (const test of test_cases) {
            try {
                // Execute code via Piston
                const runResult = await pistonService.executeCode(language, source_code, test.input); // test.input is stdin

                // Compare with expected output (trimming for safety)
                const actualOutput = (runResult.stdout || "").trim();
                const stderr = (runResult.stderr || "").trim();
                const expectedOutput = (test.output || '').trim();

                results.push({
                    input: test.input,
                    expected_output: expectedOutput,
                    actual_output: actualOutput,
                    stderr: stderr,
                    passed: actualOutput === expectedOutput
                });
            } catch (err) {
                console.error(`Error running test case: ${err.message} `);
                results.push({
                    input: test.input,
                    error: 'Execution failed',
                    passed: false
                });
            }
        }

        res.json({ results });
    } catch (error) {
        console.error("Code Execution Error", error);
        res.status(500).json({ error: 'Coding submission failed' });
    }
};

module.exports = { generateAssessment, getAssessment, submitCode, internalGenerateAssessment };
