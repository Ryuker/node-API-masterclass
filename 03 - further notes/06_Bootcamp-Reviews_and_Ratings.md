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

# 3. Add Review For Bootcamp
- Added `addReview` handler
``` JS controllers/reviews.js
// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp){
    return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);
  
  res.status(201).json({
    success: true, 
    data: review
  })
});
```
- Added `.post(protect, authorize('user', 'admin'), addReview);` to the `/` route 

## Restrict users to only add 1 review per bootcamp
- added an `index` to `models/Review.js` under the schema
``` JS models/Review.js
// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
```

# 4. Calculate Average Rating & Save
- Added static method `models/Review.js` to get the average rating
``` JS models/Review.js
// Static method to get avg rating
ReviewSchema.statics.getAverageRating = async function(bootcampId){

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};
```
- Added calls below the method
``` JS models/Review.js
// Call getAverageRating after save
ReviewSchema.post('save', function(){
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before deleteOne
ReviewSchema.post('deleteOne', {document: true, query: false }, function(){
  this.constructor.getAverageRating(this.bootcamp);
});
```

# 5. Update & Delete Reviews
- Added `updateReview` handler
``` JS controllers/reviews.js
// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review){
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }


  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Not authorized to update review', 401));
  }

  // Update the review
  for(let prop in req.body){
    review[prop] = req.body[prop];
  }

  // Save the review, triggering the 'save' middleware
  review = await review.save();
  
  res.status(200).json({
    success: true, 
    data: review
  })
});
```
- Added `updateReview` route
``` JS routes/reviews.js
~~~ /:id ~~~ route
.put(protect, authorize('user', 'admin'), updateReview);
```

## Delete Review handler and route
- Added `deleteReview` handler
``` JS controllers/reviews.js
// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review){
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }

  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Not authorized to delete review', 401));
  }

  await review.deleteOne();
  
  res.status(200).json({
    success: true, 
    message: `Review with id ${req.params.id} deleted`,
    data: {}
  })
});
```
- Added deleteReview route
``` JS routes/reviews.js
~~~ /:id ~~~ route
.delete(protect, authorize('user', 'admin'), deleteReview);
```


