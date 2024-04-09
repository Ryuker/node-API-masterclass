const express = require('express');
const { register } = require('../controllers/auth');

const router = express.router();

router.post('/register', register);

module.exports = router;