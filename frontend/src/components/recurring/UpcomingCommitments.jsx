import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from 'lucide-react';
import { getCategoryIcon } from '../../utils/helpers';

const UpcomingCommitments = ({ commitments = [], loading = false }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Upcoming Financial Commitments</h3>
            <p className="text-xs text-slate-400">Expected income & bill payments for the next 30 days</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {commitments.length} Upcoming
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Loading upcoming commitments...
        </div>
      ) : commitments.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          No upcoming recurring commitments in the next 30 days.
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {commitments.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    item.type === 'income'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {getCategoryIcon(item.category)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                        item.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="capitalize">{item.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`text-base font-extrabold ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </p>

                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700">{formatDate(item.expectedDate)}</span>
                  <span className="text-[11px] text-indigo-600 font-medium ml-1">({getDaysRemaining(item.expectedDate)})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingCommitments;
