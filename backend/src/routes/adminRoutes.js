const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only ADMIN can access forensic data (Except deletion which recruiters need)
router.use(authMiddleware);
// Default to ADMIN for most routes, specific routes can override
router.use(roleMiddleware(['ADMIN', 'RECRUITER', 'HR'])); 

router.get('/forensics', adminController.getForensicLogs);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getSystemStats);
router.post('/audit', adminController.logAudit);
router.post('/reset-attempt', adminController.resetCandidateAttempt);
router.delete('/assessment/:id', adminController.deleteAssessment);

module.exports = router;
