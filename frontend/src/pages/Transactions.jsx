import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Pencil,
  Trash2,
  IndianRupee,
  Loader2,
  X,
  RotateCcw,
  AlertCircle,
  Tag,
  Repeat,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../api/transactionApi';
import {
  fetchRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  togglePauseRecurring,
  deleteRecurringTransaction
} from '../api/recurringApi';
import { exportTransactionsCSV } from '../api/reportApi';

import AddTransactionModal from '../components/transactions/AddTransactionModal';
import AddRecurringModal from '../components/recurring/AddRecurringModal';
import RecurringList from '../components/recurring/RecurringList';
import { getCategoryIcon, getCategoryColor } from '../utils/helpers';

const standardCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Salary',
  'Freelance',
  'Investment',
  'Health',
  'Education',
  'Other'
];

const Transactions = () => {
  const { logout } = useAuth();

  // Active Main Tab State ('all' | 'recurring')
  const [activeTab, setActiveTab] = useState('all');

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination & Filtered Summary State
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filteredSummary, setFilteredSummary] = useState({ count: 0, income: 0, expense: 0, net: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  // Recurring State
  const [recurringList, setRecurringList] = useState([]);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [recurringSubmitting, setRecurringSubmitting] = useState(false);
  const [recurringError, setRecurringError] = useState('');

  // Advanced Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [recurringStatus, setRecurringStatus] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Modal & Edit State (Standard Transaction)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Deletion State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load Transactions with Query Params
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const filterParams = {
        search: searchQuery,
        type: typeFilter,
        category: categoryFilter,
        dateRange: dateFilter,
        startDate: dateFilter === 'custom' ? startDate : undefined,
        endDate: dateFilter === 'custom' ? endDate : undefined,
        minAmount: minAmount !== '' ? minAmount : undefined,
        maxAmount: maxAmount !== '' ? maxAmount : undefined,
        recurringStatus,
        sortBy: sortOption,
        page: currentPage,
        limit: 20
      };

      const [txRes, recRes] = await Promise.all([
        fetchTransactions(filterParams).catch(() => ({ transactions: [], pagination: {}, filteredSummary: {} })),
        fetchRecurringTransactions().catch(() => [])
      ]);

      if (txRes && txRes.transactions) {
        setTransactions(txRes.transactions);
        setPagination(txRes.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
        setFilteredSummary(txRes.filteredSummary || { count: 0, income: 0, expense: 0, net: 0 });
      } else if (Array.isArray(txRes)) {
        setTransactions(txRes);
      }

      setRecurringList(Array.isArray(recRes) ? recRes : []);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setErrorMsg(err.response?.data?.error || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    searchQuery,
    typeFilter,
    categoryFilter,
    dateFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    recurringStatus,
    sortOption,
    currentPage,
    logout
  ]);

  // Overall Summary Metrics (from current loaded page transactions)
  const overallStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') income += amt;
      else if (item.type === 'expense') expense += amt;
    });

    return {
      totalCount: pagination.total || transactions.length,
      totalIncome: filteredSummary.income || income,
      totalExpense: filteredSummary.expense || expense,
      netBalance: filteredSummary.net || (income - expense)
    };
  }, [transactions, pagination, filteredSummary]);

  // Unique Categories Options
  const categoriesList = useMemo(() => {
    const customCats = new Set(standardCategories);
    transactions.forEach((t) => {
      if (t.category) customCats.add(t.category);
    });
    return Array.from(customCats);
  }, [transactions]);

  // Clear Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setRecurringStatus('all');
    setSortOption('newest');
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    dateFilter !== 'all' ||
    minAmount !== '' ||
    maxAmount !== '' ||
    recurringStatus !== 'all' ||
    sortOption !== 'newest';

  // Handle Export CSV
  const handleExportCSV = async () => {
    try {
      await exportTransactionsCSV({
        search: searchQuery,
        type: typeFilter,
        category: categoryFilter,
        dateRange: dateFilter,
        startDate: dateFilter === 'custom' ? startDate : undefined,
        endDate: dateFilter === 'custom' ? endDate : undefined,
        minAmount: minAmount !== '' ? minAmount : undefined,
        maxAmount: maxAmount !== '' ? maxAmount : undefined,
        recurringStatus
      });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('CSV export failed.');
    }
  };

  // Standard Transaction Save (Create / Update)
  const handleSaveTransaction = async (payload) => {
    setModalError('');
    setModalSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setModalError(err.response?.data?.error || 'Failed to save transaction.');
    } fontFinally: {
      setModalSubmitting(false);
    }
  };

  // Handle Delete Standard Transaction
  const handleConfirmDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteTransaction(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      alert(err.response?.data?.error || 'Failed to delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Recurring Operations
  const handleSaveRecurring = async (payload) => {
    setRecurringError('');
    setRecurringSubmitting(true);
    try {
      if (editingRecurring) {
        await updateRecurringTransaction(editingRecurring.id, payload);
      } else {
        await createRecurringTransaction(payload);
      }
      setIsRecurringModalOpen(false);
      setEditingRecurring(null);
      loadData();
    } catch (err) {
      console.error('Save recurring error:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setRecurringError(err.response?.data?.error || 'Failed to save recurring rule.');
    } finally {
      setRecurringSubmitting(false);
    }
  };

  const handleTogglePauseRecurring = async (id) => {
    try {
      await togglePauseRecurring(id);
      loadData();
    } catch (err) {
      console.error('Error toggling pause:', err);
      alert(err.response?.data?.error || 'Failed to toggle pause.');
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Delete this recurring transaction rule? Past generated transactions will remain safe.')) return;
    try {
      await deleteRecurringTransaction(id);
      loadData();
    } catch (err) {
      console.error('Error deleting recurring rule:', err);
      alert(err.response?.data?.error || 'Failed to delete recurring rule.');
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Transactions & Recurring Rules</h1>
          <p className="text-slate-500 mt-2">
            Search, filter, manage, and export your one-time and recurring financial transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-800 text-sm px-5 py-4 rounded-2xl shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          {activeTab === 'all' ? (
            <button
              onClick={() => {
                setEditingTransaction(null);
                setModalError('');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-[1.02] transition-all duration-300 text-white font-semibold px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingRecurring(null);
                setRecurringError('');
                setIsRecurringModalOpen(true);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transition-all duration-300 text-white font-semibold px-6 py-4 rounded-2xl shadow-xl shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              Create Recurring Rule
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-2xl transition border-b-2 ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Transactions
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {pagination.total || transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-2xl transition border-b-2 ${
            activeTab === 'recurring'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          Recurring Rules
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {recurringList.length}
          </span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'recurring' ? (
        /* RECURRING TRANSACTIONS TAB */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Recurring Financial Rules</h3>
              <p className="text-sm text-slate-300 mt-1">
                Automated recurring incomes and expenses. Rules generate transactions on due dates.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRecurring(null);
                setRecurringError('');
                setIsRecurringModalOpen(true);
              }}
              className="px-5 py-3 bg-white text-slate-900 font-bold text-sm rounded-2xl shadow hover:bg-slate-100 transition flex-shrink-0"
            >
              + New Rule
            </button>
          </div>

          <RecurringList
            recurringList={recurringList}
            loading={loading}
            onEdit={(item) => {
              setEditingRecurring(item);
              setRecurringError('');
              setIsRecurringModalOpen(true);
            }}
            onTogglePause={handleTogglePauseRecurring}
            onDelete={handleDeleteRecurring}
          />
        </div>
      ) : (
        /* ALL TRANSACTIONS TAB */
        <>
          {/* Filtered Results Financial Summary Box */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  {isFilterActive ? 'Filtered Transaction Summary' : 'Overall Financial Summary'}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  {filteredSummary.count || pagination.total} Transactions Found
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <span className="text-xs text-slate-300 font-semibold block">Total Income</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{(filteredSummary.income || overallStats.totalIncome).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <span className="text-xs text-slate-300 font-semibold block">Total Expenses</span>
                <span className="text-xl font-black text-red-400">
                  ₹{(filteredSummary.expense || overallStats.totalExpense).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <span className="text-xs text-slate-300 font-semibold block">Net Total</span>
                <span
                  className={`text-xl font-black ${
                    (filteredSummary.net || overallStats.netBalance) >= 0
                      ? 'text-cyan-400'
                      : 'text-rose-400'
                  }`}
                >
                  ₹{(filteredSummary.net || overallStats.netBalance).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Search & Filtering Controls */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search description, category, amount..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start lg:self-auto">
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    typeFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('income');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    typeFilter === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('expense');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    typeFilter === 'expense'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Recurring Status */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Recurring Status
                </label>
                <select
                  value={recurringStatus}
                  onChange={(e) => {
                    setRecurringStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="all">All Transactions</option>
                  <option value="recurring">Recurring Only</option>
                  <option value="one_time">One-time Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>

              {/* Amount Range Min & Max */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Amount Range (₹)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => {
                      setMinAmount(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  />
                  <span className="text-xs text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => {
                      setMaxAmount(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Pickers */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Active Filter Summary Pills */}
            {isFilterActive && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase">Active Filters:</span>
                  {typeFilter !== 'all' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                      {typeFilter}
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                      {categoryFilter}
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 capitalize">
                      {dateFilter.replace('_', ' ')}
                    </span>
                  )}
                  {(minAmount !== '' || maxAmount !== '') && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">
                      ₹{minAmount || '0'} – ₹{maxAmount || '∞'}
                    </span>
                  )}
                  {recurringStatus !== 'all' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-100 text-cyan-800 capitalize">
                      {recurringStatus}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Transactions List / Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-sm font-medium">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-700">No transactions match your current filters</h3>
                <p className="text-xs text-slate-500">Try adjusting your search term, category, or date range.</p>
                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl">
                        {getCategoryIcon(item.category)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">
                            {item.title || item.category || 'Transaction'}
                          </h4>
                          {item.recurringId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                              Recurring
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{item.category || 'General'}</span>
                          <span>•</span>
                          <span>{formatDateDisplay(item.date)}</span>
                          {item.description && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500 truncate max-w-xs">{item.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`text-lg font-black ${
                          item.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTransaction(item);
                            setModalError('');
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Server-side Pagination Bar */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total transactions)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Delete Transaction?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this transaction record? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirmId)}
                  disabled={deletingId === deleteConfirmId}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === deleteConfirmId ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Add / Edit Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          setModalError('');
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        submitting={modalSubmitting}
        errorMsg={modalError}
      />

      {/* Recurring Rule Add / Edit Modal */}
      <AddRecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurring(null);
          setRecurringError('');
        }}
        onSave={handleSaveRecurring}
        editingRecurring={editingRecurring}
        submitting={recurringSubmitting}
        errorMsg={recurringError}
      />
    </div>
  );
};

export default Transactions;
