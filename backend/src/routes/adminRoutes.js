const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only ADMIN can access forensic data
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/forensics', adminController.getForensicLogs);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getSystemStats);
router.post('/audit', adminController.logAudit);

module.exports = router;
