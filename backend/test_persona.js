require('dotenv').config({ path: './.env' });
const axios = require('axios');
const pdf = require('pdf-parse');
const aiClient = require('./src/utils/aiClient');

const generatePersonalizedQuestions = async (resumeUrl, jobTitle, jobSkills) => {
    try {
        console.log(`[Test] Downloading PDF from: ${resumeUrl}`);
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        const pdfData = await pdf(response.data);
        const resumeText = pdfData.text;
        console.log(`[Test] PDF Parsed. Content Length: ${resumeText.length}`);

        const prompt = `You are a high-level technical interviewer.
        Candidate Resume Content: ${resumeText.substring(0, 4000)}
        Target Role: ${jobTitle}
        Core Skills: ${jobSkills}

        Rules:
        - Generate exactly 2 subjective questions that link the candidate's SPECIFIC past experience.
        - Output STRICT JSON only.
        - Format: [{"id": "persona_1", "type": "PERSONALIZED", "question": "string", "expected_concepts": ["concept"], "marks": 5}]`;

        console.log(`[Test] Calling AI Model (llama-3.3-70b-versatile)...`);
        const aiResponse = await aiClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4
        });

        const content = aiResponse.choices[0].message.content;
        console.log(`[Test] AI Raw Response:`, content);
        
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[Test] Parsed Successfully! Found ${parsed.length} questions.`);
        return parsed;

    } catch (error) {
        console.error('[Test] FAILED:', error.message);
        if (error.response) console.error('[Test] Axios Error Data:', error.response.data);
        return [];
    }
};

// Use the resume from the candidate dashboard if possible, or a sample
const TEST_RESUME = 'https://fztiwifqmnmkcmhyoogv.supabase.co/storage/v1/object/public/resumes/b418660f-a767-4d1d-b169-c36696c3c707_1774028405329_Pratham_AurisResume1.pdf'; 

generatePersonalizedQuestions(TEST_RESUME, 'Software Engineer', 'React, Node.js, JavaScript');
