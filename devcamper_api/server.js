const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: './config/config.env'});

// declaring the app
const app = express();

// Routes
app.get('/api/v1/bootcamps', (req, res) => {
  res.status(200)
  .json( { success: true, msg: 'Show all bootcamps' });
});

app.get('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Show bootcamp ${req.params.id}` });
});

app.post('/api/v1/bootcamps', (req, res) => {
  res.status(201)
  .json( { success: true, msg: 'Create new bootcamp' });
});

app.put('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Display updated bootcamp ${req.params.id}` });
});

app.delete('/api/v1/bootcamps/:id', (req, res) => {
  res.status(204).json( { success: true, msg: `Deleted bootcamp ${req.params.id}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));