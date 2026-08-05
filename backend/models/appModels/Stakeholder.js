const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const stakeholderSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model('Stakeholder', stakeholderSchema);
