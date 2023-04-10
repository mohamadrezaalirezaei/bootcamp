const express = require('express');
const User = require('../models/User');

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require('../controllers/user');

const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });
router.use(protect);
router.use(authorize);

router.route('/').get(advancedResult(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
