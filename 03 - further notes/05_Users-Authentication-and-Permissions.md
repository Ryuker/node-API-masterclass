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

## Creating the User
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

## Encryption using bcryptjs
- In `models/User.js` we import bycryptjs and then add the following pre middleware below the schema
  - the below is very secure according to this course
``` JS models/Users.js
// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})
```

# 3. Sign & Get JSON Web Token
[JWT Website](https://jwt.io/)
- Added JWT signing to `User` model
``` JS models/User.js
const jwt = require('jsonwebtoken');

~~~ Below encrypt middlware ~~~
// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
      { id: this._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE}
    );
};
```
- added env variables for the secret and expiration.

- Modified register handler to get the token using the above method we just added on the model
``` JS controllers/auth.js
// Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token, data: user });
```

- The signed token we get back from a request we can use on `JWT.io` to check what it's made up off.
  - we can then use this to get the proper id back etc.

# 4. User Login
- Added the following method to the `User` model
``` JS models/User.js
// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}
```

- Added Login handler to `controllers/auth.js`
  - In it we do some validation of the email and password
    - it's important that the error response returns the same message, this way hackers can't identify if a user exists in the database or matches a password etc.

``` JS controllers/auth.js
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password){
    return next(new ErrorResponse('Please provide a email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if(!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Create token
  const token = user.getSignedJwtToken();


  res.status(200).json({ success: true, token, data: user });
});
```
- Added the login route to `routes/auth.js`
``` JS routes/auth.js
// Login
router.post('/login', login);
```

# 5. Sending JWT in a cookie
[cookie parser GH page](https://github.com/expressjs/cookie-parser)
- to install: `npm i cookie-parser`
- imported into `server.js` and added to middleware
``` JS server.js
const cookieParser = require('cookie-parser');

~~~ below Body Parser ~~~
app.use(cookieParser());
```










