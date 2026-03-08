const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Debug log for checking key configuration
console.log('--- OpenAI Connectivity Check ---');
if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    console.log(`[OpenAI] API Key detected: ${key.substring(0, 7)}...${key.substring(key.length - 4)}`);
} else {
    console.warn('[OpenAI] CRITICAL_ERROR: API Key is missing in environment variables.');
}
console.log('---------------------------------');

module.exports = openai;
