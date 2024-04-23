# API Security Notes

# 1. Logout To Clear Token Cookie
- uncommented else if block to check for a cookie
``` JS middleware/auth.js
else if(req.cookies.token) {
  token = req.cookies.token;
}
```
  - This means even if we don't specify the bearer token in the header we will use the cookie to remember which accoun is logged in.

## Logout route
- added `logout` handler to `controllers/auth.js`
``` JS controllers/auth.js
// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expired: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out',
    data: {}
  })
});
```
- Added logout route to `routes/auth.js`
``` JS routes/auth.js
// Logout
router.get('/logout', logout);
```

- Commented the cookies check again for now

# 2. Prevent NoSQL Injections

## Injection vulnerability explained
- it's possible to send the following request object
```JS Postman
{
  "email": {"$gt":""},
  "password": '123456'
}
```
- the above gets the first user in the database that has this password.
  - This means guessing weak passwords makes it possible for a sql injection to get the user

## Options to counter this
packages: 
- [mongo-sanitize](https://github.com/vkarpov15/mongo-sanitize)
- [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize)
  This one we'll be using since we can just bring it in as middleware
- to install:
``` JS Terminal
npm i express-mongo-sanitize
```

## adding mongo sanitize as middleware
- imported into `server.js`
``` JS server.js
const mongoSanitize = require('express-mongo-sanitize');

~~~ File Uploading Middleware ~~~
// Sanitize data
app.use(mongoSanitize());
```

# 3. XSS Protection & Security Headers
packages: 
- [Helmet](https://helmetjs.github.io/) : provides a bunch of header values to make the api more secure
- to install: `npm i helmet`
