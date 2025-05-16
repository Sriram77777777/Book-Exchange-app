const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  exchangeId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);