const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const Course = require('../models/Course');
const router = express.Router({ mergeParams: true });

const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResult(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize, addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize, updateCourse)
  .delete(protect, authorize, deleteCourse);
module.exports = router;
