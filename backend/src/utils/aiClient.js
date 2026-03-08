const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Debug log for checking key configuration
console.log('--- Groq Connectivity Check ---');
if (process.env.GROQ_API_KEY) {
    const key = process.env.GROQ_API_KEY;
    console.log(`[Groq] API Key detected: ${key.substring(0, 7)}...${key.substring(key.length - 4)}`);
} else {
    console.warn('[Groq] CRITICAL_ERROR: API Key is missing in environment variables.');
}
console.log('---------------------------------');

module.exports = groq;
