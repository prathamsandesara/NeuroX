const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendEmail = async ({ to, subject, htmlContent }) => {
    const payload = {
        sender: {
            email: process.env.EMAIL_SENDER || "noreply@neurox.com",
            name: "NeuroX"
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
    };


    try {
        const response = await axios.post(BREVO_API_URL, payload, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { sendEmail };
