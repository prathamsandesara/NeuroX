const axios = require('axios');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

const languageMap = {
    'cpp': { language: 'cpp', version: '*' },
    'python': { language: 'python', version: '*' },
    'javascript': { language: 'javascript', version: '*' },
    'java': { language: 'java', version: '*' },
    'c': { language: 'c', version: '*' },
    // Fallback or additional mappings
    'node': { language: 'javascript', version: '*' },
    'js': { language: 'javascript', version: '*' },
    'py': { language: 'python', version: '*' }
};

const executeCode = async (language, sourceCode, stdin = '') => {
    // Normalize language input
    const langKey = String(language).toLowerCase();
    const config = languageMap[langKey];

    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const payload = {
        language: config.language,
        version: config.version,
        files: [
            {
                content: sourceCode
            }
        ],
        stdin: stdin
    };

    try {
        const response = await axios.post(PISTON_API_URL, payload);
        // The user specifically wants the 'run' object: { stdout, stderr, code, time }
        if (response.data && response.data.run) {
            return response.data.run;
        }
        throw new Error('Invalid Piston API Response');
    } catch (error) {
        console.error('Piston Execution Error:', error.message);
        throw error;
    }
};

module.exports = {
    executeCode
};
