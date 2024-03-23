// @desc    Get all bootcamps
// @route   GET/api/v1/bootcamps
// @access  Public
exports.getBootcaps = (req, res, next ) => {
  res.status(200)
  .json( { success: true, msg: 'Show all bootcamps' });
};