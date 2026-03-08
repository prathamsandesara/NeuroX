const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * RECRUITER (Consolidated) Routes
 * Accessible by RECRUITER and ADMIN roles
 */
router.use(authMiddleware);
router.use(roleMiddleware('RECRUITER', 'ADMIN', 'HR')); // Keeping HR for legacy compatibility during migration

// --- Job & Assessment Management ---
router.post('/generate-assessment', recruiterController.triggerAssessmentGeneration);
router.post('/generate-results', recruiterController.triggerResultGeneration);
router.post('/add-coding-question', recruiterController.addManualCodingQuestion);

// --- Candidate & Result Management (Merged from HR) ---
router.get('/candidates', recruiterController.getCandidates);
router.get('/candidates/:submissionId', recruiterController.getCandidateDetail);
router.get('/stats', recruiterController.getRecruiterStats);
router.post('/reset-attempt', recruiterController.resetAttempt);

module.exports = router;
