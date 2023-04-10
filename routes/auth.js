const express = require('express');
const User = require('../models/User');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers/auth');
const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/forgotPassword', forgotPassword);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, authorize, getMe);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updateDetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

//.get(advancedResult(User), getRegisteredUser);

module.exports = router;
