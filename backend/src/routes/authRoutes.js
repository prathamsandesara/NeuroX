const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/delete-resume', require('../middleware/authMiddleware'), authController.deleteResume);
router.get('/me', require('../middleware/authMiddleware'), authController.getMe);

module.exports = router;
