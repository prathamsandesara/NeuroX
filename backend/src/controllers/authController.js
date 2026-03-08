const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');
const crypto = require('crypto');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists - using maybeSingle to avoid PGRST116 error if not found
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        // Capture Fingerprinting Data
        const security_metadata = {
            ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            user_agent: req.headers['user-agent'] || 'UNKNOWN_CLIENT',
            registered_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password_hash: passwordHash,
                    role: role || 'CANDIDATE',
                    is_verified: false,
                    otp_hash: otpHash,
                    security_metadata: security_metadata // Using a clean, explicit column name
                }
            ]);

        if (error) throw error;

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

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

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

        const { error } = await supabase
            .from('users')
            .update({ is_verified: true, otp_hash: null })
            .eq('id', user.id);

        if (error) throw error;

        res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, deviceFingerprint } = req.body;

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Account not verified' });
        }

        // --- LOCKOUT CHECK ---
        const currentMeta = user.security_metadata || {};
        const lockoutUntil = currentMeta.lockout_until ? new Date(currentMeta.lockout_until) : null;
        if (lockoutUntil && lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((lockoutUntil - new Date()) / 60000);
            return res.status(429).json({ error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).` });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

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
            supabase.from('users').update({ security_metadata: updatedMeta }).eq('id', user.id).then();
            return res.status(401).json({ error: `Invalid credentials. ${5 - failedAttempts > 0 ? (5 - failedAttempts) + ' attempts remaining before lockout.' : 'Account locked.'}` });
        }

        // --- SUCCESSFUL LOGIN: Capture full security fingerprint ---
        const loginEvent = {
            ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
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

        supabase.from('users').update({ security_metadata: updatedSecurityMeta }).eq('id', user.id).then();

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
        const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await supabase.from('password_reset_tokens').insert({
            user_id: user.id,
            token: token,
            expires_at: expiresAt.toISOString()
        });

        const resetLink = `${process.env.FRONTEND_URL} / reset - password / ${token}`;
        await sendEmail({
            to: email,
            subject: 'Reset Password',
            htmlContent: `< p > Click here to reset: <a href="${resetLink}">${resetLink}</a></p > `
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

        const { data: resetToken } = await supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token' });

        const hash = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ password_hash: hash }).eq('id', resetToken.user_id);
        await supabase.from('password_reset_tokens').delete().eq('id', resetToken.id);

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

const getMe = (req, res) => {
    // req.user is populated by authMiddleware
    res.json({ user: req.user });
};

module.exports = {
    register,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
    logout,
    getMe
};
