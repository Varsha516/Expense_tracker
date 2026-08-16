import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  X,
  IndianRupee,
  CalendarDays,
  FileText,
  Wallet,
  Repeat,
  Plus
} from 'lucide-react';

const categories = [
  'Rent',
  'Salary',
  'Bills',
  'Subscriptions',
  'EMI',
  'Insurance',
  'Groceries',
  'Food',
  'Shopping',
  'Travel',
  'Entertainment',
  'Freelance',
  'Investment',
  'Health',
  'Education',
  'Other'
];

const AddRecurringModal = ({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  submitting = false,
  errorMsg = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        amount: editingItem.amount !== undefined ? String(editingItem.amount) : '',
        type: editingItem.type || 'expense',
        category: editingItem.category || '',
        frequency: editingItem.frequency || 'monthly',
        startDate: editingItem.startDate
          ? new Date(editingItem.startDate).toISOString().split('T')[0]
          : '',
        endDate: editingItem.endDate
          ? new Date(editingItem.endDate).toISOString().split('T')[0]
          : '',
        description: editingItem.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: ''
      });
    }
  }, [editingItem, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.type || !formData.category) {
      alert('Please fill required fields (Amount, Type, Category)');
      return;
    }

    const payload = {
      title: formData.title || `${formData.category} Recurring`,
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      frequency: formData.frequency,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      nextOccurrence: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      description: formData.description || ''
    };

    if (onSave) {
      await onSave(payload);
    }
  };

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
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingItem ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Automate fixed rent, salary, EMIs, and monthly bills
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={submitting}
                className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-red-500/20 transition flex items-center justify-center disabled:opacity-50"
              >
                <X className="text-slate-300 w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-8 mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    Transaction Name (e.g. Rent, Netflix)
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Monthly Rent"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-white outline-none placeholder:text-slate-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    Amount *
                  </label>
                  <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3.5">
                    <IndianRupee className="text-emerald-400 w-4 h-4 mr-2 flex-shrink-0" />
                    <input
                      type="number"
                      name="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="bg-transparent outline-none text-white w-full text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Type & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`py-3 rounded-2xl text-xs font-bold transition ${
                        formData.type === 'income'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-white/[0.04] border border-white/[0.06] text-slate-300'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`py-3 rounded-2xl text-xs font-bold transition ${
                        formData.type === 'expense'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                          : 'bg-white/[0.04] border border-white/[0.06] text-slate-300'
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    Frequency *
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-white outline-none text-sm"
                  >
                    <option value="weekly" className="bg-slate-900">Weekly</option>
                    <option value="monthly" className="bg-slate-900">Monthly</option>
                    <option value="yearly" className="bg-slate-900">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                  Category *
                </label>
                <div className="relative">
                  <Wallet className="absolute top-3.5 left-4 text-slate-400 w-4 h-4" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    Start Date / First Due Date *
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-3.5 text-cyan-400 w-4 h-4 z-10" />
                    <DatePicker
                      selected={formData.startDate ? new Date(formData.startDate) : new Date()}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          startDate: date.toISOString().split('T')[0]
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none text-sm"
                      calendarClassName="!bg-slate-900 !border !border-slate-700 !rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                    End Date (Optional)
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-3.5 text-purple-400 w-4 h-4 z-10" />
                    <DatePicker
                      selected={formData.endDate ? new Date(formData.endDate) : null}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          endDate: date ? date.toISOString().split('T')[0] : ''
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      placeholderText="No end date (indefinite)"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none text-sm"
                      calendarClassName="!bg-slate-900 !border !border-slate-700 !rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-2 block uppercase tracking-wider">
                  Description (Optional)
                </label>
                <div className="flex items-start bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                  <FileText className="text-slate-400 w-4 h-4 mr-3 mt-1 flex-shrink-0" />
                  <textarea
                    rows="3"
                    name="description"
                    placeholder="Notes e.g. Apartment rent due 1st of every month..."
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-transparent outline-none text-white w-full text-sm resize-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] transition text-white font-bold text-sm shadow-xl shadow-blue-500/20 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Saving...' : editingItem ? 'Update Recurring Rule' : 'Save Recurring Rule'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddRecurringModal;
