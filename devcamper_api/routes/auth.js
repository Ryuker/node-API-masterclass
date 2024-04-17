const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Me
router.get('/me', protect, getMe);

// Update details
router.put('/updatedetails', protect, updateDetails);

// Forgot password
router.post('/forgotpassword', forgotPassword);

// Reset password
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;