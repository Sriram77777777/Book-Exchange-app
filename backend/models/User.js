const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactInfo: { type: String },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200, // Optional: limit bio length
  },
  avatar: {
    type: String,
    default: null, // Will store the path to the avatar image, e.g., '/uploads/avatar-123.jpg'
  },
  ratings: [{
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  averageRating: { type: Number, default: 0 },
});

// Middleware to update averageRating when ratings change
userSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRatings = this.ratings.length;
    const sumRatings = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = Number((sumRatings / totalRatings).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);