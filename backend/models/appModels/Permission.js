const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  __v: {
    type: Number,
    select: false, // Set 'select: false'
  },
});

module.exports = mongoose.model('Permission', permissionSchema);
