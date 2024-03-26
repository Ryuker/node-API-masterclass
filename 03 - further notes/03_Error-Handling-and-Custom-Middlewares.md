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