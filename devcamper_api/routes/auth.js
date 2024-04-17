const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Me
router.get('/me', protect, getMe);

// Forgot password
router.post('/forgotpassword', forgotPassword);

// Reset password
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;