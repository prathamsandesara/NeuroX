const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Generate assessment (Recruiter)
router.post('/generate', roleMiddleware('RECRUITER', 'ADMIN'), assessmentController.generateAssessment);

// Get assessment (Candidate taking it, Recruiter viewing it)
router.get('/:assessmentId', assessmentController.getAssessment);

// Submit code (Candidate)
router.post('/submit-code', roleMiddleware('CANDIDATE'), assessmentController.submitCode);

// Security Dashboard Routes (Admin/Recruiter Only)
const securityController = require('../controllers/securityController');
router.get('/security/events', roleMiddleware('ADMIN', 'RECRUITER'), securityController.getSecurityEvents);
router.get('/security/metrics', roleMiddleware('ADMIN', 'RECRUITER'), securityController.getSecurityMetrics);

module.exports = router;
