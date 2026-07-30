const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const projectSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
    autopopulate: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  ownerName: {
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceProvider',
    autopopulate: true,
  },
  ownerContact: {
    type: String,
    required: true,
  },
  projectNumber: {
    type: String,
    required: true,
    unique: true,
  },
  methodology: {
    type: String,
    default: 'agile',
  },
  totalBudget: {
    type: Number,
    required: true,
  },
  director: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: {
      select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
    },
  },
  projectManager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: {
      select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
    },
  },
  teamLeader: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: {
      select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
    },
  },
  teamMember: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: {
        select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
      },
    },
  ],
  removedTeamMember: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: {
        select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
      },
    },
  ],
  qualityAssurance: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: {
        select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
      },
    },
  ],
  removedQualityAssurance: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: {
        select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
      },
    },
  ],
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
  achievement: {
    type: Number,
    default: 0,
  },
  actualBudget: {
    type: Number,
    default: 0,
  },
  deliverables: [
    {
      name: {
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
      weight: {
        type: Number,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
    },
  ],
  risk: [
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      possibility: {
        type: Number,
      },
      impact: {
        type: Number,
      },
      emv: {
        type: Number,
      },
    },
  ],
  task: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      remark: {
        type: String,
        default: '',
      },
      weight: {
        type: Number,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
      actualCost: {
        type: Number,
        required: true,
        default: 0,
      },
      actual: {
        type: Number,
        default: 0,
      },
      assignedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
          select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
        },
      },
      assuredBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
          select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
        },
      },
      assignedStatus: {
        type: String,
        default: 'active',
      },
      dependOnTask: {
        type: mongoose.Schema.ObjectId,
        autopopulate: true,
      },
      deliverable: {
        type: mongoose.Schema.ObjectId,
        required: true,
        autopopulate: true,
      },
      assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        autopopulate: {
          select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
        },
      },
      submissionDate: {
        type: Date,
        required: true,
      },
      assignedDate: {
        type: Date,
        default: Date.now,
      },
      stage: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      // ── Task-level comments ──────────────────────────────────────────
      // Each task can have comments posted by team members.
      comments: [
        {
          message: {
            type: String,
            required: true,
          },
          postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: {
              select: 'firstName lastName email jobTitle',
            },
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      created_at: { type: Date, default: Date.now, select: false },
      updated_at: { type: Date, default: Date.now, select: false },
    },
  ],
  issue: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      risk: {
        type: mongoose.Schema.ObjectId,
        autopopulate: true,
      },
      task: {
        type: mongoose.Schema.ObjectId,
        required: true,
        autopopulate: true,
      },
      registeredBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
          select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
        },
      },
      assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        autopopulate: {
          select: '-role -created -__v -password -removed -enabled -isLoggedIn -status -phone',
        },
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        default: 'notsolved',
      },
      // ── Issue-level comments ─────────────────────────────────────────
      // Each issue can have comments posted by team members.
      comments: [
        {
          message: {
            type: String,
            required: true,
          },
          postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: {
              select: 'firstName lastName email jobTitle',
            },
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      created_at: { type: Date, default: Date.now, select: false },
      updated_at: { type: Date, default: Date.now, select: false },
    },
  ],
  deliverablesWeight: {
    type: Number,
  },
  // ── Comments (from CodeIgniter) ──────────────────────────────────────────
  // A project can have comments posted by any team member.
  // Each comment stores: who wrote it, the message, and when.
  comments: [
    {
      message: {
        type: String,
        required: true,
      },
      postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
          select: 'firstName lastName email jobTitle',
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  uatReports: [
    {
      name: { type: String, default: '' },
      url: { type: String, default: '' },
      generatedAt: { type: Date, default: Date.now },
    },
  ],
  priority: {
    type: String,
    default: 'normal',
  },
  status: {
    type: String,
    default: 'pending',
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
    select: false, // Set 'select: false'
  },
});

projectSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Project', projectSchema);