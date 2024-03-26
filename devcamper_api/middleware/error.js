const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Bootcamp id is not formatted properly - id: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    console.log(err);
    const message = `Duplicate field value entered - ${err.keyValue.name}`;
    error = new ErrorResponse(message, 400);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;