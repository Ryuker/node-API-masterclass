const express = require('express');
const { 
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

// All courses
router
  .route('/')
  .get(getCourses)
  .post(addCourse);

// Single course
router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;