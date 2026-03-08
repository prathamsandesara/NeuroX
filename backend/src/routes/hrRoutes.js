const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All HR routes are protected and restricted to HR/ADMIN roles
router.use(authMiddleware);
router.use(roleMiddleware('HR', 'ADMIN'));

router.get('/candidates', hrController.getCandidates);
router.get('/candidates/:submissionId', hrController.getCandidateDetail);
router.get('/stats', hrController.getHRStats);
router.post('/reset-attempt', hrController.resetAttempt);
router.post('/log-violation', hrController.logProctoringViolation);

module.exports = router;
