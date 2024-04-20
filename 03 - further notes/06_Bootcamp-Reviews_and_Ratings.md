# Bootcamp Reviews & Ratings notes

# 1. Review Model & Get Reviews

## Reviews model
- Added `models/Reviews.js` with a ReviewSchema exported
``` JS models/Reviews.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true, 
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String, 
    required: [true, 'Please add some text']
  },
  weeks: {
    type: String, 
    required: [true, 'Please add number of weeks']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date, 
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
```

## Reviews controller
- Added `controllers/reviews.js`
- Added `getReviews` handler to return all reviews
  - support both getting all reviews and getting all review associated with a specified bootcamp id
``` JS controllers/reviews.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Reviews');
const Bootcamp = require('../model/Bootcamp');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if(req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    
    return res.status(200).json({
      succes: true,
      count: reviews.length, 
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);    
  }
});
```

## reviews routes
- Added `routes/reviews.js`
``` JS routes/reviews.js
const express = require('express');
const { getReviews } = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  );

module.exports = router;
```

## importing reviews as middleware into server
- added reviews route as middleware

## Rerouting to review in bootcamps router
- added following lines to `routes/bootcamps.js`
``` JS routes/bootcamps.js
~~~ include other resource routers ~~~
const reviewRouter = require('./reviews');

~~~ re-route into other resource routers ~~~
router.use('/:bootcampId/reviews', reviewRouter);
```

# 2. Get Single Review & Update Seeder
- Added `getReview`
## getReview handler
``` JS controllers/reviews.js
// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`), 404);
  };

  res.status(200).json({
    success: true, 
    data: review
  })
});
```
- Added getReview route to `routes/reviews.js`

``` JS routes/reviews.js
// Get Single Review
router.route('/:id')
  .get(getReview);
```



