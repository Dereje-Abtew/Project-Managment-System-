const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const departmentSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  departmentName: {
    type: String,
    trim: true,
    required: true,
  },
  chief:{
    type:mongoose.Schema.ObjectId,
    ref:"Chief",
    required:true,
    autopopulate:true,
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
departmentSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Department', departmentSchema);
