const prisma = require('../config/db');
const { getFinancialReportData } = require('../services/reportService');
const { generateFinancialInsights } = require('../services/aiService');

// GET FINANCIAL REPORT
const getFinancialReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, startDate, endDate } = req.query;

    const report = await getFinancialReportData(userId, period, startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: error.message });
  }
};

// EXPORT FILTERED TRANSACTIONS TO CSV
const exportTransactionsCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search,
      type,
      category,
      dateRange,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      recurringStatus
    } = req.query;

    const where = { userId };

    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      const numSearch = Number(trimmedSearch);
      const isNum = !isNaN(numSearch);
      where.OR = [
        { title: { contains: trimmedSearch, mode: 'insensitive' } },
        { description: { contains: trimmedSearch, mode: 'insensitive' } },
        { category: { contains: trimmedSearch, mode: 'insensitive' } },
        ...(isNum ? [{ amount: numSearch }] : [])
      ];
    }

    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = { equals: category, mode: 'insensitive' };

    const now = new Date();
    if (dateRange && dateRange !== 'all') {
      let start, end;
      if (dateRange === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (dateRange === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (dateRange === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (dateRange === 'last_3_months') {
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (dateRange === 'this_year') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else if (dateRange === 'custom') {
        if (startDate) start = new Date(startDate);
        if (endDate) {
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
      }

      if (start || end) {
        where.date = {};
        if (start) where.date.gte = start;
        if (end) where.date.lte = end;
      }
    }

    if (minAmount !== undefined && minAmount !== '') {
      where.amount = { ...(where.amount || {}), gte: Number(minAmount) };
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      where.amount = { ...(where.amount || {}), lte: Number(maxAmount) };
    }

    if (recurringStatus === 'recurring') where.recurringId = { not: null };
    else if (recurringStatus === 'one_time') where.recurringId = null;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Build CSV Header & Rows
    const headers = ['Date', 'Type', 'Category', 'Title', 'Amount (INR)', 'Description', 'Recurring Status'];
    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = transactions.map((t) => [
      new Date(t.date).toISOString().split('T')[0],
      t.type.toUpperCase(),
      escapeCsv(t.category || 'General'),
      escapeCsv(t.title || ''),
      t.amount,
      escapeCsv(t.description || ''),
      t.recurringId ? 'Recurring' : 'One-time'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
};

// GENERATE AI REPORT SUMMARY
const generateReportAISummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, startDate, endDate } = req.body;

    const report = await getFinancialReportData(userId, period, startDate, endDate);

    // Call existing AI service passing report metrics
    const aiResponse = await generateFinancialInsights(userId, {
      reportSummary: report.summary,
      periodComparison: report.periodComparison,
      topCategories: report.topCategories,
      largestExpense: report.largestExpense
    });

    res.status(200).json({
      aiSummary: aiResponse
    });
  } catch (error) {
    console.error('Error generating AI report summary:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFinancialReport,
  exportTransactionsCSV,
  generateReportAISummary
};
