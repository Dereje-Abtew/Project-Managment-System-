const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uatSignOffController = require('@/controllers/appControllers/uatSignOffController');
const { pushHistoryEntry, getNextStatusFromAction } = require('@/utils/uatWorkflow');

require('dotenv').config({ path: '.env' });

const router = express.Router();

// ─── SP JWT / App JWT middleware ───────────────────────────────────────────────
async function spAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Regular user JWT (internal staff)
    if (decoded.id) {
      const User = mongoose.model('User');
      const user = await User.findById(decoded.id)
        .populate({ path: 'role', populate: { path: 'resources.resource', model: 'Resource' } });

      if (user && !user.removed && user.enabled) {
        // DEBUG LOGGING
        console.log('\n🔐 SP AUTH MIDDLEWARE - User Authentication');
        console.log('   User ID:', user._id);
        console.log('   User ID Type:', typeof user._id);
        console.log('   User Name:', user.firstName, user.lastName);
        console.log('   User Position:', user.position || 'NOT SET');
        console.log('   User Email:', user.email);
        
        // Check if user position is "Stakeholder" (case-insensitive, allows spaces)
        const position = user.position || '';
        const isStakeholderPosition = /stakeholder/i.test(position);
        console.log('   Position Test String:', position);
        console.log('   Regex Test Result:', isStakeholderPosition);
        console.log('   Is Stakeholder Position?', isStakeholderPosition);

        if (isStakeholderPosition) {
          // Stakeholder user - will filter UATs by their user ID
          console.log('   ✅ Authenticated as STAKEHOLDER - will filter UATs by user ID');
          console.log('   Setting req.stakeholderId =', user._id);
          console.log('   Setting req.stakeholderId Type =', typeof user._id, '\n');
          req.stakeholderUser = user;
          req.stakeholderId = user._id;
          return next();
        }

        // Any other valid internal user (Global Admin, PM, Director, etc.)
        // These users access the portal as an admin/viewer - see ALL UAT records
        console.log('   ✅ Authenticated as INTERNAL USER (Admin/Staff) - will see ALL UATs\n');
        req.internalUser = user;
        return next();
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid token.' });
  } catch (err) {
    console.error('❌ SP AUTH ERROR:', err.message);
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
}

// Returns the User ID of the authenticated stakeholder, or null for admin/internal users.
function resolveStakeholderId(req) {
  return req.stakeholderId || null;
}

// ─── GET /api/sp-portal/uat ───────────────────────────────────────────────────
// Returns all UAT sign-offs for the logged-in SP, grouped by project title.
router.get('/uat', spAuth, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');
    const query = { removed: false };
    const providerId = resolveStakeholderId(req);
    
    // DEBUG LOGGING
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 SP UAT FETCH - Authentication Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (req.stakeholderUser) {
      console.log('✅ Stakeholder User Authenticated:');
      console.log('   ID:', req.stakeholderUser._id);
      console.log('   ID Type:', typeof req.stakeholderUser._id);
      console.log('   Name:', req.stakeholderUser.firstName, req.stakeholderUser.lastName);
      console.log('   Position:', req.stakeholderUser.position);
      console.log('   Email:', req.stakeholderUser.email);
    }
    if (req.internalUser) {
      console.log('✅ Internal User Authenticated (Admin/Staff):');
      console.log('   ID:', req.internalUser._id);
      console.log('   Name:', req.internalUser.firstName, req.internalUser.lastName);
      console.log('   Position:', req.internalUser.position);
    }
    console.log('🔐 Provider ID for filtering:', providerId);
    console.log('🔐 Provider ID Type:', typeof providerId);
    
    // If a Stakeholder user (position = "Stakeholder"), filter to their UATs only
    // Internal admin/staff users (no providerId) see ALL records
    if (providerId) {
      query.stakeholder = providerId;
      console.log('🔒 FILTERING: Only UATs where stakeholder =', providerId);
    } else {
      console.log('🔓 NO FILTER: Admin user - showing ALL UATs');
    }
    console.log('🔍 MongoDB Query:', JSON.stringify(query));

    const records = await UATSignOff.find(query)
      .populate({ path: 'project', select: 'title projectNumber ownerName' })
      .populate({ path: 'stakeholder', select: 'firstName lastName email position' })
      .sort({ created: -1 });

    console.log('📊 UAT Records Found:', records.length);
    if (records.length > 0) {
      console.log('📋 UAT Details:');
      records.forEach((r, i) => {
        const spName = r.stakeholder 
          ? `${r.stakeholder.firstName} ${r.stakeholder.lastName}` 
          : 'N/A';
        const spId = r.stakeholder?._id || 'N/A';
        const spIdType = typeof r.stakeholder?._id;
        console.log(`   ${i + 1}. UAT: ${r.uatNumber} | Project: ${r.project?.title || 'N/A'}`);
        console.log(`      SP: ${spName} (${spId}) [Type: ${spIdType}]`);
        console.log(`      Match: ${providerId ? (String(r.stakeholder?._id) === String(providerId) ? '✅ YES' : '❌ NO') : 'N/A (Admin)'}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
    console.error('❌ ERROR in SP UAT fetch:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

// ─── PATCH /api/sp-portal/uat/:id/agree ──────────────────────────────────────
// Stakeholder agrees to a UAT sign-off.
router.patch('/uat/:id/agree', spAuth, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');

    const providerId = resolveStakeholderId(req);
    const filter = { _id: req.params.id, removed: false };
    if (providerId) filter.stakeholder = providerId;
    const record = await UATSignOff.findOne(filter);

    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }

    const previousStatus = record.signOffStatus || 'pending';
    const nextStatus = getNextStatusFromAction('agreed');
    record.signOffStatus = nextStatus;
    record.signOffReason = req.body.reason || '';
    record.signOffAt     = new Date();
    record.updated       = new Date();
    if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
    
    const performedBy = req.stakeholderUser 
      ? `${req.stakeholderUser.firstName} ${req.stakeholderUser.lastName}`.trim()
      : 'Stakeholder';
    
    pushHistoryEntry(record.reviewHistory, {
      action: 'agreed',
      performedBy,
      note: req.body.reason || 'Stakeholder agreed to the UAT sign-off.',
      statusBefore: previousStatus,
      statusAfter: nextStatus,
    }, new Date());
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
// Stakeholder disagrees with a UAT sign-off (reason required).
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

    const providerId = resolveStakeholderId(req);
    const filter = { _id: req.params.id, removed: false };
    if (providerId) filter.stakeholder = providerId;
    const record = await UATSignOff.findOne(filter);

    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }

    const previousStatus = record.signOffStatus || 'pending';
    const nextStatus = getNextStatusFromAction('disagreed');
    record.signOffStatus = nextStatus;
    record.signOffReason = reason;
    record.signOffAt     = new Date();
    record.updated       = new Date();
    if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
    
    const performedBy = req.stakeholderUser 
      ? `${req.stakeholderUser.firstName} ${req.stakeholderUser.lastName}`.trim()
      : 'Stakeholder';
    
    pushHistoryEntry(record.reviewHistory, {
      action: 'disagreed',
      performedBy,
      note: reason,
      statusBefore: previousStatus,
      statusAfter: nextStatus,
    }, new Date());
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

async function authorizeProviderForRecord(req, res, next) {
  const providerId = resolveStakeholderId(req);
  if (providerId) {
    req.stakeholderId = providerId;
  }
  return next();
}

router.patch('/uat/:id/reverse-approval', spAuth, authorizeProviderForRecord, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');
    const filter = { _id: req.params.id, removed: false };
    if (req.stakeholderId) filter.stakeholder = req.stakeholderId;
    
    const record = await UATSignOff.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }
    req.params.id = req.params.id;
    return await uatSignOffController.reverseApproval(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

router.patch('/uat/:id/respond', spAuth, authorizeProviderForRecord, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');
    const filter = { _id: req.params.id, removed: false };
    if (req.stakeholderId) filter.stakeholder = req.stakeholderId;
    
    const record = await UATSignOff.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }
    req.params.id = req.params.id;
    return await uatSignOffController.respond(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

router.patch('/uat/:id/attach-pdf', spAuth, authorizeProviderForRecord, async (req, res) => {
  try {
    const UATSignOff = mongoose.model('UATSignOff');
    const filter = { _id: req.params.id, removed: false };
    if (req.stakeholderId) filter.stakeholder = req.stakeholderId;
    
    const record = await UATSignOff.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    }
    req.params.id = req.params.id;
    return await uatSignOffController.attachPdf(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

module.exports = router;
