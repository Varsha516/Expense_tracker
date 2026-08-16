import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  PiggyBank,
  RefreshCw,
  Loader2,
  AlertCircle,
  Plus,
  ArrowRight,
  IndianRupee,
  Activity,
  Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { fetchAIInsights } from '../api/insightApi'

const Insights = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const loadInsights = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      const res = await fetchAIInsights()
      setData(res)
    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorMsg(
        err.response?.data?.error ||
          'Failed to generate AI financial insights. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInsights()
  }, [])

  const insights = data?.insights
  const stats = data?.stats

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300'
      case 'Good':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Needs Attention':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              AI Financial Insights
            </h1>
          </div>
          <p className="text-slate-500 mt-2">
            Automated AI analysis & personalized recommendations from your PostgreSQL database
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={loading}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-2xl transition shadow-sm self-start lg:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate Insights
        </button>
      </div>

      {/* Error Alert with Retry */}
      {errorMsg && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-700 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
            <span className="font-semibold text-base">{errorMsg}</span>
          </div>
          <button
            onClick={loadInsights}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-24 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-slate-400 gap-4 text-center px-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-5 left-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Generating AI Financial Insights...
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Analyzing cash flows, spending patterns, monthly trends, and savings metrics...
            </p>
          </div>
        </div>
      ) : data?.empty ? (
        /* Empty State: 0 Transactions */
        <div className="py-20 bg-white rounded-3xl shadow-sm border border-slate-200 text-center px-4 space-y-4">
          <IndianRupee className="mx-auto text-slate-300 w-16 h-16" />
          <h3 className="text-2xl font-bold text-slate-800">
            No transaction data available for AI analysis yet
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Add your income and expense transactions to generate automated AI insights, health scores, and personalized recommendations.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      ) : insights ? (
        <>
          {/* Top Banner: Financial Health Score & Summary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 uppercase tracking-wider">
                    Financial Health Overview
                  </span>
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      insights.healthStatus
                    )}`}
                  >
                    Status: {insights.healthStatus}
                  </span>
                </div>

                <p className="text-lg leading-relaxed text-slate-200">
                  {insights.financialHealthSummary}
                </p>
              </div>

              {/* Health Score Gauge */}
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-3xl min-w-[200px] text-center self-start lg:self-auto">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Health Score
                </span>
                <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 my-2">
                  {insights.healthScore}
                  <span className="text-xl text-slate-400 font-normal">/100</span>
                </div>
                <span className="text-xs text-slate-300">
                  Based on savings & cash flow
                </span>
              </div>
            </div>
          </motion.div>

          {/* Section 1: Personalized Recommendations & Suggested Savings Goal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommendations (Span 2) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Personalized Recommendations
                </h3>
              </div>

              <div className="space-y-3">
                {insights.personalizedRecommendations?.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-start gap-3 text-slate-800 text-sm font-medium"
                  >
                    <ArrowRight className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Suggested Savings Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Suggested Savings Goal
                  </h3>
                </div>

                <div className="py-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase">
                    Target Monthly Savings
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                    ₹{insights.suggestedSavingsGoal?.targetMonthlySavings?.toLocaleString('en-IN')}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {insights.suggestedSavingsGoal?.description}
                </p>
              </div>

              <button
                onClick={() => navigate('/settings')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition text-center"
              >
                Adjust Budget Settings
              </button>
            </motion.div>
          </div>

          {/* Section 2: Positive Habits & Areas of Concern */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive Habits */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Positive Financial Habits
                </h3>
              </div>

              <div className="space-y-3">
                {insights.positiveHabits?.map((habit, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-start gap-3 text-slate-800 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Areas of Concern */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Areas of Concern & Warnings
                </h3>
              </div>

              <div className="space-y-3">
                {insights.areasOfConcern?.map((concern, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-start gap-3 text-slate-800 text-sm font-medium"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{concern}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Section 3: Spending Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Detailed Spending Analysis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.spendingAnalysis?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-sm font-medium leading-relaxed flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  )
}

export default Insights
