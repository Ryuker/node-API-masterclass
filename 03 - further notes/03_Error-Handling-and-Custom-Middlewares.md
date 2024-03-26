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

# 3. Mongoose Error Handling

## Cast Error Handling by Name
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

## Duplicate Key Error handling by Code
- this returns a `MongoError` but this is used for multiple error
  - instead we need to check for the error code key - `11000`
``` JS 
// Mongoose duplicate key
if (err.code === 11000) {
  console.log(err);
  const message = `Duplicate field value entered - ${err.keyValue.name}`;
  error = new ErrorResponse(message, 400);
}
```

## Validation Error Handling
- For this we check for a `ValidationError` in `error.js`
- We then create an array which maps through the errors and get the validation message of each one
- we then send a response with the array and status
``` JS erros.js
// Mongoose validation error
if (err.name === 'ValidationError') {
  const message = Object.values(err.errors).map(val => val.message);
  error = new ErrorResponse(message, 400);
}
```

# 4. Async Await Middleware
- We added an `async.js` piece of middleware
  - This handles catch automatically
``` JS
const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```
- in `controllers/bootcamps` we then import this async handler and wrap the handler in it like below
  - this way we don't need to use try catch in the async function passed into the asyncHandler

``` JS controllers/bootcamps.js
exports.getBootcamps = asyncHandler( async(req, res, next ) => {
  const bootcamps = await Bootcamp.find();
  res.status(200)
    .json( { success: true, count: bootcamps.length, data: bootcamps });
});
```

# 5. Mongoose Middleware & Slugify




