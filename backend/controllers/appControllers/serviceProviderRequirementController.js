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

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    requirement.status = 'rejected';
    requirement.approvalNotes = req.body.approvalNotes || requirement.approvalNotes;
    requirement.rejectedBy = req.user ? req.user._id : undefined;
    requirement.rejectedAt = new Date();
    requirement.updated = new Date();

    await requirement.save();
    return res.status(200).json({ success: true, result: requirement, message: 'Requirement rejected successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Oops there is an Error' });
  }
};

exports.enhancement = async (req, res) => {
  try {
    if (req.user && !(await hasPermission(req, 'update'))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to submit enhancements.' });
    }

    const requirement = await ServiceProviderRequirement.findOne({ _id: req.params.id, removed: false });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    const enhancement = new ServiceProviderRequirement({
      ...req.body,
      serviceProvider: requirement.serviceProvider,
      project: requirement.project,
      parentRequirement: requirement._id,
      isEnhancement: true,
      submittedBy: req.user ? req.user._id : undefined,
      submittedByType: req.user ? 'internal_user' : 'service_provider',
      senderName: req.body.senderName || 'System Update',
      senderEmail: req.body.senderEmail || '',
      senderPhone: req.body.senderPhone || '',
      status: 'enhancement_pending',
      title: req.body.title || `Enhancement for ${requirement.title}`,
      description: req.body.description || '',
    });

    await enhancement.save();
    requirement.status = 'enhancement_pending';
    requirement.updated = new Date();
    await requirement.save();

    return res.status(200).json({ success: true, result: enhancement, message: 'Enhancement request submitted successfully.' });
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
