const mongoose = require('mongoose');
const slugify = require('slugify');
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50'],
    },
    slug: String, //url
    description: {
      type: String,
      required: [true, 'Pleasr add des'],
      maxlength: [500, 'Name cannot be more than 500'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URl',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'phone cannot be longer than 20 ch'],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'please add a valid email',
      ],
    },
    address: {
      type: String,
      required: [true, 'please add address'],
    },
    location: {
      type: {
        type: String,
        enum: ['point'],
        required: false,
      },
      cordinates: {
        type: [Number],
        required: false,
        index: '2dsphere',
      },

      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    carrers: {
      type: [String],
      required: true,
      enum: [
        //only available var
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Bussiness',
        'Other',
      ],
    },
    avreageRating: {
      type: Number,
      min: [1, 'err'],
      max: [10, 'err'],
    },
    avreageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//create bootcamp slug from the name

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//delete course if bootcamp deleted
BootcampSchema.pre('remove', async function (next) {
  console.log(`courses being removed form bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

//reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
