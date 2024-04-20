const express = require('express');
const { getReviews, getReview } = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Get All Reviews
router.route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  );

// Get Single Review
router.route('/:id')
  .get(getReview);


module.exports = router;