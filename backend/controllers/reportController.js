const Report = require('../models/appModels/Report');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// 1. Get Paginated Reports for Dashboard Data Table
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.projectName = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.status) {
       query['status.scope'] = req.query.status;
    }

    const reports = await Report.find(query).skip(skip).limit(limit).sort({ startDate: -1 });
    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// 2. Export to PDF (CodeIgniter style)
exports.exportPDF = async (req, res) => {
  try {
    const reports = await Report.find().sort({ startDate: -1 });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Project Reports', { align: 'center' });
    doc.moveDown();

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Project Name', 50, doc.y, { continued: true, width: 150 });
    doc.text('Status', 200, doc.y, { continued: true, width: 100 });
    doc.text('Budget', 300, doc.y, { continued: true, width: 100 });
    doc.text('Schedule', 400, doc.y, { width: 100 });
    doc.moveDown(0.5);

    // Table Divider
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.5);

    // Table Rows
    doc.font('Helvetica').fontSize(10);
    reports.forEach((report) => {
      // Ensure we have enough space for the row
      if (doc.y > 750) {
        doc.addPage();
      }

      doc.text(report.projectName || 'N/A', 50, doc.y, { continued: true, width: 150 });
      doc.text(report.status?.scope || 'N/A', 200, doc.y, { continued: true, width: 100 });
      doc.text(report.status?.budget || 'N/A', 300, doc.y, { continued: true, width: 100 });
      doc.text(report.status?.schedule || 'N/A', 400, doc.y, { width: 100 });
      doc.moveDown(0.5);
      
      doc.moveTo(50, doc.y).lineTo(500, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error generating PDF' });
  }
};

// 3. Export to Excel (CodeIgniter style)
exports.exportExcel = async (req, res) => {
  try {
    const reports = await Report.find().sort({ startDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Project Reports');

    worksheet.columns = [
      { header: 'Project Name', key: 'projectName', width: 30 },
      { header: 'Status Scope', key: 'statusScope', width: 20 },
      { header: 'Budget', key: 'budget', width: 20 },
      { header: 'Schedule', key: 'schedule', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 20 },
      { header: 'End Date', key: 'endDate', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };

    reports.forEach((report) => {
      worksheet.addRow({
        projectName: report.projectName,
        statusScope: report.status?.scope,
        budget: report.status?.budget,
        schedule: report.status?.schedule,
        startDate: report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A',
        endDate: report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error generating Excel' });
  }
};
