const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  //make sure token exist
  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }

  try {
    //verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
});

exports.authorize = asyncHandler(async (req, res, next) => {
  //const user = await User.findById(token.id)

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (user.role === 'user') {
    return next(new ErrorResponse(` access forbidden `, 403));
  }
  next();
});
