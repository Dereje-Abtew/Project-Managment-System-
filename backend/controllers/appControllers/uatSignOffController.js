const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { pushHistoryEntry, getNextStatusFromAction } = require('@/utils/uatWorkflow');

const UATSignOff = mongoose.model('UATSignOff');

async function nextUATNumber() {
  const last = await UATSignOff.findOne({ removed: false, uatNumber: { $exists: true, $ne: '' } })
    .sort({ created: -1 })
    .select('uatNumber');
  if (!last?.uatNumber) return 'UAT-001';
  const match = last.uatNumber.match(/(\d+)$/);
  const next = match ? parseInt(match[1], 10) + 1 : 1;
  return `UAT-${String(next).padStart(3, '0')}`;
}

function buildPdfBuffer(record) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('UAT Sign-Off Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`UAT Number: ${record.uatNumber || 'N/A'}`);
    doc.text(`Project: ${record.project?.title || record.project || 'N/A'}`);
    doc.text(`Stakeholder: ${record.serviceProvider?.name || record.serviceProvider || 'N/A'}`);
    doc.text(`Sent By: ${record.sentBy || 'N/A'}`);
    doc.text(`Date: ${record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}`);
    doc.text(`Status: ${record.responseStatus === 'submitted' ? 'Submitted' : 'Pending'}`);
    doc.moveDown(1);
    doc.fontSize(12).text('Feature Results');
    doc.moveDown(0.3);

    const rows = Array.isArray(record.features) ? record.features : [];
    rows.forEach((feature, index) => {
      doc.fontSize(10);
      doc.text(`${index + 1}. ${feature.feature || 'Unnamed feature'}`);
      doc.text(`   Result: ${feature.testResult || 'pending'}`);
      doc.text(`   Business Validation Confirmed: ${feature.businessValidationConfirmed ? 'Yes' : 'No'}`);
      if (feature.remark) doc.text(`   Remark: ${feature.remark}`);
      doc.moveDown(0.3);
    });

    if (record.overallRemark) {
      doc.moveDown(0.5);
      doc.text(`Overall Remark: ${record.overallRemark}`);
    }

    doc.end();
  });
}

async function attachPdfToProject(record) {
  const Project = mongoose.model('Project');
  
  await Project.updateOne(
    { _id: record.project, removed: false },
    {
      $push: {
        uatReports: {
          name: record.pdfReport.name,
          url: record.pdfReport.url,
          generatedAt: new Date(),
        }
      }
    }
  );
  return null;
}

