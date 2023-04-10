const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//@desc         Get review
//route         GET api/v1/reviews
//route         GET api/v1/bootcamps/:bootcampId/reviews
//access        public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

//@desc         Get review
//route         GET api/v1/reviews/:id
//access        public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(`no review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc         create review
//route         POST api/v1/bootcamp/:bootcampid/reviews
//access        private
exports.addReviews = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`bootcamp not found!`, 404));
  }
  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review,
  });
});

//@desc         update review
//route         PUT api/v1/reviews/:id
//access        private
exports.updateReviews = asyncHandler(async (req, res, next) => {
  let reviews = await Review.findById(req.params.id);

  if (!reviews) {
    return next(new ErrorResponse(`review not found`, 404));
  }

  if (reviews.user != req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`not athourized to update`, 401));
  }

  reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

//@desc         delete review
//route         DELETE api/v1/reviews/:id
//access        private
exports.deleteReviews = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`review not found`, 404));
  }

  if (review.user != req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`not athourized to delete`, 401));
  }
  await review.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});
