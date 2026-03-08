const express = require('express');
const router = express.Router();
const integrityController = require('../controllers/integrityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/evaluate', integrityController.evaluateIntegrity);

module.exports = router;
