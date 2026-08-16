import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, IndianRupee, Loader2, Calendar, Target, AlertCircle } from 'lucide-react'

const AddSavingsGoalModal = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
  submitting,
  errorMsg
}) => {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [validationErr, setValidationErr] = useState('')

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name || '')
      setTargetAmount(editingGoal.targetAmount ? String(editingGoal.targetAmount) : '')
      setCurrentAmount(editingGoal.currentAmount !== undefined ? String(editingGoal.currentAmount) : '0')

      if (editingGoal.targetDate) {
        const d = new Date(editingGoal.targetDate)
        if (!isNaN(d.getTime())) {
          setTargetDate(d.toISOString().split('T')[0])
        } else {
          setTargetDate('')
        }
      } else {
        setTargetDate('')
      }
    } else {
      setName('')
      setTargetAmount('')
      setCurrentAmount('0')
      setTargetDate('')
    }
    setValidationErr('')
  }, [editingGoal, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationErr('')

    const cleanName = name.trim()
    const parsedTarget = parseFloat(targetAmount)
    const parsedCurrent = currentAmount !== '' ? parseFloat(currentAmount) : 0

    if (!cleanName) {
      setValidationErr('Please enter a name for your savings goal.')
      return
    }

    if (isNaN(parsedTarget) || !isFinite(parsedTarget) || parsedTarget <= 0) {
      setValidationErr('Please enter a valid target amount greater than ₹0.')
      return
    }

    if (isNaN(parsedCurrent) || !isFinite(parsedCurrent) || parsedCurrent < 0) {
      setValidationErr('Current saved amount cannot be negative.')
      return
    }

    onSave({
      name: cleanName,
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      targetDate: targetDate || null
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Track target savings for major purchases or emergency funds
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {(validationErr || errorMsg) && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{validationErr || errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Goal Name
              </label>
              <div className="relative">
                <Target className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. Buy a Laptop, Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-semibold outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Target Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 60000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Initial / Current Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Current Saved Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 25000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Target Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-medium outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-3 rounded-2xl text-slate-600 font-semibold text-sm hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Goal...
                  </>
                ) : editingGoal ? (
                  'Update Goal'
                ) : (
                  'Create Goal'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AddSavingsGoalModal
