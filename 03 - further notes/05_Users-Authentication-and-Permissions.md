# Users Authentication & Permissions notes

# 1. User Model

## Packages for token generation and encryption
- JSON Webtoken - for webtokens- `npm i jsonwebtoken`
- bcryptjs - to encrypt passwords - `npm i bcryptjs`

## User Model
- User schema to `models/User.js`
``` JS models/Users.js
const UserSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: [true, 'Please add name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String, 
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpired: Date, 
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

## Authentication
- We created `routes/auth.js` and `controllers/auth.js`

- Added basic handler to return a register response
``` JS controllers/auth.js
const asyncHandler = require('../middleware/async');

// @desc    Register user
// @route   GET /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true});
});
```

- Added basic register route
``` JS routes/auth.js
const express = require('express');
const { register } = require('../controllers/auth');

const router = express.router();

router.post('/register', register);

module.exports = router;
```




