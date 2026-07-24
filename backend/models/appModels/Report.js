const mongoose = require('mongoose');

// Define Project Schema
const reportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    autopopulate: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  // Metrics related to project status
  status: {
    scope: {
      type: String,
      enum: ['On Track', 'At Risk', 'Delayed'],
      default: 'On Track',
    },
    budget: {
      type: String,
      enum: ['Under Budget', 'On Budget', 'Over Budget'],
      default: 'On Budget',
    },
    schedule: {
      type: String,
      enum: ['Ahead of Schedule', 'On Schedule', 'Behind Schedule'],
      default: 'On Schedule',
    },
    // Add more metrics as needed (e.g., quality, resources, etc.)
  },
  // Reports associated with the project
  reports: [{
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  removed: {
    type: Boolean,
    default: false,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

reportSchema.plugin(require('mongoose-autopopulate'));

// Create Project model from schema
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
