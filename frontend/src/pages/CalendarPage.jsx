import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Repeat,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCalendarEvents } from '../api/calendarApi';
import { getCategoryIcon } from '../utils/helpers';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'list'
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  const [calendarData, setCalendarData] = useState({ events: [], upcomingEvents: [] });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load calendar events for current month
  const loadEvents = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await fetchCalendarEvents(currentYear, currentMonth + 1);
      setCalendarData(data || { events: [], upcomingEvents: [] });
    } catch (err) {
      console.error('Failed to load calendar events:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setErrorMsg(err.response?.data?.error || 'Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentYear, currentMonth, logout]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    if (eventTypeFilter === 'all') return calendarData.events || [];
    return (calendarData.events || []).filter((e) => {
      if (eventTypeFilter === 'income') return e.eventType === 'income' || (e.eventType === 'recurring' && e.transactionType === 'income');
      if (eventTypeFilter === 'expense') return e.eventType === 'expense' || (e.eventType === 'recurring' && e.transactionType === 'expense');
      if (eventTypeFilter === 'recurring') return e.eventType === 'recurring';
      if (eventTypeFilter === 'budget') return e.eventType === 'budget';
      if (eventTypeFilter === 'savings_goal') return e.eventType === 'savings_goal';
      return true;
    });
  }, [calendarData.events, eventTypeFilter]);

  // Generate grid cells for monthly calendar
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Prev month padding cells
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`,
        events: []
      });
    }

    // Current month cells
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = dateObj.toISOString().split('T')[0];

      // Match events for this date
      const dayEvts = filteredEvents.filter((e) => {
        if (!e.date) return false;
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return eDateStr === dateStr;
      });

      cells.push({
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        dateStr,
        events: dayEvts
      });
    }

    // Next month padding cells
    const totalCells = cells.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      cells.push({
        day,
        isCurrentMonth: false,
        dateStr: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        events: []
      });
    }

    return cells;
  }, [currentYear, currentMonth, filteredEvents]);

  // Group upcoming events by date section
  const upcomingGrouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const groups = {
      today: [],
      tomorrow: [],
      nextWeek: [],
      later: []
    };

    (calendarData.upcomingEvents || []).forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        groups.today.push(e);
      } else if (d.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(e);
      } else if (d > tomorrow && d <= nextWeek) {
        groups.nextWeek.push(e);
      } else if (d > nextWeek) {
        groups.later.push(e);
      }
    });

    return groups;
  }, [calendarData.upcomingEvents]);

  const getEventBadge = (evt) => {
    if (evt.eventType === 'income' || (evt.eventType === 'recurring' && evt.transactionType === 'income')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (evt.eventType === 'expense' || (evt.eventType === 'recurring' && evt.transactionType === 'expense')) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (evt.eventType === 'recurring') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (evt.eventType === 'savings_goal') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (evt.eventType === 'budget') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Financial Calendar</h1>
          </div>
          <p className="text-slate-500 mt-2">
            Track all transactions, recurring due dates, budget milestones, and savings goals in one unified view
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Calendar
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming Events List
            </button>
          </div>

          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-extrabold text-slate-900 min-w-[200px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition border border-indigo-100 ml-2"
          >
            Today
          </button>
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filter:
          </span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="income">Income Payments</option>
            <option value="expense">Expenses</option>
            <option value="recurring">Recurring Commitments</option>
            <option value="budget">Budget Milestones</option>
            <option value="savings_goal">Savings Goal Targets</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Deriving financial events from database...</p>
        </div>
      ) : viewMode === 'monthly' ? (
        /* MONTHLY GRID VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center border-b border-slate-100 pb-3">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarGrid.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (cell.events.length > 0) {
                    setSelectedDayEvents(cell.events);
                    setSelectedDayDate(cell.dateStr);
                  }
                }}
                className={`min-h-[110px] p-2.5 rounded-2xl border transition flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 border-slate-100 text-slate-300 pointer-events-none'
                    : cell.isToday
                    ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-400/30'
                    : cell.events.length > 0
                    ? 'bg-white border-slate-200 hover:border-indigo-400 cursor-pointer shadow-xs'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      cell.isToday
                        ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {cell.events.length > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {cell.events.length}
                    </span>
                  )}
                </div>

                {/* Day Events Indicator Badges */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cell.events.slice(0, 2).map((evt, eIdx) => (
                    <div
                      key={eIdx}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold truncate border ${getEventBadge(
                        evt
                      )}`}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {cell.events.length > 2 && (
                    <span className="text-[9px] font-semibold text-slate-400 block px-1">
                      +{cell.events.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CHRONOLOGICAL UPCOMING EVENTS LIST VIEW */
        <div className="space-y-6">
          {/* Today */}
          {upcomingGrouped.today.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white uppercase tracking-wider">
                  Today
                </span>
                <h3 className="text-lg font-bold text-slate-900">Events Due Today</h3>
              </div>

              <div className="space-y-3">
                {upcomingGrouped.today.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                        {getCategoryIcon(evt.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <p className="text-xs text-slate-500">{evt.category} • {formatDateDisplay(evt.date)}</p>
                      </div>
                    </div>

                    {evt.amount && (
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(evt.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow */}
          {upcomingGrouped.tomorrow.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider">
                  Tomorrow
                </span>
                <h3 className="text-lg font-bold text-slate-900">Events Due Tomorrow</h3>
              </div>

              <div className="space-y-3">
                {upcomingGrouped.tomorrow.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
                        {getCategoryIcon(evt.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <p className="text-xs text-slate-500">{evt.category} • {formatDateDisplay(evt.date)}</p>
                      </div>
                    </div>

                    {evt.amount && (
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(evt.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next 7 Days */}
          {upcomingGrouped.nextWeek.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
                  Next 7 Days
                </span>
                <h3 className="text-lg font-bold text-slate-900">Upcoming This Week</h3>
              </div>

              <div className="space-y-3">
                {upcomingGrouped.nextWeek.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                        {getCategoryIcon(evt.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <p className="text-xs text-slate-500">{evt.category} • {formatDateDisplay(evt.date)}</p>
                      </div>
                    </div>

                    {evt.amount && (
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(evt.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Later This Month */}
          {upcomingGrouped.later.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                  Later This Month
                </span>
                <h3 className="text-lg font-bold text-slate-900">Future Financial Events</h3>
              </div>

              <div className="space-y-3">
                {upcomingGrouped.later.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-lg">
                        {getCategoryIcon(evt.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <p className="text-xs text-slate-500">{evt.category} • {formatDateDisplay(evt.date)}</p>
                      </div>
                    </div>

                    {evt.amount && (
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(evt.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {calendarData.upcomingEvents?.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
              <CalendarIcon className="mx-auto text-slate-300 w-14 h-14 mb-3" />
              <h3 className="text-xl font-bold text-slate-800">No upcoming events found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                Add transactions or create recurring income/expenses to populate your financial calendar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Day Events Modal */}
      <AnimatePresence>
        {selectedDayEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold">
                  Events on {formatDateDisplay(selectedDayDate)}
                </h3>
                <button
                  onClick={() => setSelectedDayEvents(null)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedDayEvents.map((evt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                      {evt.amount && (
                        <span className="font-extrabold text-emerald-400">
                          ₹{Number(evt.amount).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="capitalize">{evt.eventType}</span>
                      <span>•</span>
                      <span>{evt.category}</span>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-300 mt-1">{evt.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedDayEvents(null)}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-bold text-xs transition text-center"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
