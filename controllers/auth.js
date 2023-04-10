const errorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { status } = require('express/lib/response');
const bcrypt = require('bcryptjs/dist/bcrypt');

//  @desc         register a user
// route          get  api/v1/auth/register
// access         public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  //create token
  sendTokenResponse(user, 200, res);
});

//geeeeeeeeeeeet
exports.getRegisteredUser = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

//  @desc         Login a user
// route          POST  api/v1/auth/login
// access         public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new errorResponse('Please provide an email and password', 400));
  }

  // check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new errorResponse('invalid credentials', 401));
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new errorResponse('invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

//get token from model, create cookie and response

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSinedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

//  @desc         get current logged in user
// route          get  api/v1/auth/me
// access         private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorResponse(`no user found with this email`, 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `make a put request to ${resetUrl} `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(err);

    user.getResetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new errorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  @desc         reset password
// route          put api/v1/auth/resetpassword/:resetToken
// access         public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new errorResponse('invalid token', 400));
  }

  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

//  @desc         update user
// route          PUT  api/v1/auth/updatedetails
// access         private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const updateObject = {
    email: req.body.email,
    name: req.body.name,
  };
  const user = await User.findOneAndUpdate(req.user.id, updateObject, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  @desc         change password
// route          pute  api/v1/auth/changepassword
// access         private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const currentPassword = req.body.currentPassword;

  if (!(await user.matchPassword(currentPassword))) {
    return next(new errorResponse(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//  @desc         log user out / clear cookie
// route          Get  api/v1/auth/logut
// access         private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});
