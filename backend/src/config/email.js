const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Configure Brevo SDK
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Standardized Premium Email Template for NeuroX
 */
const getPremiumTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #0f172a;
            color: #f8fafc;
            border-radius: 24px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 900;
            color: #14b8a6;
            letter-spacing: -1px;
            margin-bottom: 30px;
            text-transform: uppercase;
            font-style: italic;
        }
        .header {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #ffffff;
        }
        .subheader {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .otp-box {
            background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%);
            border: 1px solid rgba(20, 184, 166, 0.2);
            padding: 40px;
            border-radius: 20px;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
        }
        .otp-code {
            font-size: 48px;
            font-weight: 900;
            color: #14b8a6;
            letter-spacing: 12px;
            margin: 0;
            text-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
        }
        .security-notice {
            color: #ef4444;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">NEUROX_SYSTEMS</div>
        <div class="header">IDENTITY_VERIFICATION</div>
        <div class="subheader">Action Required: Secure Handshake</div>
        
        <div class="otp-box">
            <p style="font-size: 10px; color: #14b8a6; margin-bottom: 15px; text-transform: uppercase; font-weight: 800; letter-spacing: 3px;">Decryption Token</p>
            <h1 class="otp-code">${otp}</h1>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
            Input this code into the terminal to authorize your node access. 
            This token expires in 10 minutes.
        </p>

        <div class="security-notice">
            WARNING: DO NOT SHARE THIS TOKEN WITH ANYONE
        </div>

        <div class="footer">
            &copy; 2024 NEUROX PLATFORM | ADVANCED RECRUITMENT PROTOCOLS<br>
            SECURE_LAYER_V2.5_AUTH
        </div>
    </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, htmlContent, otp }) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    // Use premium template if OTP is provided, otherwise use provided htmlContent
    sendSmtpEmail.htmlContent = otp ? getPremiumTemplate(otp) : htmlContent;
    sendSmtpEmail.sender = {
        name: process.env.EMAIL_SENDER_NAME || "NeuroX Support",
        email: process.env.EMAIL_SENDER_ADDR || "no-reply@neurox.com"
    };
    sendSmtpEmail.to = [{ email: to }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('[EMAIL] SUCCESS: ID', data.messageId);
        return data;
    } catch (error) {
        console.error('[EMAIL] FAILURE:', error.response ? error.response.body : error.message);
        throw error;
    }
};

module.exports = { sendEmail };
