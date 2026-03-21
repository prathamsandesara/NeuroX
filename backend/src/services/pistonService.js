const axios = require('axios');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

const languageMap = {
    'cpp': { language: 'c++', version: '10.2.0' },
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c': { language: 'c', version: '10.2.0' },
    // Fallback or additional mappings
    'node': { language: 'javascript', version: '18.15.0' },
    'js': { language: 'javascript', version: '18.15.0' },
    'py': { language: 'python', version: '3.10.0' }
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
        console.log(`[Piston] Executing ${config.language} (v${config.version}) on ${PISTON_API_URL}`);
        const response = await axios.post(PISTON_API_URL, payload);
        if (response.data && response.data.run) {
            return response.data.run;
        }
        throw new Error('Invalid Piston API Response');
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('[Piston_Critical] 401 Unauthorized. Using fallback result.');
            return { stdout: "Execution failed (Public API Limit/Auth Required)", stderr: "", code: 1 };
        }
        console.error('Piston Execution Error:', error.message);
        throw error;
    }
};

module.exports = {
    executeCode
};
