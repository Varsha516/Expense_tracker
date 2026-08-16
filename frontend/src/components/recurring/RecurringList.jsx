import { motion } from 'framer-motion';
import { Play, Pause, Pencil, Trash2, Calendar, Repeat, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { getCategoryIcon } from '../../utils/helpers';

const RecurringList = ({
  recurringList = [],
  loading = false,
  onEdit,
  onTogglePause,
  onDelete
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        Loading recurring rules...
      </div>
    );
  }

  if (recurringList.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-50 rounded-3xl border border-slate-200 p-8">
        <Repeat className="mx-auto text-slate-300 w-12 h-12 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No recurring transactions yet</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
          Add monthly rent, salary, EMIs, or subscriptions to generate automated transaction entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recurringList.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-3xl border transition flex flex-col md:flex-row md:items-center justify-between gap-5 ${
            item.isPaused
              ? 'bg-slate-50 border-slate-200 opacity-75'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                item.type === 'income'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {getCategoryIcon(item.category)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title || `${item.category} Recurring`}
                </h3>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    item.type === 'income'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.type}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                  {item.frequency}
                </span>

                {item.isPaused ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Paused
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span>
                  <strong>Category:</strong> {item.category || 'General'}
                </span>
                <span>•</span>
                <span>
                  <strong>Next Due:</strong> {formatDate(item.nextOccurrence)}
                </span>
                {item.endDate && (
                  <>
                    <span>•</span>
                    <span>
                      <strong>End Date:</strong> {formatDate(item.endDate)}
                    </span>
                  </>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 font-medium block">Amount</span>
              <span
                className={`text-xl font-extrabold ${
                  item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                ₹{Number(item.amount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTogglePause(item.id)}
                className={`p-2.5 rounded-xl border transition ${
                  item.isPaused
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
                title={item.isPaused ? 'Resume Recurring' : 'Pause Recurring'}
              >
                {item.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onEdit(item)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                title="Edit Recurring Rule"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                title="Delete Recurring Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecurringList;
