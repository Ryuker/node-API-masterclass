const express = require('express');
const { 
  getBootcamps, 
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp 
} = require('../controllers/bootcamps');

const router = express.Router();


// Route handlers
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

// Single item
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);



// Export the router
module.exports = router;