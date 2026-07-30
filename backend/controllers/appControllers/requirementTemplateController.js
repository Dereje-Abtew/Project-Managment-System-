const mongoose = require('mongoose');

const RequirementTemplate = mongoose.model('RequirementTemplate');
const ServiceProvider     = mongoose.model('ServiceProvider');
const User                = mongoose.model('User');
const Role                = mongoose.model('Role');
const Resource            = mongoose.model('Resource');
const Permission          = mongoose.model('Permission');

// ─── Permission helper ────────────────────────────────────────────────────────
const hasPermission = async (req, permissionName) => {
  if (!req.user || !req.user._id) return false;
  const user = await User.findOne({ _id: req.user._id, removed: false }).populate('role');
  if (!user || !user.role) return false;
  const role = await Role.findOne({ _id: user.role._id || user.role, removed: false });
  if (!role || !Array.isArray(role.resources)) return false;
  const permission = await Permission.findOne({ name: permissionName, removed: false });
  if (!permission) return false;
  const resource = await Resource.findOne({ name: 'Requirement Template', removed: false });
  if (!resource) return false;
  const entry = role.resources.find(e => String(e.resource) === String(resource._id));
  if (!entry || !Array.isArray(entry.permissions)) return false;
  return entry.permissions.some(p => p.toString() === permission._id.toString());
};

// ── POST /requirement-template/create ────────────────────────────────────────
// Body: { serviceProvider: <id> | "all", title?, file: { name, url } }
//
// When serviceProvider === "all"  →  isGlobal=true, no serviceProvider ref.
//   The template is applied to every provider that has no specific template.
// When serviceProvider is a valid ObjectId → specific to that provider only.
exports.create = async (req, res) => {
  try {
    if (!(await hasPermission(req, 'create'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload requirement templates.',
      });
    }

    const { serviceProvider, title, file } = req.body;

    if (!serviceProvider) {
      return res.status(400).json({ success: false, message: 'Service provider is required.' });
    }

    if (!file || !file.name || !file.url) {
      return res.status(400).json({ success: false, message: 'A valid template file is required.' });
    }

    // File-type whitelist
    const allowedExt = ['.pdf', '.doc', '.docx'];
    if (!allowedExt.some(e => String(file.name).toLowerCase().endsWith(e))) {
      return res.status(400).json({
        success: false,
        message: 'Template file must be a PDF or Word document (.pdf / .doc / .docx).',
      });
    }

    const isGlobal = serviceProvider === 'all';

    // When specific provider — verify it exists
    if (!isGlobal) {
      const spExists = await ServiceProvider.findOne({ _id: serviceProvider, removed: false });
      if (!spExists) {
        return res.status(404).json({ success: false, message: 'Service provider not found.' });
      }
    }

    const payload = {
      uploadedBy: req.user._id,
      title:      title || file.name,
      file:       { name: file.name, url: file.url },
      uploadedAt: new Date(),
      isGlobal,
    };

    if (!isGlobal) payload.serviceProvider = serviceProvider;

    const template = await new RequirementTemplate(payload).save();

    return res.status(200).json({
      success: true,
      result: template,
      message: isGlobal
        ? 'Global template uploaded — applies to all service providers.'
        : 'Requirement template uploaded successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};

// ── GET /requirement-template/list ───────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const result = await RequirementTemplate.find({ removed: false }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'Templates fetched successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};

// ── GET /requirement-template/list-by-provider/:providerId ───────────────────
// Returns templates relevant to a specific provider:
//   1. Provider-specific templates for that provider
//   2. Global templates (isGlobal=true) — used as fallback
exports.listByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'Service provider ID is required.' });
    }
    const result = await RequirementTemplate.find({
      removed: false,
      $or: [{ serviceProvider: providerId }, { isGlobal: true }],
    }).sort({ isGlobal: 1, created: -1 }); // specific first (isGlobal=false sorts before true)

    return res.status(200).json({ success: true, result, message: 'Templates fetched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};

// ── GET /requirement-template/read/:id ───────────────────────────────────────
exports.read = async (req, res) => {
  try {
    if (!(await hasPermission(req, 'read'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this template.',
      });
    }
    const result = await RequirementTemplate.findOne({ _id: req.params.id, removed: false });
    if (!result) return res.status(404).json({ success: false, message: 'Template not found.' });
    return res.status(200).json({ success: true, result, message: 'Template fetched successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};

// ── DELETE /requirement-template/delete/:id ───────────────────────────────────
exports.delete = async (req, res) => {
  try {
    if (!(await hasPermission(req, 'delete'))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete requirement templates.',
      });
    }
    const result = await RequirementTemplate.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { removed: true, updated: new Date() },
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false, message: 'Template not found.' });
    return res.status(200).json({ success: true, result, message: 'Template deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
