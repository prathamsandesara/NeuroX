const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController'); // Oops, need to create this file... oh wait, I did create it.
// I named it submissionController.js in previous step.

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware('CANDIDATE'), submissionController.submitAssessment);
router.post('/start', roleMiddleware(['CANDIDATE', 'RECRUITER', 'ADMIN']), submissionController.startAssessment);
router.post('/sync', roleMiddleware(['CANDIDATE', 'RECRUITER', 'ADMIN']), submissionController.syncAnswers);
router.post('/snapshot', roleMiddleware(['CANDIDATE', 'RECRUITER', 'ADMIN']), submissionController.syncSnapshot);
router.post('/upload-snapshot', roleMiddleware(['CANDIDATE', 'RECRUITER', 'ADMIN']), submissionController.uploadSnapshot);
router.post('/violation', roleMiddleware(['CANDIDATE', 'RECRUITER', 'ADMIN']), submissionController.logAssessmentViolation);
router.post('/audio-violation', roleMiddleware(['CANDIDATE']), submissionController.reportAudioViolation);
router.get('/:submissionId/personalized', submissionController.getPersonalizedQuestions);
router.get('/:submissionId/result', submissionController.getResult);

module.exports = router;
