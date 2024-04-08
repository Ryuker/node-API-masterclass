const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path: './config/env/config.env'});

// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// declaring the app
const app = express();

// Body parser
app.use(express.json());

// Middleware
// - Dev logging
if (process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload);

// - Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// - Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/////////////////
// Run the server
/////////////////
const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`.yellow.bold)
);

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  
  // Close server & exit process
  server.close(() => process.exit(1));
});