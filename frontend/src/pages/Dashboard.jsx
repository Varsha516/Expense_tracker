import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  Loader2,
  Wallet,
  AlertCircle,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Target,
  PieChart as PieIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../api/transactionApi'
import { fetchCategoryBudgets } from '../api/budgetApi'
import { fetchSavingsGoals } from '../api/goalApi'
import { fetchFinancialForecast } from '../api/recurringApi'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import UpcomingCommitments from '../components/recurring/UpcomingCommitments'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const [deletingId, setDeletingId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const [categoryBudgetsData, setCategoryBudgetsData] = useState({ budgets: [], summary: {} })
  const [savingsGoalsData, setSavingsGoalsData] = useState({ goals: [], avgMonthlySavings: 0 })
  const [forecastData, setForecastData] = useState(null)

  // 1. Fetch Transactions, Budgets, Goals, and Forecast on Mount
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setErrorMsg('')

        const [txData, budgetsRes, goalsRes, fcRes] = await Promise.all([
          fetchTransactions().catch(() => []),
          fetchCategoryBudgets().catch(() => ({ budgets: [], summary: {} })),
          fetchSavingsGoals().catch(() => ({ goals: [], avgMonthlySavings: 0 })),
          fetchFinancialForecast().catch(() => null)
        ])

        if (isMounted) {
          const txList = Array.isArray(txData) ? txData : (txData?.transactions || [])
          setTransactions(txList)
          setCategoryBudgetsData(budgetsRes || { budgets: [], summary: {} })
          setSavingsGoalsData(goalsRes || { goals: [], avgMonthlySavings: 0 })
          setForecastData(fcRes)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        if (err.response?.status === 401) {
          logout()
          return
        }
        if (isMounted) {
          setErrorMsg(
            err.response?.data?.error ||
              'Failed to load dashboard data from backend database.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [logout])

  // 2. Derived Calculations via useMemo
  const stats = useMemo(() => {
    let income = 0
    let expense = 0

    transactions.forEach((item) => {
      const amt = Number(item.amount) || 0
      if (item.type === 'income') {
        income += amt
      } else if (item.type === 'expense') {
        expense += amt
      }
    })

    return {
      totalCount: transactions.length,
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense
    }
  }, [transactions])

  // 3. Monthly Budget Calculations
  const budgetStats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let spent = 0
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.date) {
        const d = new Date(t.date)
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          spent += Number(t.amount) || 0
        }
      }
    })

    const monthlyBudget = user?.budget ? Number(user.budget) : null

    if (!monthlyBudget || monthlyBudget <= 0) {
      return {
        hasBudget: false,
        spent,
        monthlyBudget: null,
        remaining: 0,
        usagePct: 0,
        status: 'Unconfigured'
      }
    }

    const remaining = monthlyBudget - spent
    const usagePct = (spent / monthlyBudget) * 100
    const clampedPct = Math.min(Math.max(usagePct, 0), 100)

    let status = 'Healthy'
    let statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    let barColor = 'bg-emerald-500'

    if (usagePct > 100) {
      status = 'Over Budget'
      statusBg = 'bg-red-100 text-red-800 border-red-200'
      barColor = 'bg-red-600'
    } else if (usagePct >= 90) {
      status = 'Near Budget Limit'
      statusBg = 'bg-rose-100 text-rose-800 border-rose-200'
      barColor = 'bg-rose-500'
    } else if (usagePct >= 70) {
      status = 'Approaching Limit'
      statusBg = 'bg-amber-100 text-amber-800 border-amber-200'
      barColor = 'bg-amber-500'
    }

    return {
      hasBudget: true,
      spent,
      monthlyBudget,
      remaining,
      usagePct: Number(usagePct.toFixed(1)),
      clampedPct,
      status,
      statusBg,
      barColor
    }
  }, [transactions, user?.budget])

  // 4. Handle Add / Edit Submission
  const handleSaveTransaction = async (payload) => {
    setModalError('')
    setModalSubmitting(true)

    try {
      if (editingTransaction) {
        // Update existing transaction
        const updated = await updateTransaction(editingTransaction.id, payload)
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === editingTransaction.id ? updated : item
          )
        )
      } else {
        // Create new transaction
        const created = await createTransaction(payload)
        setTransactions((prev) => [created, ...prev])
      }

      setIsModalOpen(false)
      setEditingTransaction(null)
    } catch (err) {
      console.error('Save transaction error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setModalError(
        err.response?.data?.error || 'Failed to save transaction to database.'
      )
    } finally {
      setModalSubmitting(false)
    }
  }

  // 5. Handle Delete Transaction
  const handleConfirmDelete = async (id) => {
    try {
      setDeletingId(id)
      await deleteTransaction(id)
      setTransactions((prev) => prev.filter((item) => item.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Delete transaction error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      alert(
        err.response?.data?.error || 'Failed to delete transaction from database.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2">
            Manage your finances beautifully
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null)
            setModalError('')
            setIsModalOpen(true)
          }}
          className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-[1.02] transition-all duration-300 text-white font-semibold px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <p className="text-slate-500">Total Transactions</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <h2 className="text-3xl font-bold mt-3 text-slate-900">
              {stats.totalCount}
            </h2>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <p className="text-slate-500">Total Income</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <h2 className="text-3xl font-bold mt-3 text-emerald-500">
              ₹{stats.totalIncome.toLocaleString('en-IN')}
            </h2>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <p className="text-slate-500">Total Expense</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <h2 className="text-3xl font-bold mt-3 text-red-500">
              ₹{stats.totalExpense.toLocaleString('en-IN')}
            </h2>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <p className="text-slate-500">Net Balance</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <h2
              className={`text-3xl font-bold mt-3 ${
                stats.netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'
              }`}
            >
              ₹{stats.netBalance.toLocaleString('en-IN')}
            </h2>
          )}
        </motion.div>
      </div>

      {/* Monthly Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
      >
        {!budgetStats.hasBudget ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  No monthly budget set
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Configure a target spending limit to monitor your monthly expenses in real time.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm transition shadow-md self-start sm:self-auto"
            >
              Set Budget
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Monthly Budget
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target expense limit for current month
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${budgetStats.statusBg}`}
                >
                  {budgetStats.status}
                </span>

                <button
                  onClick={() => navigate('/settings')}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Edit Budget
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Monthly Budget</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  ₹{budgetStats.monthlyBudget.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Current Month Spent</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  ₹{budgetStats.spent.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  {budgetStats.remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}
                </p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    budgetStats.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {budgetStats.remaining >= 0
                    ? `₹${budgetStats.remaining.toLocaleString('en-IN')}`
                    : `₹${Math.abs(budgetStats.remaining).toLocaleString('en-IN')} over budget`}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Budget Usage</p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    budgetStats.usagePct > 100 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {budgetStats.usagePct}%
                </p>
              </div>
            </div>

            {/* Visual Progress Bar (Clamped to 100%) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Monthly Progress</span>
                <span>{budgetStats.usagePct}% Used</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${budgetStats.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${budgetStats.clampedPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* AI Financial Insights Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">AI Financial Advisory</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/30 border border-purple-400/40 text-purple-200 uppercase tracking-wider">
                Automated
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Get personalized financial advice, spending warnings, positive habit analysis, and AI savings recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/insights')}
          className="flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-sm transition shadow-lg self-start sm:self-auto flex-shrink-0"
        >
          View Full AI Insights
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Grid: Category Budgets Overview & Savings Goals Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budgets Overview Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <PieIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Category Budgets Overview
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Manage Budgets
              </button>
            </div>

            {categoryBudgetsData.budgets?.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                No category budgets set. Create budgets for Food, Shopping, or Transport in Settings.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Total</p>
                    <p className="text-lg font-bold text-slate-800">{categoryBudgetsData.summary?.totalBudgetsCount || 0}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase">Healthy</p>
                    <p className="text-lg font-bold text-emerald-700">{categoryBudgetsData.summary?.healthyCount || 0}</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[11px] text-amber-600 font-semibold uppercase">Near Limit</p>
                    <p className="text-lg font-bold text-amber-700">{(categoryBudgetsData.summary?.approachingCount || 0) + (categoryBudgetsData.summary?.warningCount || 0)}</p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-[11px] text-red-600 font-semibold uppercase">Exceeded</p>
                    <p className="text-lg font-bold text-red-700">{categoryBudgetsData.summary?.exceededCount || 0}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {categoryBudgetsData.budgets?.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{b.category}</span>
                        <span className={b.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          ₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.usagePercentage >= 100 ? 'bg-red-600' : b.usagePercentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${b.clampedPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Savings Goals Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Active Savings Goals
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                Manage Goals
              </button>
            </div>

            {savingsGoalsData.goals?.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                No savings goals created yet. Set goals to buy a laptop or build emergency funds in Settings.
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoalsData.goals?.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">{g.name}</span>
                      <span className="font-semibold text-purple-700">{g.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                        style={{ width: `${g.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Saved: ₹{g.currentAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}</span>
                      {g.requiredMonthlySavings !== null && (
                        <span className="text-purple-600 font-semibold">₹{g.requiredMonthlySavings.toLocaleString('en-IN')}/mo target</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Financial Commitments Widget */}
      <UpcomingCommitments
        commitments={forecastData?.upcomingCommitments || []}
        loading={loading}
      />

      {/* Transactions Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Recent Transactions
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Fetching transactions from PostgreSQL...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <IndianRupee className="mx-auto text-slate-300 w-14 h-14 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">
              No transactions yet
            </h3>
            <p className="text-slate-500 mt-2">
              Start by adding your first transaction
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {transactions.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  {/* Left Info */}
                  <div className="flex items-start gap-5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt="receipt"
                        className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
                      />
                    )}

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900">
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            item.type === 'income'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <p className="text-slate-600 mt-2 font-medium">
                        {item.category || 'Uncategorized'}
                      </p>

                      <p className="text-slate-400 text-sm mt-1">
                        {formatDateDisplay(item.date)}
                      </p>

                      {(item.description || item.note) && (
                        <p className="text-slate-500 mt-3 text-sm">
                          {item.description || item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Delete Confirmation */}
                  <div className="flex items-center gap-3 self-end lg:self-center">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-2 rounded-2xl">
                        <span className="text-xs text-red-600 font-semibold px-2">
                          Delete this transaction?
                        </span>
                        <button
                          onClick={() => handleConfirmDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-1"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Confirm'
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingTransaction(item)
                            setModalError('')
                            setIsModalOpen(true)
                          }}
                          className="w-12 h-12 rounded-2xl bg-cyan-100 hover:bg-cyan-200 transition-all duration-300 flex items-center justify-center"
                          title="Edit Transaction"
                        >
                          <Pencil className="w-5 h-5 text-cyan-600" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="w-12 h-12 rounded-2xl bg-red-100 hover:bg-red-200 transition-all duration-300 flex items-center justify-center"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransaction(null)
          setModalError('')
        }}
        onAddTransaction={handleSaveTransaction}
        editingTransaction={editingTransaction}
        submitting={modalSubmitting}
        errorMsg={modalError}
      />
    </div>
  )
}

export default Dashboard