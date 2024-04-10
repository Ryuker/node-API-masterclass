const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Me
router.get('/me', protect, getMe);

module.exports = router;