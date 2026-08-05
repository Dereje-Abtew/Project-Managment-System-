const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * RequirementTemplate
 *
 * Stores a template document uploaded by an internal user.
 * Each template is scoped to a specific Stakeholder — when a requirement
 * sender opens SendRequirement and a template exists for their stakeholder,
 * that template is surfaced in the table so they can download and use it as
 * a reference before preparing their submission.
 */
const requirementTemplateSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },

  // The internal user who uploaded this template
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: {
      select: 'firstName lastName email',
    },
  },

  // The stakeholder this template is intended for.
  // Null/absent when isGlobal = true (applies to all stakeholders).
  stakeholder: {
    type: mongoose.Schema.ObjectId,
    ref: 'Stakeholder',
    required: false,
    autopopulate: {
      select: 'name email company',
    },
  },

  // When true this template applies to ALL stakeholders.
  // A stakeholder-specific template always takes priority over a global one.
  isGlobal: {
    type: Boolean,
    default: false,
  },

  // Human-readable label (optional — defaults to file name)
  title: {
    type: String,
    trim: true,
    default: '',
  },

  // The uploaded file stored as a data-URL (base64) — same pattern as attachments
  file: {
    name: { type: String, required: true },
    url:  { type: String, required: true },  // base64 data-URL or public URL
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },

  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },

  __v: {
    type: Number,
    select: false,
  },
});

requirementTemplateSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('RequirementTemplate', requirementTemplateSchema);
