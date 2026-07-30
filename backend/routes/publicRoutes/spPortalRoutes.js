const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uatSignOffController = require('@/controllers/appControllers/uatSignOffController');

require('dotenv').config({ path: '.env' });

const router = express.Router();

// ─── SP JWT middleware ────────────────────────────────────────────────────────
function spAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'serviceProvider') {
      return res.status(401).json({ success: false, message: 'Invalid token type.' });
    }
    req.serviceProvider = { _id: decoded.id, username: decoded.username };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
}

// ─── GET /api/sp-portal/uat ───────────────────────────────────────────────────
// Returns all UAT sign-offs for the logged-in SP, grouped by project title.
router.get('/uat', spAuth, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');

    const records = await UATSignOff.find({
      removed: false,
      serviceProvider: req.serviceProvider._id,
    }).sort({ created: -1 });

    // Group by project title
    const grouped = {};
    for (const record of records) {
      const projectTitle = record.project?.title || 'Unknown Project';
      if (!grouped[projectTitle]) grouped[projectTitle] = [];
      grouped[projectTitle].push(record);
    }

    return res.status(200).json({
      success: true,
      result: { records, grouped },
      message: 'UAT sign-offs fetched successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

// ─── PATCH /api/sp-portal/uat/:id/agree ──────────────────────────────────────
// Service provider agrees to a UAT sign-off.
router.patch('/uat/:id/agree', spAuth, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');

    const record = await UATSignOff.findOne({
      _id: req.params.id,
      removed: false,
      serviceProvider: req.serviceProvider._id, // ensure it belongs to this SP
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }

    record.signOffStatus = 'agreed';
    record.signOffReason = req.body.reason || '';
    record.signOffAt     = new Date();
    record.updated       = new Date();
    await record.save();

    return res.status(200).json({
      success: true,
      result: record,
      message: 'You have agreed to this UAT sign-off.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

// ─── PATCH /api/sp-portal/uat/:id/disagree ───────────────────────────────────
// Service provider disagrees with a UAT sign-off (reason required).
router.patch('/uat/:id/disagree', spAuth, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');

    const reason = (req.body.reason || '').trim();
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A reason is required when disagreeing with a UAT sign-off.',
      });
    }

    const record = await UATSignOff.findOne({
      _id: req.params.id,
      removed: false,
      serviceProvider: req.serviceProvider._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }

    record.signOffStatus = 'disagreed';
    record.signOffReason = reason;
    record.signOffAt     = new Date();
    record.updated       = new Date();
    await record.save();

    return res.status(200).json({
      success: true,
      result: record,
      message: 'Your disagreement has been recorded.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

router.patch('/uat/:id/respond', spAuth, async (req, res) => {
  try {
    req.params.id = req.params.id;
    return await uatSignOffController.respond(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

module.exports = router;
