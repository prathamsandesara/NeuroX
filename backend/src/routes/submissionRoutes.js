const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController'); // Oops, need to create this file... oh wait, I did create it.
// I named it submissionController.js in previous step.

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware('CANDIDATE'), submissionController.submitAssessment);
router.post('/start', roleMiddleware('CANDIDATE'), submissionController.startAssessment);
router.post('/sync', roleMiddleware('CANDIDATE'), submissionController.syncAnswers);
router.post('/snapshot', roleMiddleware('CANDIDATE'), submissionController.syncSnapshot);
router.post('/upload-snapshot', roleMiddleware('CANDIDATE'), submissionController.uploadSnapshot);
router.post('/violation', roleMiddleware('CANDIDATE'), submissionController.logAssessmentViolation);
router.get('/:submissionId', submissionController.getResult);

module.exports = router;
