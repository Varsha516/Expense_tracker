import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import {
  X,
  IndianRupee,
  CalendarDays,
  FileText,
  Upload,
  Wallet,
  Plus
} from 'lucide-react'

const categories = [
  'Food',
  'Shopping',
  'Travel',
  'Entertainment',
  'Bills',
  'Salary',
  'Freelance',
  'Investment',
  'Health',
  'Education',
  'Other'
]

const formatDateInput = (value) => {

  const numbers = value.replace(/\D/g, '').slice(0, 8)

  if (numbers.length <= 2) return numbers

  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
  }

  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`
}

const AddTransactionModal = ({
  isOpen,
  onClose,
  onAddTransaction,
  editingTransaction,
  submitting = false,
  errorMsg = ''
}) => {

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
    note: '',
    image: null
  })

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount !== undefined ? String(editingTransaction.amount) : '',
        type: editingTransaction.type || 'expense',
        category: editingTransaction.category || '',
        date: editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split('T')[0]
          : '',
        note: editingTransaction.description || editingTransaction.note || '',
        image: editingTransaction.image || null
      })
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        image: null
      })
    }
  }, [editingTransaction, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'date') {
      setFormData({
        ...formData,
        date: value
      })
      return
    }

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        image: URL.createObjectURL(file)
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.type || !formData.category) {
      alert('Please fill required fields (Amount, Type, Category)')
      return
    }

    const payload = {
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.note || '',
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      image: formData.image || null
    }

    if (onAddTransaction) {
      await onAddTransaction(payload)
    }
  }

  return (

    <AnimatePresence>

      {isOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center px-4 py-6 overflow-y-auto"
        >

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-[#0f172a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden my-auto"
          >

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">

              <div>

                <h2 className="text-3xl font-bold text-white">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>

                <p className="text-slate-400 mt-1">
                  Track income and expenses beautifully
                </p>

              </div>

              <button
                onClick={onClose}
                disabled={submitting}
                className="w-12 h-12 rounded-2xl bg-white/[0.05] hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
              >

                <X className="text-slate-300 w-6 h-6" />

              </button>

            </div>

            {errorMsg && (
              <div className="mx-8 mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6 max-h-[80vh] overflow-y-auto"
            >

              {/* Amount */}
              <div>

                <label className="text-slate-300 mb-3 block">
                  Amount
                </label>

                <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4">

                  <IndianRupee className="text-emerald-400 w-5 h-5 mr-3" />

                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="bg-transparent outline-none text-white w-full placeholder:text-slate-500"
                  />

                </div>

              </div>

              {/* Type */}
              <div>

                <label className="text-slate-300 mb-3 block">
                  Transaction Type
                </label>

                <div className="grid grid-cols-2 gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: 'income'
                      })
                    }
                    className={`rounded-2xl py-4 font-semibold transition-all duration-300 ${
                      formData.type === 'income'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white/[0.04] border border-white/[0.06] text-slate-300'
                    }`}
                  >
                    Income
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: 'expense'
                      })
                    }
                    className={`rounded-2xl py-4 font-semibold transition-all duration-300 ${
                      formData.type === 'expense'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-white/[0.04] border border-white/[0.06] text-slate-300'
                    }`}
                  >
                    Expense
                  </button>

                </div>

              </div>

              {/* Category */}
              <div>

                <label className="text-slate-300 mb-3 block">
                  Category
                </label>

                <div className="relative">

                  <Wallet className="absolute top-4 left-4 text-slate-400 w-5 h-5" />

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-12 py-4 text-white outline-none"
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map((item, index) => (

                      <option
                        key={index}
                        value={item}
                        className="bg-slate-900"
                      >
                        {item}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              {/* Advanced Date */}
<div>

  <label className="text-slate-300 mb-3 block">
    Date
  </label>

  <div className="relative">

    <CalendarDays className="absolute left-4 top-4 text-cyan-400 w-5 h-5 z-10" />

    <DatePicker
      selected={
        formData.date
          ? new Date(formData.date)
          : new Date()
      }
      onChange={(date) =>
        setFormData({
          ...formData,
          date: date.toISOString().split('T')[0]
        })
      }
      dateFormat="dd/MM/yyyy"
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={80}
      minDate={new Date('1947-01-01')}
      maxDate={new Date()}
      placeholderText="Select transaction date"
      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-4 text-white outline-none"
      calendarClassName="!bg-slate-900 !border !border-slate-700 !rounded-2xl"
    />

  </div>

  <p className="text-slate-500 text-sm mt-2">
    Allowed range: upto Current Date only
  </p>

</div>

              {/* Description */}
              <div>

                <label className="text-slate-300 mb-3 block">
                  Description (Optional)
                </label>

                <div className="flex items-start bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4">

                  <FileText className="text-slate-400 w-5 h-5 mr-3 mt-1" />

                  <textarea
                    rows="4"
                    name="note"
                    placeholder="Add description if needed..."
                    value={formData.note}
                    onChange={handleChange}
                    className="bg-transparent outline-none text-white w-full resize-none placeholder:text-slate-500"
                  />

                </div>

              </div>

              {/* Upload Image OPTIONAL */}
              <div>

                <label className="text-slate-300 mb-3 block">
                  Upload Receipt (Optional)
                </label>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.08] rounded-3xl p-8 cursor-pointer hover:border-emerald-400/40 transition-all duration-300 bg-white/[0.03]">

                  <Upload className="w-10 h-10 text-emerald-400 mb-4" />

                  <p className="text-slate-300">
                    Click to upload receipt image
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </label>

                {formData.image && (

                  <img
                    src={formData.image}
                    alt="preview"
                    className="mt-5 rounded-2xl w-full h-52 object-cover border border-white/[0.08]"
                  />

                )}

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-[1.01] transition-all duration-300 text-white font-semibold shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <Plus className="w-5 h-5" />

                {submitting ? 'Saving...' : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}

              </button>

            </form>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  )
}

export default AddTransactionModal