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
  resetPasswordExpire: Date, 
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

## Creating the cookie
- added a method `sendTokenResponse` in `controllers/auth.js` to create the cookie
  - to modify the cookie expire added a JWT_COOKIE_EXPIRE variable to the .env file
    - we use this to calculate the expiration date from the current date.
        - we need to multiply it by `* 24 * 60 * 60 * 1000` to get the proper date
``` JS controllers/auth.js
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Create cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
```
- We then use this to send a response in the auth request handlers
  - so we replace the response that's already there
``` JS controllers/auth.js
sendTokenResponse(user, 200, res);
```

## Cookie secure flag
- By default the cookie is sent with a secure flag of false
  - but in production we want to set it to true (send it with HTTPS)
``` JS controlles/auth.js | sendTokenResponse()
~~~ cookie options ~~~
if (process.env.NODE_ENV === 'production') {
  options.secure = true;
}
```

# 6. Auth Protect Middleware
- validating the token
- Normally when creating a bootcamp we'd need to send a header with a `Authorization` key 
  - the value of the key is usually `Bearer {token value}`

## Protect Middleware
- Added `middleware/auth.js`
- Added protect method
  - this method splits the token so we only get the token value
  - then it makes sure the token exists, if it doesn't it send a unauthorized errorResponse
  - if the token exists it verified if the token is correct
    - if it does it sets the user on the request to the user that matches the decoded id
      - this way the user is only set when we've received the correct token
``` JS middleware/auth.js
// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // else if(req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if(!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log(decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

});
```

## Using the protect middleware in Bootcamp routes
- We import it into `routes/bootcamps.js`
``` JS routes/bootcamps.js
~~~ Router declaration ~~~
const { protect } = require('../middleware/auth');
```
- We then add it in the router request where it would apply
  - example  `.post(protect, createBootcamp);`

- We do this for both bootcamps and courses

## Getting the current logged in user
- added `getMe` handler to `controllers/auth.js`
  - this can access the `user` field on the request since we've added that in the protect method from the authentication check
``` JS controllers/auth.js
// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  })
});
```
- We then add the route for /me to `routes/auth.js`
  - it's important that we run the protect middleware on the route before the getMe method.
    - else we won't have access to the user since it won't be on the request.
``` JS routes/auth.js
~~~ Below router declaration ~~~
const { protect } = require('../middleware/auth');

// Me
router.get('/me', protect, getMe);
```

# 7. Storing The Token in Postman
- in postman:
  - added `pm.environment.set("TOKEN", pm.response.json().token)` in the tests tab of the `register` and `login` requests
  - this sets a new environment variable to the token we received from the register/login attempt

  - in `Get Logged In User` in the `Authorization` tab we then specify it use to use Bearer token and pass the enviroment variable
    - `{{TOKEN}}` - we use double curly brace to specify an enviroment variable
  - We do this for Create, Update, Delete, and Add Photo for bootcamp requests
  - We also do this for Create, Update, Delete for course request

# 8. Role Authorization
- Added middleware method to `middleware/auth.js` to grant access to specific roles
  - it takes in roles, which we destructure using the ... operator
  - it sends a `forbidden` error when the role doesn't have access
  - if not the it calls `next()` to move on
``` JS middleware/auth.js
// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
```

## Using role authorization middleware in the routes
- similar to the using the protect middleware we import it from the auth middleware in the route
- then we run it after protect and before the request handler method
  - only for the request where this is applicable of course
``` JS routes/bootcamps.js
const { protect, authorize } = require('../middleware/auth');

.post(protect, authorize('publisher', 'admin'), createBootcamp);
```
- we do the same for course routes

# 9. Adding a User To a Bootcamp
- Added this to the schema in `models/Bootcamp.js`
``` JS models/Bootcamp.js
user: {
  type: mongoose.Schema.ObjectId,
  ref: 'User',
  required: true
}
```
- The added this to the `createBootcamp` handler in `controllers/bootcamps.js`
``` JS controllers/bootcamps.js
// Add user to req.body
  req.body.user = req.user.id;
```
  - this works because have the user id added to the request by the protect method that run before this handler.

