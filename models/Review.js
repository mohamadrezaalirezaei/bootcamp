const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add title for review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'please add some text'],
  },
  rating: {
    type: Number,
    required: [true, 'please add a rating between 1 and 10'],
    max: 10,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('Review', ReviewSchema);
