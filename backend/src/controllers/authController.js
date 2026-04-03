const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');
const crypto = require('crypto');
const { logSecurityEvent } = require('../services/auditService');

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const { rows: existingUsers } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        // Capture Fingerprinting Data
        const security_metadata = {
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'UNKNOWN',
            user_agent: req.headers['user-agent'] || 'UNKNOWN_CLIENT',
            registered_at: new Date().toISOString()
        };

        await db.query(
            `INSERT INTO users (email, password_hash, role, is_verified, otp_hash, security_metadata) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [email, passwordHash, role || 'CANDIDATE', false, otpHash, security_metadata]
        );

        console.log('-----------------------------------------');
        console.log(`[AUTH] REGISTRATION SUCCESS: ${email}`);
        console.log(`[AUTH] ROLE: ${role || 'CANDIDATE'}`);
        console.log(`[AUTH] OTP: ${otp}`);
        console.log('-----------------------------------------');

        // Non-blocking email send
        sendEmail({
            to: email,
            subject: 'Verify your NeuroX Account',
            htmlContent: `<p>Your OTP is: <strong>${otp}</strong></p>`
        }).catch(err => console.error('Email sending failed (non-blocking error):', err.message));

        res.status(201).json({ message: 'User registered. Please check email for OTP.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration: ' + (error.message || 'Unknown Error') });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        const isValid = await bcrypt.compare(otp, user.otp_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        await db.query('UPDATE users SET is_verified = true, otp_hash = null WHERE id = $1', [user.id]);

        res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, deviceFingerprint } = req.body;

        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        console.log(`[AUTH_DEBUG] Login attempt for: ${email}`);

        if (!user) {
            console.warn(`[AUTH_DEBUG] User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            console.warn(`[AUTH_DEBUG] User not verified: ${email}`);
            return res.status(403).json({ error: 'Account not verified' });
        }

        // --- LOCKOUT CHECK ---
        const currentMeta = user.security_metadata || {};
        const lockoutUntil = currentMeta.lockout_until ? new Date(currentMeta.lockout_until) : null;
        if (lockoutUntil && lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((lockoutUntil - new Date()) / 60000);
            await logSecurityEvent('LOGIN_LOCKED', user.id, email, req.ip || req.headers['x-forwarded-for'], req.headers['user-agent'], { minutesLeft }, 'CRITICAL');
            return res.status(429).json({ error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).` });
        }

        console.log(`[AUTH_DEBUG] Attempting password compare for ${email}`);
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`[AUTH_DEBUG] Password match for ${email}: ${isMatch}`);

        // --- FAILED LOGIN ---
        if (!isMatch) {
            const failedAttempts = (currentMeta.failed_attempts || 0) + 1;
            const updatedMeta = {
                ...currentMeta,
                failed_attempts: failedAttempts,
                last_failed_at: new Date().toISOString(),
                last_failed_ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            };
            if (failedAttempts >= 5) {
                updatedMeta.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                updatedMeta.failed_attempts = 0;
            }
            db.query('UPDATE users SET security_metadata = $1 WHERE id = $2', [updatedMeta, user.id]).catch(console.error);
            await logSecurityEvent('LOGIN_FAILED', user.id, email, req.ip || req.headers['x-forwarded-for'], req.headers['user-agent'], { failedAttempts }, failedAttempts >= 5 ? 'CRITICAL' : 'MEDIUM');
            return res.status(401).json({ 
                error: `Invalid credentials. ${5 - failedAttempts > 0 ? (5 - failedAttempts) + ' attempts remaining before lockout.' : 'Account locked.'}`,
                suggestion: "If you've forgotten your password, please use the 'Forgot Password' link on the login page to securely reset it."
            });
        }

        // --- SUCCESSFUL LOGIN: Capture full security fingerprint ---
        const loginEvent = {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'UNKNOWN',
            user_agent: req.headers['user-agent'] || 'UNKNOWN_CLIENT',
            timestamp: new Date().toISOString(),
            device_fingerprint: deviceFingerprint || null,
        };

        const loginHistory = currentMeta.login_history || [];
        loginHistory.unshift(loginEvent); // prepend latest first
        if (loginHistory.length > 10) loginHistory.pop(); // keep last 10 only

        const updatedSecurityMeta = {
            ...currentMeta,
            failed_attempts: 0,
            lockout_until: null,
            ip_address: loginEvent.ip,
            user_agent: loginEvent.user_agent,
            last_login_at: loginEvent.timestamp,
            device_fingerprint: loginEvent.device_fingerprint,
            login_history: loginHistory,
        };

        db.query('UPDATE users SET security_metadata = $1 WHERE id = $2', [updatedSecurityMeta, user.id]).catch(console.error);

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        await logSecurityEvent('LOGIN_SUCCESS', user.id, email, req.ip || req.headers['x-forwarded-for'], req.headers['user-agent'], { role: user.role }, 'LOW');

        res.status(200).json({
            message: 'Logged in successfully',
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        const user = rows[0];
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt.toISOString()]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await sendEmail({
            to: email,
            subject: 'Reset Password',
            htmlContent: `<p>Click here to reset: <a href="${resetLink}">${resetLink}</a></p>`
        });

        res.json({ message: 'Reset link sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending reset email' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const { rows } = await db.query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > $2',
            [token, new Date().toISOString()]
        );
        const resetToken = rows[0];

        if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token' });

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, resetToken.user_id]);
        await db.query('DELETE FROM password_reset_tokens WHERE id = $1', [resetToken.id]);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error resetting password' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        delete user.password_hash;
        
        res.json({ user });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

const deleteResume = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('UPDATE users SET resume_url = null WHERE id = $1', [userId]);
        
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resume' });
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
    logout,
    getMe,
    deleteResume
};
