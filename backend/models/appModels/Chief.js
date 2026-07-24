const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const chiefSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  chiefName: {
    type: String,
    trim: true,
    required: true,
  },
  // Reference to the top‑level CEO (itself a Chief document). For the actual CEO record this field will be omitted.
  CEO: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chief',
    required: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model('Chief', chiefSchema);
