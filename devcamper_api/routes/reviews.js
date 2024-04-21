const express = require('express');
const { getReviews, getReview, addReview, updateReview } = require('../controllers/reviews');

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
  )
  .post(protect, authorize('user', 'admin'), addReview);

// Get Single Review
router.route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview);


module.exports = router;