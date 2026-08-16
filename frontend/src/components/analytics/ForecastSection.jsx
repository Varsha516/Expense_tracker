import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';
import { BarChartComponent } from '../charts/ChartComponents';

const ForecastSection = ({ forecast = null, loading = false }) => {
  if (loading) {
    return (
      <div className="py-12 bg-white rounded-3xl border border-slate-200 p-6 text-center text-slate-400">
        Calculating financial forecast & projections...
      </div>
    );
  }

  if (!forecast) return null;

  const {
    currentBalance = 0,
    expectedIncome = 0,
    expectedExpenses = 0,
    expectedSavings = 0,
    forecastedBalance = 0,
    warnings = []
  } = forecast;

  // Data for actual vs forecasted comparison chart
  const forecastChartData = [
    {
      name: 'Current vs Next Month',
      'Current Balance': currentBalance,
      'Forecasted Balance': forecastedBalance,
      'Expected Income': expectedIncome,
      'Expected Expenses': expectedExpenses
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Financial Forecast & Projections</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
              Next Month Model
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Calculated from historical cash flow, recurring obligations, and monthly spending patterns.
          </p>
        </div>
      </div>

      {/* Forecast Warnings / Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((w, idx) => (
            <motion.div
              key={w.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-sm font-medium ${
                w.severity === 'critical'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : w.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {w.severity === 'critical' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : w.severity === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">{w.title}</span>
                <span className="text-xs opacity-90">{w.message}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Current Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Balance</span>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{currentBalance.toLocaleString('en-IN')}
          </p>
          <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Actual
          </span>
        </div>

        {/* Expected Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expected Income</span>
          <p className="text-2xl font-extrabold text-emerald-600">
            +₹{expectedIncome.toLocaleString('en-IN')}
          </p>
          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Forecasted
          </span>
        </div>

        {/* Expected Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expected Expenses</span>
          <p className="text-2xl font-extrabold text-red-500">
            -₹{expectedExpenses.toLocaleString('en-IN')}
          </p>
          <span className="inline-block text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
            Forecasted
          </span>
        </div>

        {/* Expected Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expected Savings</span>
          <p className={`text-2xl font-extrabold ${expectedSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            ₹{expectedSavings.toLocaleString('en-IN')}
          </p>
          <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            Forecasted
          </span>
        </div>

        {/* Forecasted End Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-lg space-y-1">
          <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Forecasted Balance</span>
          <p className={`text-2xl font-extrabold ${forecastedBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{forecastedBalance.toLocaleString('en-IN')}
          </p>
          <span className="inline-block text-[10px] font-bold text-purple-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded-md">
            Next Month End
          </span>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <BarChartComponent
          title="Actual vs Forecasted Cashflow Breakdown"
          data={forecastChartData}
          bars={[
            { key: 'Current Balance', fill: '#3b82f6' },
            { key: 'Expected Income', fill: '#10b981' },
            { key: 'Expected Expenses', fill: '#ef4444' },
            { key: 'Forecasted Balance', fill: '#8b5cf6' }
          ]}
        />
      </div>
    </div>
  );
};

export default ForecastSection;
