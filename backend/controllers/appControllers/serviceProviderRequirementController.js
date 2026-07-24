const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const ServiceProviderRequirement = mongoose.model('ServiceProviderRequirement');
const ServiceProvider = mongoose.model('ServiceProvider');
const Project = mongoose.model('Project');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
const Resource = mongoose.model('Resource');
const Permission = mongoose.model('Permission');

const getUserIdentity = (req) => {
  const user = req.user;
  if (!user) return null;

  return {
    id: user._id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email,
    phone: user.phone,
  };
};

const hasPermission = async (req, permissionName) => {
  if (!req.user || !req.user._id) return false;

  const user = await User.findOne({ _id: req.user._id, removed: false }).populate('role');
  if (!user || !user.role) return false;

  const role = await Role.findOne({ _id: user.role._id || user.role, removed: false });
  if (!role || !Array.isArray(role.resources)) return false;

  const permission = await Permission.findOne({ name: permissionName, removed: false });
  if (!permission) return false;

  const resourceNames = (() => {
    if (permissionName === 'create') return ['Send Requirement'];
    if (permissionName === 'update') return ['Approve Requirement'];
    if (permissionName === 'read') return ['Send Requirement', 'Approve Requirement'];
    return ['Send Requirement', 'Approve Requirement'];
  })();

  const resources = await Resource.find({ name: { $in: resourceNames }, removed: false });
  if (!resources || resources.length === 0) return false;

  const resourceIds = resources.map((resource) => resource._id.toString());
  const resourceEntry = role.resources.find((entry) => resourceIds.includes(String(entry.resource)));
  if (!resourceEntry || !Array.isArray(resourceEntry.permissions)) return false;

  return resourceEntry.permissions.some((entryPermission) => entryPermission.toString() === permission._id.toString());
};

