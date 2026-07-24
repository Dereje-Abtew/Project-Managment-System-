const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const roleSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  resources: {
    type: [
      {
        resource: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Resource',
          required: true,
        },
        permissions: {
          type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Permission',
              required: true,
            },
          ],
        },
      },
    ],
  },
  created: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    select: false, // Set 'select: false'
  },
});

module.exports = mongoose.model('Role', roleSchema);