exports.list = async (req, res) => {
  try {
    const result = await UATSignOff.find({ removed: false }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'UAT sign-offs fetched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.read = async (req, res) => {
  try {
    const result = await UATSignOff.findOne({ _id: req.params.id, removed: false });
    if (!result) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    return res.status(200).json({ success: true, result, message: 'UAT sign-off fetched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { sentBy, date, project, features } = req.body;

    if (!sentBy || !project) {
      return res.status(400).json({ success: false, message: 'sentBy and project are required.' });
    }
    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one feature is required.' });
    }

    let serviceProvider = req.body.serviceProvider;
    if (!serviceProvider) {
      const Project = mongoose.model('Project');
      const projectDoc = await Project.findOne({ _id: project, removed: false }).populate('ownerName');
      // ownerName is now a User reference (stakeholder user)
      serviceProvider = projectDoc?.ownerName?._id;
    }

    const uatNumber = await nextUATNumber();

    const normalizedFeatures = features.map((f, i) => ({
      no: i + 1,
      feature: f.feature || '',
      businessValidationConfirmed: f.businessValidationConfirmed || '',
      pass: f.pass || false,
      fail: f.fail || false,
      remark: f.remark || '',
    }));

    const record = await new UATSignOff({
      uatNumber,
      sentBy,
      date: date || new Date(),
      project,
      serviceProvider,
      features: normalizedFeatures,
      responseStatus: 'pending',
      signOffStatus: 'pending',
    }).save();

    return res.status(200).json({ success: true, result: record, message: 'UAT sign-off created.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await UATSignOff.findOne({ _id: req.params.id, removed: false });
    if (!record) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });

    // If the UAT was previously submitted, any new update by the PM should reset it to pending so the SP can respond again.
    if (record.responseStatus === 'submitted') {
      record.responseStatus = 'pending';
      record.signOffStatus = 'pending';
    }

    const { sentBy, date, project, features, serviceProvider } = req.body;

    if (sentBy) record.sentBy = sentBy;
    if (date) record.date = date;
    if (project) record.project = project;

    let resolvedServiceProvider = serviceProvider || record.serviceProvider;
    if (!resolvedServiceProvider && project) {
      const Project = mongoose.model('Project');
      const projectDoc = await Project.findOne({ _id: project, removed: false }).populate('ownerName');
      resolvedServiceProvider = projectDoc?.ownerName?._id || resolvedServiceProvider;
    }
    if (resolvedServiceProvider) record.serviceProvider = resolvedServiceProvider;

    if (Array.isArray(features) && features.length > 0) {
      record.features = features.map((f, i) => ({
        no: i + 1,
        feature: f.feature || '',
        businessValidationConfirmed: f.businessValidationConfirmed || '',
        pass: f.pass || false,
        fail: f.fail || false,
        remark: f.remark || '',
      }));
    }

    record.updated = new Date();
    await record.save();

    return res.status(200).json({ success: true, result: record, message: 'UAT sign-off updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await UATSignOff.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { removed: true, updated: new Date() },
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    return res.status(200).json({ success: true, result, message: 'UAT sign-off deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.listByProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID.' });
    }
    const result = await UATSignOff.find({ removed: false, project: req.params.projectId }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'UAT sign-offs for project fetched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.listByProvider = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID.' });
    }
    const result = await UATSignOff.find({ removed: false, serviceProvider: req.params.providerId }).sort({ created: -1 });
    return res.status(200).json({ success: true, result, message: 'UAT sign-offs for provider fetched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.respond = async (req, res) => {
  try {
    const record = await UATSignOff.findOne({ _id: req.params.id, removed: false });
    if (!record) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });

    const { respondedBy, overallRemark, features } = req.body;
    const previousStatus = record.signOffStatus || 'pending';

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ success: false, message: 'Feature results are required.' });
    }

    const allResponded = features.every((f) => f.pass === true || f.fail === true);
    if (!allResponded) {
      return res.status(400).json({ success: false, message: 'All features must be marked Pass or Fail before submitting.' });
    }

    const featureMap = {};
    for (const feature of features) featureMap[String(feature._id)] = feature;

    record.features = record.features.map((feature) => {
      const response = featureMap[String(feature._id)];
      if (response) {
        feature.pass = response.pass;
        feature.fail = response.fail;
        feature.remark = response.remark || '';
      }
      return feature;
    });

    record.responseStatus = 'submitted';
    record.signOffStatus = 'submitted';
    record.respondedAt = new Date();
    record.respondedBy = respondedBy || '';
    record.overallRemark = overallRemark || '';
    if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
    pushHistoryEntry(record.reviewHistory, {
      action: 'submitted',
      performedBy: respondedBy || '',
      note: overallRemark || 'UAT response submitted.',
      statusBefore: previousStatus,
      statusAfter: 'submitted',
    }, new Date());

    const pdfBuffer = await buildPdfBuffer(record);
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    record.pdfReport = {
      name: `${record.uatNumber || 'UAT'}.pdf`,
      url: pdfDataUrl,
      generatedAt: new Date(),
    };
    record.attachedToProject = true;
    record.updated = new Date();
    await record.save();

    await attachPdfToProject(record);

    return res.status(200).json({ success: true, result: record, message: 'UAT response submitted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.attachPdf = async (req, res) => {
  try {
    const UATRecord = await UATSignOff.findOne({ _id: req.params.id, removed: false });
    if (!UATRecord) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });
    if (!UATRecord.pdfReport?.url) {
      return res.status(400).json({ success: false, message: 'No PDF report found. The SP must submit their response first.' });
    }

    await attachPdfToProject(UATRecord, req);
    UATRecord.attachedToProject = true;
    UATRecord.updated = new Date();
    await UATRecord.save();

    return res.status(200).json({ success: true, result: UATRecord, message: 'PDF report attached to project.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.reverseApproval = async (req, res) => {
  try {
    const record = await UATSignOff.findOne({ _id: req.params.id, removed: false });
    if (!record) return res.status(404).json({ success: false, message: 'UAT sign-off not found.' });

    const reverseReason = (req.body.reason || '').trim();
    if (!reverseReason || reverseReason.length < 10) {
      return res.status(400).json({ success: false, message: 'A reverse reason is required with at least 10 characters.' });
    }

    const previousStatus = record.signOffStatus || 'pending';
    record.signOffStatus = 'pending';
    record.signOffReason = reverseReason;
    record.signOffAt = new Date();
    record.updated = new Date();
    record.responseStatus = 'pending';
    if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
    pushHistoryEntry(record.reviewHistory, {
      action: 'approval_reversed',
      performedBy: req.body.performedBy || '',
      note: reverseReason,
      statusBefore: previousStatus,
      statusAfter: 'pending',
    }, new Date());

    await record.save();
    return res.status(200).json({ success: true, result: record, message: 'UAT approval reversed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const result = await UATSignOff.find({
      removed: false,
      $or: [
        { sentBy: { $regex: q, $options: 'i' } },
        { uatNumber: { $regex: q, $options: 'i' } },
      ],
    }).limit(10);
    return res.status(200).json({ success: true, result, message: 'Search results.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.filter = async (req, res) => {
  try {
    const { filter, equal } = req.query;
    if (!filter || !equal) {
      return res.status(400).json({ success: false, message: 'filter and equal params required.' });
    }
    const result = await UATSignOff.find({ removed: false, [filter]: equal });
    return res.status(200).json({ success: true, result, message: 'Filtered results.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