exports.login = async (req, res) => {
  try {
    const username = req.body.username || req.body.email || '';
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const provider = await ServiceProvider.findOne({
      $or: [{ username }, { email: username }],
      removed: false,
    });

    if (!provider || !provider.password) {
      return res.status(400).json({ success: false, message: 'Invalid service provider credentials.' });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid service provider credentials.' });
    }

    const token = jwt.sign(
      { id: provider._id, type: 'serviceProvider', username: provider.username || provider.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      result: {
        token,
        serviceProvider: {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          username: provider.username || provider.email,
        },
      },
      message: 'Service provider logged in successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'create'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to create requirements.' });
    }

    const userIdentity = getUserIdentity(req);
    const payload = {
      ...req.body,
      submittedBy: req.user ? req.user._id : undefined,
      submittedByType: req.user ? 'internal_user' : 'service_provider',
      senderName: req.body.senderName || (userIdentity?.name || 'Unknown'),
      senderEmail: req.body.senderEmail || (userIdentity?.email || ''),
      senderPhone: req.body.senderPhone || (userIdentity?.phone || ''),
      status: 'submitted',
    };

    // Require minimal fields: senderName, senderEmail, senderPhone, attachments
    if (!payload.senderName || !payload.senderEmail || !payload.senderPhone) {
      return res.status(400).json({
        success: false,
        message: 'Sender name, sender email and sender phone are required.',
      });
    }

    // attachments should be an array with at least one file object { name, url }
    if (!Array.isArray(payload.attachments) || payload.attachments.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one attachment (pdf/doc/docx) is required.' });
    }

    // Basic file type validation on attachment names
    const allowedExt = ['.pdf', '.doc', '.docx'];
    for (const att of payload.attachments) {
      const name = att && att.name ? String(att.name).toLowerCase() : '';
      const ok = allowedExt.some((ext) => name.endsWith(ext));
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Attachments must be PDF or Word documents.' });
      }
    }

    if (payload.project) {
      const projectExists = await Project.findOne({ _id: payload.project, removed: false });
      if (!projectExists) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
    }

    // serviceProvider is optional now; if provided we do not block creation when not found

    const result = await new ServiceProviderRequirement(payload).save();

    // Log the initial submission
    result.activityLog.push({
      action:      'submitted',
      performedBy: req.user ? req.user._id : undefined,
      performedAt: new Date(),
      note:        'Requirement submitted.',
    });
    await result.save();

    return res.status(200).json({ success: true, result, message: 'Requirement submitted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.list = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'read'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view requirements.' });
    }

    const result = await ServiceProviderRequirement.find({ removed: false }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'Requirements fetched successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

// Returns requirements submitted by the current user — includes enhancements they authored
exports.listMine = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const result = await ServiceProviderRequirement.find({
      removed: false,
      submittedBy: req.user._id,
    }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'Your requirements fetched successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.read = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'read'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this requirement.' });
    }

    const result = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!result) return res.status(404).json({ success: false, message: 'Requirement not found.' });
    return res.status(200).json({ success: true, result, message: 'Requirement fetched successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.approve = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'update'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to approve requirements.' });
    }

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    requirement.status = 'approved';
    requirement.approvalNotes = req.body.approvalNotes || requirement.approvalNotes;
    requirement.approvedBy = req.user ? req.user._id : undefined;
    requirement.approvedAt = new Date();
    requirement.updated = new Date();

    // Log the approval
    requirement.activityLog.push({
      action:      'approved',
      performedBy: req.user ? req.user._id : undefined,
      performedAt: new Date(),
      note:        req.body.approvalNotes || 'Requirement approved.',
    });

    await requirement.save();
    // If requirement is linked to a project, create a task from it (if approver has project create permission)
    try {
      if (requirement.project) {
        // check approver has permission to create project tasks
        const canCreateProject = await hasPermission(req, 'create');
        if (canCreateProject) {
          const project = await Project.findOne({ _id: requirement.project, removed: false });
          if (project) {
            // ensure there is at least one deliverable to attach the task to
            let deliverableId = null;
            if (Array.isArray(project.deliverables) && project.deliverables.length > 0) {
              deliverableId = project.deliverables[0]._id;
            } else {
              // create a minimal deliverable from requirement
              const d = {
                name: requirement.title,
                description: requirement.expectedDeliverables || requirement.description || 'Auto-created deliverable from requirement',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                weight: 1,
                cost: 0,
              };
              project.deliverables.push(d);
              await project.save();
              deliverableId = project.deliverables[project.deliverables.length - 1]._id;
            }

            const task = {
              title: requirement.title,
              description: requirement.description,
              remark: requirement.approvalNotes || '',
              weight: 1,
              cost: 0,
              actualCost: 0,
              actual: 0,
              assignedBy: req.user ? req.user._id : undefined,
              assuredBy: req.user ? req.user._id : undefined,
              assignedStatus: 'active',
              deliverable: deliverableId,
              submissionDate: new Date(),
              assignedDate: new Date(),
              stage: 'todo',
              priority: 'medium',
            };

            project.task.push(task);
            await project.save();
          }
        }
      }
    } catch (e) {
      // non-fatal: task creation failure should not block approval
      console.error('Failed to create task from requirement:', e.message || e);
    }

    return res.status(200).json({ success: true, result: requirement, message: 'Requirement approved successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.reject = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'update'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to reject requirements.' });
    }

    const rejectionReason = (req.body.rejectionReason || '').trim();
    if (!rejectionReason || rejectionReason.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required and must be at least 10 characters.',
      });
    }

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    requirement.status = 'rejected';
    requirement.rejectionReason = rejectionReason;
    requirement.approvalNotes = req.body.approvalNotes || requirement.approvalNotes;
    requirement.rejectedBy = req.user ? req.user._id : undefined;
    requirement.rejectedAt = new Date();
    requirement.updated = new Date();

    // Log the rejection
    requirement.activityLog.push({
      action:      'rejected',
      performedBy: req.user ? req.user._id : undefined,
      performedAt: new Date(),
      note:        rejectionReason,
    });

    await requirement.save();
    return res.status(200).json({ success: true, result: requirement, message: 'Requirement rejected successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

// ── Reverse an approval (accountability correction) ────────────────────────
exports.reverseApproval = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'update'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to reverse approvals.' });
    }

    const reverseReason = (req.body.reverseReason || '').trim();
    if (!reverseReason || reverseReason.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A reason for reversing the approval is required (at least 10 characters).',
      });
    }

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    if (requirement.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved requirements can have their approval reversed.' });
    }

    // Revert to rejected so the sender can see and optionally enhance
    requirement.status          = 'rejected';
    requirement.rejectionReason = reverseReason;
    requirement.rejectedBy      = req.user ? req.user._id : undefined;
    requirement.rejectedAt      = new Date();
    // Clear the approval fields
    requirement.approvedBy      = undefined;
    requirement.approvedAt      = undefined;
    requirement.updated         = new Date();

    // Record in audit log
    if (!Array.isArray(requirement.activityLog)) requirement.activityLog = [];
    requirement.activityLog.push({
      action:      'approval_reversed',
      performedBy: req.user ? req.user._id : undefined,
      performedAt: new Date(),
      note:        reverseReason,
    });

    await requirement.save();
    return res.status(200).json({ success: true, result: requirement, message: 'Approval reversed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.enhancement = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'create'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to submit enhancements.' });
    }

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    if (requirement.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected requirements can be enhanced.' });
    }

    // Determine round number (1-based)
    const round = (Array.isArray(requirement.enhancementHistory) ? requirement.enhancementHistory.length : 0) + 1;

    // Tag new files with type:'enhancement' and the current round number
    const newAttachments = (Array.isArray(req.body.attachments) ? req.body.attachments : [])
      .map((a) => ({ name: a.name, url: a.url, type: 'enhancement', round }));

    // Append new files to the existing attachments (originals stay untouched)
    requirement.attachments.push(...newAttachments);

    // Record this round in history
    if (!Array.isArray(requirement.enhancementHistory)) requirement.enhancementHistory = [];
    requirement.enhancementHistory.push({
      round,
      description: req.body.description || '',
      submittedAt: new Date(),
      submittedBy: req.user ? req.user._id : undefined,
    });

    // Log the enhancement in the audit trail
    if (!Array.isArray(requirement.activityLog)) requirement.activityLog = [];
    requirement.activityLog.push({
      action:      'enhancement_submitted',
      performedBy: req.user ? req.user._id : undefined,
      performedAt: new Date(),
      note:        `Enhancement round #${round}: ${req.body.description || ''}`,
    });

    // Update the record in place — same row, no new document
    requirement.isEnhancement      = true;
    requirement.status              = 'enhancement_pending';
    requirement.description         = req.body.description || requirement.description;
    requirement.enhancementSummary  = req.body.description || requirement.enhancementSummary;
    requirement.updated             = new Date();
    // Clear previous rejection so approver sees a clean state
    requirement.rejectionReason     = '';
    requirement.rejectedBy          = undefined;
    requirement.rejectedAt          = undefined;

    await requirement.save();

    return res.status(200).json({ success: true, result: requirement, message: 'Enhancement submitted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.delete = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'delete'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete requirements.' });
    }

    const result = await ServiceProviderRequirement.findOneAndUpdate({ _id: req.params.id, removed: false }, { removed: true, updated: new Date() }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Requirement not found.' });
    return res.status(200).json({ success: true, result, message: 'Requirement deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};
