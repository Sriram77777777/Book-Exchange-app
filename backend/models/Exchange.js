const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null }, // Optional for one-way exchange
  exchangeType: { type: String, enum: ['book-for-book', 'one-way'], default: 'book-for-book' }, // Track exchange type
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exchange', exchangeSchema);