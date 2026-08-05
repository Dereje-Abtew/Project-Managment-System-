const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const stakeholderRequirementSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  stakeholder: {
    type: mongoose.Schema.ObjectId,
    ref: 'Stakeholder',
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
    enum: ['stakeholder', 'internal_user'],
    default: 'stakeholder',
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
      type: {
        type: String,
        enum: ['original', 'enhancement'],
        default: 'original',
      },
      round: {           // which enhancement round added this file (0 = original)
        type: Number,
        default: 0,
      },
    },
  ],
  // Full history of each enhancement round — stored on the same document
  enhancementHistory: [
    {
      round:       { type: Number, required: true },
      description: { type: String, default: '' },
      submittedAt: { type: Date,   default: Date.now },
      submittedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: true },
    },
  ],
  // Complete audit trail — every action recorded for accountability
  activityLog: [
    {
      action: {
        type: String,
        enum: ['submitted', 'approved', 'rejected', 'enhancement_submitted', 'approval_reversed'],
        required: true,
      },
      performedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: true },
      performedAt: { type: Date, default: Date.now },
      note:        { type: String, default: '' },  // reason / description for this action
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
    ref: 'StakeholderRequirement',
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
  rejectionReason: {
    type: String,
    default: '',
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

stakeholderRequirementSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('StakeholderRequirement', stakeholderRequirementSchema);
