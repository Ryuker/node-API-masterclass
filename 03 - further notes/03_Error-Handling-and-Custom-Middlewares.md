# Error Handing & Custom Middlewares notes
[Express Error Handling Page](https://expressjs.com/en/guide/error-handling.html)

# 1. Error Handler Middleware
- bit a tricky explanation on the above page but
  - to have Express handle errors in a non default way we have to call `next()` with the error
    - this ensures Express will handle the error we passed in.

- We're writing our own. Not sure how this will work yet.