const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add course title'],
  },
  description: {
    type: String,
    required: [true, 'please add des'],
  },
  weeks: {
    type: String,
    required: [true, 'pls add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'pls add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'pls add minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false,
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

// static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        avreageCost: { $avg: '$tuition' },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      avreageCost: Math.ceil(obj[0].avreageCost / 10) * 10,
    });
  } catch (err) {
    consol.error(err);
  }
};

//cal getAvreageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

//cal getAvreageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model('Course', CourseSchema);