## Restricting user role to only be able to create 1 bootcamp
- This is relevant for the course, but will probably remove this later.
- Looked if there's already a bootcamp for this user in the database.
  - if there is returns an error response
  - else proceed as planned
``` JS controllers/bootcamps.js | createBootcamp()
// Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

// If the user is not an admin, they can only add one bootcamp
if(publishedBootcamp && req.user.role !== 'admin'){
  return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
}
```

# 10. Bootcamp Ownership
- To ensure users that aren't admin can't update bootcamps that aren't their own 
  - modified the `updateBootcamp` handler
    - we get the bootcamp by id but then run some validation before we actually update it
``` JS controllers/bootcamps.js
exports.updateBootcamp = asyncHandler(async (req, res, next ) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  // Send 400 if the ID didn't return a result from the database
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }
  
  // Update the bootcamp
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200)
    .json( { success: true, data: bootcamp });
});
```

## Making sure user can only delete own bootcamp
- Used same validation check as we used for the updateBootcamp handler
``` JS controllers/bootcamps.js
~~~ Check if Bootcamp exists ~~~
// Make sure user is bootcamp owner
if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
  return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
}
```
- we do the same for the `photoUpload` handler

# 11. Courses Ownership

## Add Course
- Added `User` field to the `Course` schema
``` JS models/Course.js
user: {
  type: mongoose.Schema.ObjectId,
  ref: 'User',
  required: true
}
```
- Added validation of bootcamp to `controllers/bootcamps.js`
``` JS controllers/bootcamps.js
~~~ check if there is a bootcamp ~~~
s
// Make sure user is bootcamp owner
if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
  return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
}
```

## Update Course
- Added check to see if user is the course owner to the `updateCourse` handler
``` JS controllers/courses.js
~~~ Check if there is a bootcamp ~~~
// Make sure user is course owner
if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
  return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401));
}
```

## Delete course
- Added check to see if user is the course owner to the `deleteCourse` handler
``` JS controllers/courses.js
// Make sure user is course owner
if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
  return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401));
}
```

# 12. Forgot Password - Generate Token
- in `models/User.js` we import the crypto package, `const crypto = require('crypto');`
- we then added `getResetPasswordToken` method on the schema 
``` JS models/User.js
// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
```
- Added `forgotPassword` handler to `controllers/auth.js`
``` JS controllers/auth.js
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There's no user with that email`, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user
  })
});
```
- Added forgotPassword route to `routes/auth.js`
``` js routes/auth.js
router.post('/forgotpassword', forgotPassword);
```

- Modified `save` pre method in `models/User.js`
``` JS models/User.js
// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if(!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})
```

# 13.Forgot Password - send email
[NodeMailer Website](https://www.nodemailer.com/)
- Using this for sending the email
- install: `npm i nodemailer`
[MailTrap Website](https://www.mailtrap.io/)
- for testing emails

- Made an account for MailTrap
- Copied some of the info over to `config.env`

## Send Email utils function
``` JS utils/sendEmail.js 
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, 
    to: options.email, 
    subject: options.subject, 
    text: options.message, 
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail;
```

## Using the sendEmail utils function
- imported the function into `controllers/auth.js

- modified the forgotPassword handler
``` JS controllers/auth.js
~~ under user.save() ~~
// Create reset url
const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}}`;

const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

try {
  await sendEmail({
    email: user.email,
    subject: 'Password reset token',
    message
  });
  
  res.status(200).json({ success: true, data: 'Email sent'});

} catch(err) {
  console.log(err);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  return next(new ErrorResponse('Email could not be sent', 500));
}
```

# 14. Reset Password
- Added `resetPassword` handler and route
``` JS controllers/auth.js
// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if(!user) {
    return next(new ErrorResponse('invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
```





  











