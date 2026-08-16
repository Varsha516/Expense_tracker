import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { fetchFinancialReport, exportTransactionsCSV, fetchReportAISummary } from '../api/reportApi';
import PrintableReportView from '../components/reports/PrintableReportView';
import { getCategoryIcon, getCategoryColor } from '../utils/helpers';

const ReportsPage = () => {
  const [period, setPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportType, setReportType] = useState('monthly'); // 'monthly' | 'category' | 'trend'

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await fetchFinancialReport(
        period,
        period === 'custom' ? customStartDate : undefined,
        period === 'custom' ? customEndDate : undefined
      );
      setReportData(data);
      setAiSummary('');
    } catch (err) {
      console.error('Error fetching financial report:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to load financial report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period, customStartDate, customEndDate]);

  const handleGenerateAiSummary = async () => {
    try {
      setLoadingAi(true);
      const res = await fetchReportAISummary(
        period,
        period === 'custom' ? customStartDate : undefined,
        period === 'custom' ? customEndDate : undefined
      );
      setAiSummary(res.aiSummary || 'AI report summary generated.');
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      setAiSummary('Unable to generate AI summary at this time.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportTransactionsCSV({
        dateRange: period,
        startDate: period === 'custom' ? customStartDate : undefined,
        endDate: period === 'custom' ? customEndDate : undefined
      });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('CSV export failed.');
    }
  };

  const { summary, periodComparison, categoryBreakdown, topCategories, trend, largestExpense } = reportData || {};

  return (
    <div className="space-y-8">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Financial Reports</h1>
          </div>
          <p className="text-slate-500 mt-2">
            Generate detailed period summaries, category breakdowns, period comparisons, and CSV exports
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-sm rounded-2xl shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow transition"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Period & Report Type Selection Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Period:
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="this_month">Current Month</option>
            <option value="last_month">Previous Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="this_year">Current Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Report Type Tabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Monthly Summary
          </button>

          <button
            onClick={() => setReportType('category')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'category' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Category Report
          </button>

          <button
            onClick={() => setReportType('trend')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'trend' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Income vs Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
          <p className="text-sm font-medium">Generating financial report metrics...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-8">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
              <p className="text-3xl font-black text-emerald-600">
                ₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}
              </p>
              <span className="text-xs text-slate-500 block">From {summary?.transactionCount || 0} transactions</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
              <p className="text-3xl font-black text-red-600">
                ₹{summary?.totalExpense?.toLocaleString('en-IN') || 0}
              </p>
              <span className="text-xs text-slate-500 block">Current period expenses</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Savings</span>
              <p className={`text-3xl font-black ${summary?.netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                ₹{summary?.netSavings?.toLocaleString('en-IN') || 0}
              </p>
              <span className="text-xs text-slate-500 block">Savings Rate: {summary?.savingsRate || 0}%</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Largest Expense</span>
              <p className="text-xl font-bold text-slate-900 truncate">
                {largestExpense ? largestExpense.title : 'None'}
              </p>
              <span className="text-xs text-red-600 font-bold block">
                {largestExpense ? `₹${largestExpense.amount.toLocaleString('en-IN')}` : '₹0'}
              </span>
            </div>
          </div>

          {/* AI Report Summary Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">AI Financial Report Summary</h3>
                  <p className="text-xs text-indigo-200">Automated insights based on period performance</p>
                </div>
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={loadingAi}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {loadingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {aiSummary ? 'Regenerate AI Summary' : 'Generate AI Summary'}
              </button>
            </div>

            {aiSummary && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs leading-relaxed text-indigo-100">
                {aiSummary}
              </div>
            )}
          </div>

          {/* Period Comparison Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Period-Over-Period Comparison</h3>
              {periodComparison?.comparisonAvailable ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  vs {periodComparison.prevPeriodLabel}
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Insufficient historical comparison data
                </span>
              )}
            </div>

            {periodComparison?.comparisonAvailable ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-500">Expenses Change</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{summary?.totalExpense?.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                        periodComparison.expenseChangePct >= 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {periodComparison.expenseChangePct >= 0 ? '+' : ''}
                      {periodComparison.expenseChangePct?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Previous period: ₹{periodComparison.prevExpense.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-500">Income Change</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{summary?.totalIncome?.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                        periodComparison.incomeChangePct >= 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {periodComparison.incomeChangePct >= 0 ? '+' : ''}
                      {periodComparison.incomeChangePct?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Previous period: ₹{periodComparison.prevIncome.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-500">Net Savings Change</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{summary?.netSavings?.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                        periodComparison.savingsChangePct >= 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {periodComparison.savingsChangePct >= 0 ? '+' : ''}
                      {periodComparison.savingsChangePct?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Previous period: ₹{periodComparison.prevNetSavings.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                Add transactions in previous months to unlock period-over-period financial comparison.
              </p>
            )}
          </div>

          {/* Top Spending Categories Table & Visual Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Top Spending Categories</h3>

            <div className="space-y-4">
              {(categoryBreakdown || []).map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                      <span className="font-bold text-slate-800">{cat.category}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">₹{cat.spent.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 ml-2">({cat.percentageOfTotal}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, cat.percentageOfTotal)}%` }}
                    />
                  </div>
                </div>
              ))}

              {categoryBreakdown?.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No category expense records found for this period.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Printable Report View Modal */}
      {showPrintModal && (
        <PrintableReportView
          reportData={reportData}
          aiSummary={aiSummary}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default ReportsPage;
