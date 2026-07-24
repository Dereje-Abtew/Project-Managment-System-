const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Define report routes
// /api/reports
router.route('/')
  .get(reportController.getReports);

// /api/reports/export/pdf
router.route('/export/pdf')
  .get(reportController.exportPDF);

// /api/reports/export/excel
router.route('/export/excel')
  .get(reportController.exportExcel);

module.exports = router;
