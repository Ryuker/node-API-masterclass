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

## install Helmet
- [Helmet](https://helmetjs.github.io/) : provides a bunch of header values to make the api more secure
- to install: `npm i helmet` 
- added as middleware
``` JS server.js
const helmet = require('helmet');

~~~ Sanitize Data ~~~
// Set security headers
app.use(helmet());
``` 

## XSS Clean 
- this library has been deprecated, probably need to replaced with a different solution
[XSS-Clean](https://github.com/jsonmaur/xss-clean)
  - this replaces `<script>` by `&lt;script>` in any string passed in an object to the database
    - effectively this prevents the user from passing `<script>alert(1)</script>` as a field in the database

- to install: `npm i xss-clean`
- imported as middleware
``` JS server.js
const xss = require('xss-clean');

~~~ Set Security Headers ~~~
// Prevent XSS attacks
app.use(xss());
```

## Alternatives for XSS protection
- since the above solution is deprecated and it still updates the database string with weird values it would be better to validate the string for proper formatting imo.

**here's some options:**
- some advice - [here](https://medium.com/@ferrosful/nodejs-security-unleashed-exploring-xss-attack-8d3a61a01a09)
- [Express Validator](https://express-validator.github.io/docs/)
- [XSS](https://jsxss.com/en/index.html)
- Fast one - [VineJS](https://vinejs.dev/docs/introduction)
- [JOI](https://joi.dev/api/?v=17.13.0) - [example video](https://www.youtube.com/watch?v=_svzevhv4vg)
  - example of using with mongoose - [here](https://gist.github.com/stongo/6359042)
  - allows for joi validation in mongoose schema's - [joigoose](https://github.com/yoitsro/joigoose)

# 4. Rate Limiting, hpp & cors
packages: 
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) - limits request per (x) time
- to install: `npm i express-rate-limit`
- added as middleware 
``` JS server.js
const rateLimit = require('express-rate-limit');

~~~ Prevent XSS attacks ~~~
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100 // requests per 10 mins
});

app.use(limiter);
```

- [hpp](https://github.com/analog-nico/hpp) - prevents sending duplicate parameter values
- to install: `npm i hpp`
- added as middleware
``` JS server.js
const hpp = require('hpp');

~~~ Rate limiting ~~~
// Prevent https param pollution attacks
app.use(hpp());
```



