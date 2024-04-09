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

const router = express.Router();

router.post('/register', register);

module.exports = router;
```

- Made sure to add the auth route middleware to `server.js`
``` JS server.js
// Route files
const auth = require('./routes/auth');

// - Mount routers
app.use('/api/v1/auth', auth);
```

# 2. User Register & Password Encrypt
- Modified register handler to create a new user
``` JS controlles/auth
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  res.status(200).json({ success: true, data: user });
});
```




