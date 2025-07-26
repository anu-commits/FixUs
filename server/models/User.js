const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  conversationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  subscriptionStatus: {
    type: String,
    enum: ['none', 'trial', 'monthly', 'cancelled'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);