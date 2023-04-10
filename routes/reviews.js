const express = require('express');
const Review = require('../models/Review');

const advancedResult = require('../middleware/advancedResult');
const router = express.Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  addReviews,
  updateReviews,
  deleteReviews,
} = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');
router
  .route('/')
  .get(
    advancedResult(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize, addReviews);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize, updateReviews)
  .delete(protect, deleteReviews);

module.exports = router;
