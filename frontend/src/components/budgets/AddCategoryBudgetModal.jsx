import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, IndianRupee, Loader2, Tag, AlertCircle } from 'lucide-react'

const standardCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other'
]

const AddCategoryBudgetModal = ({
  isOpen,
  onClose,
  onSave,
  editingBudget,
  submitting,
  errorMsg
}) => {
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [validationErr, setValidationErr] = useState('')

  useEffect(() => {
    if (editingBudget) {
      const cat = editingBudget.category || ''
      if (standardCategories.includes(cat)) {
        setCategory(cat)
        setCustomCategory('')
      } else {
        setCategory('Other')
        setCustomCategory(cat)
      }
      setAmount(editingBudget.limit ? String(editingBudget.limit) : String(editingBudget.amount || ''))
    } else {
      setCategory('Food')
      setCustomCategory('')
      setAmount('')
    }
    setValidationErr('')
  }, [editingBudget, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationErr('')

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category
    const parsedAmount = parseFloat(amount)

    if (!finalCategory) {
      setValidationErr('Please select or specify a spending category.')
      return
    }

    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      setValidationErr('Please enter a valid monthly budget limit greater than ₹0.')
      return
    }

    onSave({
      category: finalCategory,
      amount: parsedAmount
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
                {editingBudget ? 'Edit Category Budget' : 'Set Category Budget'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Configure monthly spending limit for a specific category
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={Boolean(editingBudget)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 outline-none focus:border-emerald-500 transition disabled:opacity-70 cursor-pointer"
              >
                {standardCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Monthly Spending Limit (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold outline-none focus:border-emerald-500 transition"
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
                    Saving...
                  </>
                ) : editingBudget ? (
                  'Update Budget'
                ) : (
                  'Save Budget'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AddCategoryBudgetModal
