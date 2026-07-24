const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const resourceSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  isSubMenu: {
    type: Boolean,
    required: true,
  },
  parentMenu: {
    type: String,
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
    },
  ],
  __v: {
    type: Number,
    select: false, // Set 'select: false'
  },
});

resourceSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Resource', resourceSchema);
