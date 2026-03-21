const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for PDF only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit for snapshots
    }
});

// Protect all routes
router.use(authMiddleware);

router.post('/resume', upload.single('resume'), candidateController.uploadResume);
router.post('/snapshot', imageUpload.single('snapshot'), candidateController.uploadSnapshot);
router.get('/profile', candidateController.getProfile);

module.exports = router;
