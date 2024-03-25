const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path: './config/env/config.env'});

// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');

// declaring the app
const app = express();

// Body parser
app.use(express.json());

// Middleware
// - Dev logging
if (process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}
  


// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

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