# Error Handing & Custom Middlewares notes
[Express Error Handling Page](https://expressjs.com/en/guide/error-handling.html)

# 1. Error Handler Middleware
- bit a tricky explanation on the above page but
  - to have Express handle errors in a non default way we have to call `next()` with the error
    - this ensures Express will handle the error we passed in.

- We're writing our own. Not sure how this will work yet.

## Basic Error Handler
- we create a `error.js` in the middleware folder
``` JS error.js
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.stack.red);
  
  res.status(500).json({
    success: false,
    error: err.message
  });
};

module.exports = errorHandler;
```

## Using the Error Handler Middleware
- we need to import it into `server.js`
- we then have to use it after the routs middleware is specified
  - else it won't catch the error
``` JS server.js
~~~ Route Middleware ~~~
// - Error Handler
app.use(errorHandler);
```

# 2. Custom ErrorResponse Class
- We added a `utils` folder in the project root
- Added `errorResponse.js`
- Added a custom class that extends Error.
  - code below is basic
``` JS errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
```

- Modified `error.js` response
``` JS error.js
res.status(err.statusCode || 500).json({
  success: false,
  error: err.message || 'Server Error'
});
```

## Use errorHandler in Bootcamps controller
- imported `errorResponse` into `bootcamps` controller
- used in getSingleID request handler's next parameter
  - this is temporary
``` JS controllers/bootcamps.js
next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
```

# 3. Mongoose Error Handling [1]


