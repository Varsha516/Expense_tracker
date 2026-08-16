const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getFinancialReport,
  exportTransactionsCSV,
  generateReportAISummary
} = require('../controllers/reportController');

router.use(authMiddleware);

router.get('/', getFinancialReport);
router.get('/csv', exportTransactionsCSV);
router.post('/ai-summary', generateReportAISummary);

module.exports = router;
