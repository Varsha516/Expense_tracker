import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  AlertCircle,
  IndianRupee,
  Layers,
  PiggyBank,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { fetchTransactions } from '../api/transactionApi'
import { fetchFinancialForecast } from '../api/recurringApi'
import StatCard from '../components/charts/StatCard'
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent
} from '../components/charts/ChartComponents'
import ForecastSection from '../components/analytics/ForecastSection'
import { getCategoryIcon, getCategoryColor } from '../utils/helpers'

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const Analytics = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeframe, setTimeframe] = useState('all')

  // 1. Fetch User Transactions & Financial Forecast on Mount
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setErrorMsg('')
        const [data, fcData] = await Promise.all([
          fetchTransactions().catch(() => []),
          fetchFinancialForecast().catch(() => null)
        ])
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data?.transactions || [])
          setTransactions(list)
          setForecastData(fcData)
        }
      } catch (err) {
        console.error('Failed to load transactions for analytics:', err)
        if (err.response?.status === 401) {
          logout()
          return
        }
        if (isMounted) {
          setErrorMsg(
            err.response?.data?.error ||
              'Failed to load transactions from backend database.'
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

  // 2. Filter Transactions by Timeframe
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    return transactions.filter((t) => {
      if (!t.date) return false
      const d = new Date(t.date)
      if (isNaN(d.getTime())) return false

      if (timeframe === 'this_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      }
      if (timeframe === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
        return (
          d.getFullYear() === lastMonthDate.getFullYear() &&
          d.getMonth() === lastMonthDate.getMonth()
        )
      }
      if (timeframe === 'last_3_months') {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1)
        return d >= threeMonthsAgo
      }
      if (timeframe === 'last_6_months') {
        const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1)
        return d >= sixMonthsAgo
      }
      if (timeframe === 'this_year') {
        return d.getFullYear() === currentYear
      }
      return true // 'all'
    })
  }, [transactions, timeframe])

  // 3. Core Financial Overview Metrics
  const summaryMetrics = useMemo(() => {
    let income = 0
    let expense = 0

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0
      if (t.type === 'income') {
        income += amt
      } else if (t.type === 'expense') {
        expense += amt
      }
    })

    const netBalance = income - expense
    const savingsRate =
      income > 0 ? Math.max(0, ((netBalance / income) * 100)).toFixed(1) : '0'

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance,
      savingsRate: Number(savingsRate)
    }
  }, [filteredTransactions])

  // 4. Budget Performance Metrics
  const budgetPerformance = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let spent = 0
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense' && t.date) {
        const d = new Date(t.date)
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          spent += Number(t.amount) || 0
        }
      }
    })

    const monthlyBudget = user?.budget ? Number(user.budget) : null

    if (!monthlyBudget || monthlyBudget <= 0) {
      return { hasBudget: false }
    }

    const remaining = monthlyBudget - spent
    const usagePct = (spent / monthlyBudget) * 100
    const clampedPct = Math.min(Math.max(usagePct, 0), 100)

    let status = 'Healthy'
    let statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-200'

    if (usagePct > 100) {
      status = 'Over Budget'
      statusBg = 'bg-red-100 text-red-800 border-red-200'
    } else if (usagePct >= 90) {
      status = 'Near Budget Limit'
      statusBg = 'bg-rose-100 text-rose-800 border-rose-200'
    } else if (usagePct >= 70) {
      status = 'Approaching Limit'
      statusBg = 'bg-amber-100 text-amber-800 border-amber-200'
    }

    return {
      hasBudget: true,
      monthlyBudget,
      spent,
      remaining,
      usagePct: Number(usagePct.toFixed(1)),
      clampedPct,
      status,
      statusBg
    }
  }, [filteredTransactions, user?.budget])

  // 4. Monthly Grouping (Income vs Expense & Trend Data)
  const monthlyData = useMemo(() => {
    const map = new Map()

    filteredTransactions.forEach((t) => {
      if (!t.date) return
      const d = new Date(t.date)
      if (isNaN(d.getTime())) return

      const year = d.getFullYear()
      const monthIdx = d.getMonth()
      const sortKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
      const label = `${monthNames[monthIdx]} ${year}`

      if (!map.has(sortKey)) {
        map.set(sortKey, {
          sortKey,
          year,
          monthIdx,
          name: label,
          Income: 0,
          Expense: 0,
          value: 0 // for expense trend line chart
        })
      }

      const entry = map.get(sortKey)
      const amt = Number(t.amount) || 0
      if (t.type === 'income') {
        entry.Income += amt
      } else if (t.type === 'expense') {
        entry.Expense += amt
        entry.value += amt
      }
    })

    // Sort chronologically by sortKey
    return Array.from(map.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey)
    )
  }, [filteredTransactions])

  // 5. Category Distribution (Pie Chart & Top Spending Categories)
  const categoryData = useMemo(() => {
    const map = new Map()
    let totalExpenseSum = 0

    filteredTransactions.forEach((t) => {
      if (t.type !== 'expense') return

      const amt = Number(t.amount) || 0
      totalExpenseSum += amt

      let catName = (t.category || '').trim()
      if (!catName) {
        catName = 'Other'
      } else {
        // Capitalize first letter
        catName = catName.charAt(0).toUpperCase() + catName.slice(1)
      }

      map.set(catName, (map.get(catName) || 0) + amt)
    })

    const list = Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage:
          totalExpenseSum > 0
            ? ((value / totalExpenseSum) * 100).toFixed(1)
            : '0'
      }))
      .sort((a, b) => b.value - a.value)

    return {
      list,
      totalExpenseSum
    }
  }, [filteredTransactions])

  // 6. Monthly Financial Breakdown List
  const monthlyBreakdown = useMemo(() => {
    return monthlyData.map((m) => {
      const savings = m.Income - m.Expense
      const savingsPct =
        m.Income > 0 ? Math.max(0, ((savings / m.Income) * 100)).toFixed(1) : '0'

      return {
        month: m.name,
        income: m.Income,
        expense: m.Expense,
        savings,
        savingsPct
      }
    })
  }, [monthlyData])

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-2">
            In-depth financial performance & spending trends from PostgreSQL
          </p>
        </div>

        {/* Timeframe Filter Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 self-start lg:self-auto flex-wrap">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Timeframe:
          </span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-sm font-medium">Analyzing financial data from database...</p>
        </div>
      ) : transactions.length === 0 ? (
        /* Empty State: 0 Transactions in DB */
        <div className="py-20 bg-white rounded-3xl shadow-sm border border-slate-200 text-center px-4">
          <IndianRupee className="mx-auto text-slate-300 w-16 h-16 mb-4" />
          <h3 className="text-2xl font-bold text-slate-800">
            No transaction data available yet
          </h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6">
            Add your income and expense transactions to start generating automated financial charts and analytics.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      ) : (
        <>
          {/* Top Financial Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Income"
              value={summaryMetrics.totalIncome}
              prefix="₹"
              icon={TrendingUp}
              gradient="from-emerald-500 to-teal-600"
            />

            <StatCard
              title="Total Expenses"
              value={summaryMetrics.totalExpense}
              prefix="₹"
              icon={TrendingDown}
              gradient="from-red-500 to-rose-600"
            />

            <StatCard
              title="Net Balance"
              value={summaryMetrics.netBalance}
              prefix="₹"
              icon={Wallet}
              gradient="from-blue-500 to-cyan-600"
            />

            <StatCard
              title="Savings Rate"
              value={summaryMetrics.savingsRate}
              suffix="%"
              icon={PiggyBank}
              gradient="from-purple-500 to-indigo-600"
            />
          </div>

          {/* Budget Performance Summary Section */}
          {budgetPerformance.hasBudget && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Budget Performance
                    </h3>
                    <p className="text-xs text-slate-400">
                      Current month budget vs actual spending
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${budgetPerformance.statusBg}`}
                >
                  {budgetPerformance.status}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Monthly Budget</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    ₹{budgetPerformance.monthlyBudget.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Current Month Spent</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    ₹{budgetPerformance.spent.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    {budgetPerformance.remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}
                  </p>
                  <p
                    className={`text-xl font-bold mt-1 ${
                      budgetPerformance.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {budgetPerformance.remaining >= 0
                      ? `₹${budgetPerformance.remaining.toLocaleString('en-IN')}`
                      : `₹${Math.abs(budgetPerformance.remaining).toLocaleString('en-IN')} over budget`}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Budget Usage</p>
                  <p
                    className={`text-xl font-bold mt-1 ${
                      budgetPerformance.usagePct > 100 ? 'text-red-600' : 'text-slate-900'
                    }`}
                  >
                    {budgetPerformance.usagePct}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Charts Row 1: Monthly Income vs Expense & Expense Trend Line */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Monthly Income vs Expense */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BarChartComponent
                title="Monthly Income vs Expenses"
                data={monthlyData}
                bars={[
                  { key: 'Income', fill: '#10b981' },
                  { key: 'Expense', fill: '#ef4444' }
                ]}
              />
            </motion.div>

            {/* Line Chart: Expense Trend Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LineChartComponent
                title="Expense Trend Over Time"
                data={monthlyData}
                dataKey="Expense"
              />
            </motion.div>
          </div>

          {/* Charts Row 2: Category Distribution & Top Spending Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart: Expense by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PieChartComponent
                title="Expense Distribution by Category"
                data={categoryData.list}
              />
            </motion.div>

            {/* Ranked List: Top Spending Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Top Spending Categories
                </h3>
                <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 rounded-full">
                  Expenses Only
                </span>
              </div>

              {categoryData.list.length === 0 ? (
                <p className="text-slate-400 text-center py-10">
                  No expense records found in this timeframe.
                </p>
              ) : (
                <div className="space-y-4">
                  {categoryData.list.slice(0, 6).map((cat, idx) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {idx + 1}
                          </span>
                          <span className="text-base">{getCategoryIcon(cat.name)}</span>
                          <span className="font-semibold text-slate-800">
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">
                            ₹{cat.value.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            ({cat.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Financial Forecast & Projections Section */}
          <ForecastSection forecast={forecastData} loading={loading} />

          {/* AI Financial Advisory Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Financial Insights & Recommendations</h3>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  Automated analysis of your income, category distribution, and monthly cash flow patterns to improve savings.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/insights')}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-sm transition shadow-lg self-start sm:self-auto flex-shrink-0"
            >
              View Full AI Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Section: Monthly Financial Breakdown Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Monthly Financial Summary
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Detailed income, expenses, and savings breakdown per month
                </p>
              </div>
            </div>

            {monthlyBreakdown.length === 0 ? (
              <p className="text-slate-400 text-center py-10">
                No monthly data recorded for this timeframe.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-4">Month</th>
                      <th className="py-4 px-4 text-right">Income</th>
                      <th className="py-4 px-4 text-right">Expenses</th>
                      <th className="py-4 px-4 text-right">Net Savings</th>
                      <th className="py-4 px-4 text-right">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyBreakdown.map((m) => (
                      <tr key={m.month} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {m.month}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-600">
                          ₹{m.income.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-red-500">
                          ₹{m.expense.toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-bold ${
                            m.savings >= 0 ? 'text-blue-600' : 'text-rose-600'
                          }`}
                        >
                          ₹{m.savings.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              Number(m.savingsPct) >= 20
                                ? 'bg-emerald-100 text-emerald-700'
                                : Number(m.savingsPct) > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {m.savingsPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Analytics
