const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
    select: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  position:{
    type:String, 
    // required:true
  },
  chief:{
    type: mongoose.Schema.ObjectId,
    ref: 'Chief',
    autopopulate: true
  },
  department:{
    type: mongoose.Schema.ObjectId,
    ref: 'Department',
    autopopulate: true
  },
division:{
  type: mongoose.Schema.ObjectId,
  ref: 'Division',
  autopopulate: true
},
  role: {
    type: mongoose.Schema.ObjectId,
    ref: 'Role',
    required: true,
    autopopulate: {
      select: '-resources -description -created -__v -removed -created',
    },
  },
  jobTitle: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // select: false,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },

  phone: {
    type: String,
    trim: true,
    required: true,
  },

  status: {
    type: String,
    default: 'Active',
  },
  created: {
    type: Date,
    default: Date.now,
    select: false, // Set 'select' to false
  },
  __v: {
    type: Number,
    select: false, // Set 'select: false'
  },
  isLoggedIn: { type: Number },
});

userSchema.plugin(require('mongoose-autopopulate'));

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
