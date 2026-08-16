import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Save,
  ShieldCheck,
  User,
  Plus,
  Pencil,
  Trash2,
  Target,
  PieChart as PieIcon,
  Sparkles,
  RotateCcw
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { getBudget, updateBudget } from '../api/userApi'
import {
  fetchCategoryBudgets,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget
} from '../api/budgetApi'
import {
  fetchSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} from '../api/goalApi'
import {
  fetchNotificationPreferences,
  updateNotificationPreferences
} from '../api/notificationApi'

import AddCategoryBudgetModal from '../components/budgets/AddCategoryBudgetModal'
import AddSavingsGoalModal from '../components/goals/AddSavingsGoalModal'
import { getCategoryIcon } from '../utils/helpers'

const Settings = () => {
  const { user, updateUserBudget, logout } = useAuth()

  // 1. Overall Profile Budget State
  const [budgetValue, setBudgetValue] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [errorProfile, setErrorProfile] = useState('')
  const [successProfile, setSuccessProfile] = useState('')

  // 2. Category Budgets State
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [loadingBudgets, setLoadingBudgets] = useState(true)
  const [errorBudgets, setErrorBudgets] = useState('')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState(null)
  const [savingCategoryModal, setSavingCategoryModal] = useState(false)
  const [categoryModalError, setCategoryModalError] = useState('')

  // 3. Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [errorGoals, setErrorGoals] = useState('')
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [savingGoalModal, setSavingGoalModal] = useState(false)
  const [goalModalError, setGoalModalError] = useState('')

  // 4. Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    recurringReminders: true,
    budgetAlerts: true,
    goalReminders: true,
    forecastWarnings: true,
    reminderDaysBefore: 1
  })
  const [loadingNotifPrefs, setLoadingNotifPrefs] = useState(true)
  const [errorNotifPrefs, setErrorNotifPrefs] = useState('')
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState('')

  // Delete Confirm State
  const [deletingBudgetId, setDeletingBudgetId] = useState(null)
  const [deletingGoalId, setDeletingGoalId] = useState(null)

  // Independent Data Loaders for each section
  const loadProfile = async () => {
    try {
      setLoadingProfile(true)
      setErrorProfile('')
      const profileRes = await getBudget()
      if (profileRes) {
        const currentBud = profileRes.budget ?? user?.budget ?? ''
        setBudgetValue(currentBud ? String(currentBud) : '')
        if (profileRes.budget !== undefined) {
          updateUserBudget(profileRes.budget)
        }
      }
    } catch (err) {
      console.error('Failed to load profile budget:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorProfile('Unable to load profile budget settings. Please try again.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadBudgets = async () => {
    try {
      setLoadingBudgets(true)
      setErrorBudgets('')
      const res = await fetchCategoryBudgets()
      setCategoryBudgets(res?.budgets || [])
    } catch (err) {
      console.error('Failed to load category budgets:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorBudgets('Unable to load category budgets. Please try again.')
    } finally {
      setLoadingBudgets(false)
    }
  }

  const loadGoals = async () => {
    try {
      setLoadingGoals(true)
      setErrorGoals('')
      const res = await fetchSavingsGoals()
      setSavingsGoals(res?.goals || [])
    } catch (err) {
      console.error('Failed to load savings goals:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorGoals('Unable to load savings goals. Please try again.')
    } finally {
      setLoadingGoals(false)
    }
  }

  const loadNotifPrefs = async () => {
    try {
      setLoadingNotifPrefs(true)
      setErrorNotifPrefs('')
      const res = await fetchNotificationPreferences()
      if (res) {
        setNotifPrefs(res)
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorNotifPrefs('Unable to load notification preferences. Please try again.')
    } finally {
      setLoadingNotifPrefs(false)
    }
  }

  // Trigger independent initial loading
  useEffect(() => {
    loadProfile()
    loadBudgets()
    loadGoals()
    loadNotifPrefs()
  }, [])

  // Save Handlers
  const handleUpdateNotifPrefs = async (updatedData) => {
    try {
      setSavingNotifPrefs(true)
      setNotifSuccess('')
      const res = await updateNotificationPreferences(updatedData)
      setNotifPrefs(res)
      setNotifSuccess('Notification preferences updated successfully!')
      setTimeout(() => setNotifSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to update notification preferences:', err)
      alert(err.response?.data?.error || 'Failed to update preferences.')
    } finally {
      setSavingNotifPrefs(false)
    }
  }

  const handleSaveProfileBudget = async (e) => {
    e.preventDefault()
    setErrorProfile('')
    setSuccessProfile('')

    const num = parseFloat(budgetValue)
    if (!budgetValue || isNaN(num) || !isFinite(num) || num <= 0) {
      setErrorProfile('Please enter a valid positive budget amount greater than ₹0.')
      return
    }

    try {
      setSavingProfile(true)
      const res = await updateBudget(num)
      const newBudget = res.budget ?? num
      updateUserBudget(newBudget)
      setBudgetValue(String(newBudget))
      setSuccessProfile('Monthly budget updated successfully!')
    } catch (err) {
      console.error('Failed to update profile budget:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setErrorProfile(
        err.response?.data?.error || 'Failed to update budget. Please try again.'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveCategoryBudget = async (payload) => {
    setCategoryModalError('')
    setSavingCategoryModal(true)

    try {
      if (editingCategoryBudget) {
        await updateCategoryBudget(editingCategoryBudget.id, payload)
      } else {
        await createCategoryBudget(payload)
      }

      await loadBudgets()
      setIsCategoryModalOpen(false)
      setEditingCategoryBudget(null)
    } catch (err) {
      console.error('Save category budget error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setCategoryModalError(
        err.response?.data?.error || 'Failed to save category budget.'
      )
    } finally {
      setSavingCategoryModal(false)
    }
  }

  const handleDeleteCategoryBudget = async (id) => {
    try {
      setDeletingBudgetId(id)
      await deleteCategoryBudget(id)
      setCategoryBudgets((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error('Delete category budget error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      alert(err.response?.data?.error || 'Failed to delete category budget.')
    } finally {
      setDeletingBudgetId(null)
    }
  }

  const handleSaveGoal = async (payload) => {
    setGoalModalError('')
    setSavingGoalModal(true)

    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, payload)
      } else {
        await createSavingsGoal(payload)
      }

      await loadGoals()
      setIsGoalModalOpen(false)
      setEditingGoal(null)
    } catch (err) {
      console.error('Save goal error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      setGoalModalError(
        err.response?.data?.error || 'Failed to save savings goal.'
      )
    } finally {
      setSavingGoalModal(false)
    }
  }

  const handleDeleteGoal = async (id) => {
    try {
      setDeletingGoalId(id)
      await deleteSavingsGoal(id)
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      console.error('Delete goal error:', err)
      if (err.response?.status === 401) {
        logout()
        return
      }
      alert(err.response?.data?.error || 'Failed to delete savings goal.')
    } finally {
      setDeletingGoalId(null)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'approaching':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">
          Manage overall budget targets, category limits, savings goals, and notification preferences
        </p>
      </div>

      {/* User Account Info Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.name || 'Authenticated User'}
            </h2>
            <p className="text-sm text-slate-500">{user?.email || user?.mobile || 'User Profile'}</p>
          </div>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          JWT Authenticated
        </span>
      </div>

      {/* SECTION 1: Overall Monthly Expense Budget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Overall Monthly Budget
            </h2>
            <p className="text-sm text-slate-500">
              Set your global spending limit for each calendar month
            </p>
          </div>
        </div>

        {errorProfile && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorProfile}</span>
            </div>
            <button
              onClick={loadProfile}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold text-xs rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {successProfile && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successProfile}</span>
          </div>
        )}

        {loadingProfile ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Loading overall budget settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfileBudget} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Monthly Expense Budget (₹)
              </label>

              <div className="relative max-w-lg">
                <IndianRupee className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 50000"
                  value={budgetValue}
                  onChange={(e) => {
                    setBudgetValue(e.target.value)
                    setErrorProfile('')
                    setSuccessProfile('')
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-[1.01] transition-all duration-300 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Budget...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Overall Budget
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* SECTION 2: Category Budgets Management */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <PieIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Category Spending Budgets
              </h2>
              <p className="text-sm text-slate-500">
                Set individual monthly limits for specific spending categories
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingCategoryBudget(null)
              setCategoryModalError('')
              setIsCategoryModalOpen(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-2xl transition shadow-md self-start sm:self-auto text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category Budget
          </button>
        </div>

        {errorBudgets ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorBudgets}</span>
            </div>
            <button
              onClick={loadBudgets}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold text-xs rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : loadingBudgets ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Fetching category budgets...</p>
          </div>
        ) : categoryBudgets.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
            <PieIcon className="mx-auto text-slate-300 w-12 h-12 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Category Budgets Configured Yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Add limits for Food, Transport, Shopping, or custom categories to monitor spending alerts.
            </p>
            <button
              onClick={() => {
                setEditingCategoryBudget(null)
                setCategoryModalError('')
                setIsCategoryModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              Set First Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgets.map((b) => (
              <div
                key={b.id}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">
                      {getCategoryIcon(b.category)}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{b.category}</h4>
                      <p className="text-xs text-slate-400">Monthly Limit: ₹{b.limit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(b.status)}`}>
                    {b.statusLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-slate-600 font-medium">
                    Spent: <strong className="text-slate-900">₹{b.spent.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className={`font-bold ${b.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {b.remaining >= 0
                      ? `₹${b.remaining.toLocaleString('en-IN')} left`
                      : `₹${Math.abs(b.remaining).toLocaleString('en-IN')} over`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.usagePercentage >= 100
                          ? 'bg-red-600'
                          : b.usagePercentage >= 90
                          ? 'bg-rose-500'
                          : b.usagePercentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${b.clampedPct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-medium">
                    {b.usagePercentage}% used
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      setEditingCategoryBudget(b)
                      setCategoryModalError('')
                      setIsCategoryModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition"
                    title="Edit Category Budget"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategoryBudget(b.id)}
                    disabled={deletingBudgetId === b.id}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                    title="Delete Category Budget"
                  >
                    {deletingBudgetId === b.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SECTION 3: Savings Goals Management */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Financial Savings Goals
              </h2>
              <p className="text-sm text-slate-500">
                Track target savings for major purchases, vacations, or emergency funds
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null)
              setGoalModalError('')
              setIsGoalModalOpen(true)
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-3 rounded-2xl transition shadow-md self-start sm:self-auto text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Savings Goal
          </button>
        </div>

        {errorGoals ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorGoals}</span>
            </div>
            <button
              onClick={loadGoals}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold text-xs rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : loadingGoals ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium">Fetching savings goals...</p>
          </div>
        ) : savingsGoals.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
            <Target className="mx-auto text-slate-300 w-12 h-12 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Savings Goals Configured Yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Create goals to buy a laptop, emergency fund, or vacation and track required monthly savings.
            </p>
            <button
              onClick={() => {
                setEditingGoal(null)
                setGoalModalError('')
                setIsGoalModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((g) => (
              <div
                key={g.id}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-lg">{g.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        g.isCompleted
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {g.isCompleted ? 'Goal Completed 🎉' : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Saved: <strong className="text-slate-900">₹{g.currentAmount.toLocaleString('en-IN')}</strong></span>
                    <span className="text-slate-500">Target: <strong className="text-slate-900">₹{g.targetAmount.toLocaleString('en-IN')}</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${g.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>{g.progressPercentage}% Completed</span>
                      <span>₹{g.remainingAmount.toLocaleString('en-IN')} remaining</span>
                    </div>
                  </div>

                  {/* Financial Projection Connection */}
                  {!g.isCompleted && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                      {g.requiredMonthlySavings !== null && (
                        <p className="font-semibold text-purple-700">
                          💡 Save approx ₹{g.requiredMonthlySavings.toLocaleString('en-IN')}/mo to hit target date ({new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}).
                        </p>
                      )}
                      {g.estimatedMonthsToGoal !== null && (
                        <p className="text-slate-500">
                          ⏳ At current average monthly savings, estimated completion in approx <strong>{g.estimatedMonthsToGoal} month(s)</strong>.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      setEditingGoal(g)
                      setGoalModalError('')
                      setIsGoalModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition"
                    title="Edit Goal"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    disabled={deletingGoalId === g.id}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                    title="Delete Goal"
                  >
                    {deletingGoalId === g.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SECTION 4: SMART NOTIFICATION PREFERENCES */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-600 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Smart Notification Preferences
              </h3>
              <p className="text-xs text-slate-400">
                Control in-app financial reminders and alert thresholds
              </p>
            </div>
          </div>

          {notifSuccess && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {notifSuccess}
            </span>
          )}
        </div>

        {errorNotifPrefs ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorNotifPrefs}</span>
            </div>
            <button
              onClick={loadNotifPrefs}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold text-xs rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : loadingNotifPrefs ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading notification settings...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recurring Reminders Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Recurring Reminders</h4>
                  <p className="text-xs text-slate-500">Alerts when recurring rent, salary, or EMIs become due</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifPrefs.recurringReminders)}
                  onChange={(e) =>
                    handleUpdateNotifPrefs({ recurringReminders: e.target.checked })
                  }
                  disabled={savingNotifPrefs}
                  className="w-5 h-5 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Budget Alerts Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Budget Alerts</h4>
                  <p className="text-xs text-slate-500">Alerts when category budget reaches 80% or 100% limit</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifPrefs.budgetAlerts)}
                  onChange={(e) =>
                    handleUpdateNotifPrefs({ budgetAlerts: e.target.checked })
                  }
                  disabled={savingNotifPrefs}
                  className="w-5 h-5 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Goal Reminders Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Savings Goal Reminders</h4>
                  <p className="text-xs text-slate-500">Monthly progress & target date countdown reminders</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifPrefs.goalReminders)}
                  onChange={(e) =>
                    handleUpdateNotifPrefs({ goalReminders: e.target.checked })
                  }
                  disabled={savingNotifPrefs}
                  className="w-5 h-5 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Forecast Warnings Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Forecast Warnings</h4>
                  <p className="text-xs text-slate-500">Alerts if next month projected balance drops into deficit</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifPrefs.forecastWarnings)}
                  onChange={(e) =>
                    handleUpdateNotifPrefs({ forecastWarnings: e.target.checked })
                  }
                  disabled={savingNotifPrefs}
                  className="w-5 h-5 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Reminder Days Selector */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Recurring Reminder Timing</h4>
                <p className="text-xs text-slate-500">How many days in advance to send recurring due reminders</p>
              </div>

              <select
                value={notifPrefs.reminderDaysBefore ?? 1}
                onChange={(e) =>
                  handleUpdateNotifPrefs({ reminderDaysBefore: Number(e.target.value) })
                }
                disabled={savingNotifPrefs}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={1}>1 day before due date</option>
                <option value={3}>3 days before due date</option>
                <option value={0}>On the due date only</option>
              </select>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AddCategoryBudgetModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setEditingCategoryBudget(null)
          setCategoryModalError('')
        }}
        onSave={handleSaveCategoryBudget}
        editingBudget={editingCategoryBudget}
        submitting={savingCategoryModal}
        errorMsg={categoryModalError}
      />

      <AddSavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false)
          setEditingGoal(null)
          setGoalModalError('')
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
        submitting={savingGoalModal}
        errorMsg={goalModalError}
      />
    </div>
  )
}

export default Settings
