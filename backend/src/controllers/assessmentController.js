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
    
    // NEW: Use configurable counts if they exist in the distribution JSON, else default
    const dist = assessment.assessment_distribution || {};
    const mcq_count = dist.mcq_count || assessment.mcq_count || 3;
    const subjective_count = dist.subjective_count || assessment.subjective_count || 2;
    const coding_count = dist.coding_count || assessment.coding_count || 1;

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
- Output ${mcq_count} MCQ questions.
- Each question must have 4 options and 1 correct answer (A/B/C/D).
- Do NOT include explanations
- Do NOT include the A/B/C/D options inside the 'question' string. The 'question' field should ONLY contain the question text.
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
- Output ${subjective_count} subjective questions.
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
        const seed = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const prompt = `You are a coding assessment generator.
        Difficulty Level: ${difficulty}
        Role Reference: ${role}
        RANDOM_SEED: ${seed}

        Rules:
        - Generate one UNIQUE DSA coding problem (LeetCode Style).
        - IMPORTANT: Do NOT repeat common problems like 'Two Sum' or 'Reverse String'. 
        - Use the RANDOM_SEED to ensure variety. Select from topics: ${['Graphs', 'DP', 'Heaps', 'Backtracking', 'Segment Trees'][Math.floor(Math.random() * 5)]} or similar advanced areas if difficulty is high.
        - Output STRICT JSON only.
        - Marking: 10 marks total.
        - No boilerplate code.
        - Output ${coding_count} coding problem(s).
        - Include exactly 8-10 test cases in total. Only the first 3 will be shown to the candidate.

        Output Format:
        {
          "type": "CODING",
          "topic": "string", 
          "problem_statement": "string",
          "input_format": "string",
          "output_format": "string",
          "constraints": "string",
          "sample_input": "string",
          "sample_output": "string",
          "test_cases": [{"input": "string", "output": "string"}],
          "marks": 10
        }`;

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

        if (codingResult) {
            const codingArray = Array.isArray(codingResult) ? codingResult : [codingResult];
            codingArray.forEach(c => {
                const sanitizedCoding = {
                    ...c,
                    problem_statement: c.problem_statement || "Problem statement missing.",
                    test_cases: Array.isArray(c.test_cases) ? c.test_cases : []
                };

                questionsToInsert.push({
                    assessment_id: assessment.id,
                    type: 'CODING',
                    content: sanitizedCoding,
                    marks: c.marks || 10,
                    topic: c.topic || 'General',
                    difficulty
                });
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
