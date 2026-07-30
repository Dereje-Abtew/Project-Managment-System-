const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * UATSignOff
 *
 * A UAT sign-off document is sent from the PM team to a service provider.
 * It contains a list of features/capabilities to be tested. The service
 * provider reviews each feature and marks it Pass / Fail with an optional
 * remark, then submits the whole form in one action.
 *
 * After submission, a PDF report is generated and can be attached to the
 * linked project.
 */
const featureSchema = new mongoose.Schema({
  no: { type: Number, required: true },
  feature: { type: String, required: true, trim: true },
  businessValidationConfirmed: {
    type: String,
    default: '',
    trim: true,
  },
  pass: {
    type: Boolean,
    default: false,
  },
  fail: {
    type: Boolean,
    default: false,
  },
  remark: {
    type: String,
    default: '',
    trim: true,
  },
}, { _id: true });

const uatSignOffSchema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  uatNumber: { type: String, trim: true },
  sentBy: { type: String, required: true, trim: true },
  date: { type: Date, required: true, default: Date.now },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true,
    autopopulate: { select: 'title projectNumber ownerName' },
  },
  serviceProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceProvider',
    required: false,
    autopopulate: { select: 'name email company' },
  },
  features: { type: [featureSchema], default: [] },
  responseStatus: {
    type: String,
    enum: ['pending', 'submitted'],
    default: 'pending',
  },
  signOffStatus: {
    type: String,
    enum: ['pending', 'submitted', 'agreed', 'disagreed'],
    default: 'pending',
  },
  signOffReason: { type: String, default: '', trim: true },
  signOffAt: { type: Date },
  respondedAt: { type: Date },
  respondedBy: { type: String, default: '' },
  overallRemark: { type: String, default: '' },
  pdfReport: {
    name: { type: String, default: '' },
    url: { type: String, default: '' },
    generatedAt: { type: Date },
  },
  attachedToProject: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  __v: { type: Number, select: false },
});

uatSignOffSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('UATSignOff', uatSignOffSchema);
