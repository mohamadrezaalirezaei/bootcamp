const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const auth = require('../middleware/auth');
//route           api/v1/bootcamps
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

//route           api/v1/bootcamps/:id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//route   create post api/v1/bootcamps private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // add user to req.bdoy
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  const bootcamp = await Bootcamp.create(req.body);

  if (publishedBootcamp && req.user.role !== 'admin') {
    next(new ErrorResponse(`you cannot published more than 1 bootcamp!`, 402));
  }

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//route  update put api/bootcamp/:id
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (req.user.id != bootcamp.user && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `you are not the owner of this bootcamp! you cannot update this!`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (req.user.id != bootcamp.user && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `you are not the owner of this bootcamp! you cannot remove this!`,
        401
      )
    );
  }
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

//desc          Upload photo for bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//access        Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }

  const file = req.files.file;

  //make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please add an image file`, 400));
  }

  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        500
      )
    );
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    if (req.user.id != bootcamp.user && req.user.role != 'admin') {
      return next(
        new ErrorResponse(
          `you are not the owner of this bootcamp! you cannot uplode file!`,
          401
        )
      );
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
