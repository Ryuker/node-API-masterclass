const express = require('express');
const router = express.Router();


// Route handlers
router.get('/', (req, res) => {
  res.status(200)
  .json( { success: true, msg: 'Show all bootcamps' });
});

router.get('/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Show bootcamp ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.status(201)
  .json( { success: true, msg: 'Create new bootcamp' });
});

router.put('/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Display updated bootcamp ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.status(200).json( { success: true, msg: `Deleted bootcamp ${req.params.id}` });
});

// Export the router
module.exports = router;