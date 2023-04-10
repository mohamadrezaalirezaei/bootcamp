const express = require('express');
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResult = require('../middleware/advancedResult');
//include other resourxe routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize, createBootcamp);

router.route('/:id/photo').put(protect, authorize, bootcampPhotoUpload);
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize, updateBootcamp)
  .delete(protect, authorize, deleteBootcamp);

module.exports = router;
