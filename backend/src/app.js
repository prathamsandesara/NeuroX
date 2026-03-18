const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const integrityRoutes = require('./routes/integrityRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Enable trust proxy for correct IP capture (especially in deployment)
app.set('trust proxy', true);

// Security Headers (Helmet)
app.use(helmet());

// General Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict Rate limiting for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased limit to prevent /auth/me from locking out users
    message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Middleware
app.use(cors({
    origin: (origin, callback) => callback(null, true), // Dynamically allow any origin (e.g. localhost, 192.168.x.x) for LAN dev
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/integrity', integrityRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('NeuroX API Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('=== ERROR CAUGHT ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);

    // Handle Multer errors specifically
    if (err.name === 'MulterError') {
        console.error('Multer Error Code:', err.code);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    // Handle custom file filter errors
    if (err.message === 'Only PDF files are allowed!') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;
