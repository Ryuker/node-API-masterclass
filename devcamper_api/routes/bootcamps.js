const express = require('express');
const { 
  getBootcamps, 
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp,
  getBootcampsInRadius, 
} = require('../controllers/bootcamps');

const router = express.Router();

// All items
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

// All items within radius
router 
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

// Single item
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Export the router
module.exports = router;