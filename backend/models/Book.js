const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  condition: { type: String, required: true }, // e.g., "New", "Used", "Worn"
  description: { type: String }, // Optional description
  imageUrl: { type: String }, // URL for the book image
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'available' }, // e.g., "available", "requested", "traded"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema);