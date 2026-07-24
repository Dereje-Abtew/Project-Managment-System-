const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const divisionSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  divisionName: {
    type: String,
    trim: true,
    required: true,
  },
  department:{
    type:mongoose.Schema.ObjectId,
    ref:"Department",
    required:true,
    autopopulate:true
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

divisionSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Division', divisionSchema);
