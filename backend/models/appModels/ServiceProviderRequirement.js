const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const serviceProviderRequirementSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  serviceProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceProvider',
    required: false,
    autopopulate: true,
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    autopopulate: true,
  },
  submittedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    autopopulate: true,
  },
  submittedByType: {
    type: String,
    enum: ['service_provider', 'internal_user'],
    default: 'service_provider',
  },
  senderName: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    trim: true,
  },
  senderPhone: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  expectedDeliverables: {
    type: String,
    default: '',
  },
  attachments: [
    {
      name: String,
      url: String,
    },
  ],
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'enhancement_pending', 'implemented'],
    default: 'submitted',
  },
  isEnhancement: {
    type: Boolean,
    default: false,
  },
  parentRequirement: {
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceProviderRequirement',
    autopopulate: true,
  },
  enhancementSummary: {
    type: String,
    default: '',
  },
  approvalNotes: {
    type: String,
    default: '',
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    autopopulate: true,
  },
  approvedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    autopopulate: true,
  },
  rejectedAt: {
    type: Date,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
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

serviceProviderRequirementSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('ServiceProviderRequirement', serviceProviderRequirementSchema);
