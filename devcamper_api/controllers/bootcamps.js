const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async(req, res, next ) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200)
      .json( { success: true, data: bootcamps });
  } catch (err) {
    res.status(404)
      .json( { success: false, error: err });
  }
};

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next ) => {
  res.status(200)
  .json( { success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next ) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    
    res.status(201)
      .json( { success: true, data: bootcamp });
  } catch (err) {
    res.status(400)
      .json( { success: false, error: err });
  }
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next ) => {
  res.status(200)
  .json( { success: true, msg: `Display updated bootcamp ${req.params.id}` });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next ) => {
  res.status(200)
  .json( { success: true, msg: `Deleted bootcamp ${req.params.id}` });
};

