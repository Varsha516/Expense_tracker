import React from 'react';
import { Printer, X, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

const PrintableReportView = ({ reportData, aiSummary, onClose }) => {
  if (!reportData) return null;

  const { summary, periodComparison, topCategories, categoryBreakdown, periodDates, largestExpense } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full text-slate-900 shadow-2xl space-y-6 print:shadow-none print:w-full print:rounded-none">
        {/* Header Bar (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Printable Financial Report</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="space-y-6">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">ExpenseAI Financial Report</h1>
              <p className="text-sm text-slate-500 mt-1">
                Period: {formatDate(periodDates?.startDate)} – {formatDate(periodDates?.endDate)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Generated On</span>
              <span className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Income</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                ₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</span>
              <p className="text-xl font-extrabold text-red-600 mt-1">
                ₹{summary?.totalExpense?.toLocaleString('en-IN') || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Net Savings</span>
              <p className={`text-xl font-extrabold mt-1 ${summary?.netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                ₹{summary?.netSavings?.toLocaleString('en-IN') || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Savings Rate</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {summary?.savingsRate || 0}%
              </p>
            </div>
          </div>

          {/* AI Executive Summary */}
          {aiSummary && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Executive Summary
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">{aiSummary}</p>
            </div>
          )}

          {/* Period Comparison */}
          {periodComparison?.comparisonAvailable && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Period Comparison (vs {periodComparison.prevPeriodLabel})
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-500 block">Expense Change</span>
                  <span className={`font-extrabold text-sm ${periodComparison.expenseChangePct >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {periodComparison.expenseChangePct >= 0 ? '+' : ''}{periodComparison.expenseChangePct?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Income Change</span>
                  <span className={`font-extrabold text-sm ${periodComparison.incomeChangePct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {periodComparison.incomeChangePct >= 0 ? '+' : ''}{periodComparison.incomeChangePct?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Savings Change</span>
                  <span className={`font-extrabold text-sm ${periodComparison.savingsChangePct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {periodComparison.savingsChangePct >= 0 ? '+' : ''}{periodComparison.savingsChangePct?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category Spending Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category Spending Breakdown</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                  <th className="py-2 text-right">% of Total</th>
                  {periodComparison?.comparisonAvailable && <th className="py-2 text-right">vs Previous</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(categoryBreakdown || []).map((cat, idx) => (
                  <tr key={idx} className="font-medium text-slate-800">
                    <td className="py-2">{cat.category}</td>
                    <td className="py-2 text-right font-extrabold">₹{cat.spent.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">{cat.percentageOfTotal}%</td>
                    {periodComparison?.comparisonAvailable && (
                      <td className="py-2 text-right">
                        {cat.changePct !== null ? (
                          <span className={cat.changePct >= 0 ? 'text-red-600' : 'text-emerald-600'}>
                            {cat.changePct >= 0 ? '+' : ''}{cat.changePct}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Largest Expense Item */}
          {largestExpense && (
            <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <span><strong>Largest Expense:</strong> {largestExpense.title} ({largestExpense.category})</span>
              <strong className="text-slate-900 text-sm">₹{largestExpense.amount?.toLocaleString('en-IN')}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintableReportView;
