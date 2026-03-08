const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Recruiters can parse, both recruiters and candidates can view
router.post('/parse', roleMiddleware('RECRUITER', 'ADMIN'), jobController.parseJD);
router.get('/', roleMiddleware('RECRUITER', 'ADMIN', 'CANDIDATE'), jobController.getJobs);

module.exports = router;
