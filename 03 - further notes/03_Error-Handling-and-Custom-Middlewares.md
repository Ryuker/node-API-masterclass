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
- modified `error.js` to handle `CastErrors`
  - for this we make a copy of the error, and set it's message to the original err message.
  ``` JS
  let error = { ...err };
  error.message = err.message;
  ```

  - we then check it's name, if it's a `Cast Error` we pass a custom `ErrorResponse`
  ``` JS 
  // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Bootcamp id is not formatted properly - id: ${err.value}`;
      error = new ErrorResponse(message, 404);
    }
  ```
- modified `controllers/bootcamps.js` 
  - to just pass in err into the next parameter in the try catch block 
    - since we're now handling it in the error middleware.

- did this for all the routeHandlers
  - Also made sure to send a custom response where the ID format does match but isn't in the database. 
  
