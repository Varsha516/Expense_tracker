const prisma = require('../config/db');

/**
 * Calculates start and end dates for current and previous comparison periods
 */
const getPeriodDateRanges = (period, customStart, customEnd) => {
  const now = new Date();
  let currStart, currEnd;

  switch (period) {
    case 'last_month': {
      currStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      currEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'last_3_months': {
      currStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      currEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'last_6_months': {
      currStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      currEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_year': {
      currStart = new Date(now.getFullYear(), 0, 1);
      currEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      currStart = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      currEnd = customEnd ? new Date(customEnd) : new Date();
      currEnd.setHours(23, 59, 59, 999);
      break;
    }
    case 'this_month':
    default: {
      currStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
  }

  // Calculate equivalent previous period of same duration
  const durationMs = currEnd.getTime() - currStart.getTime();
  const prevEnd = new Date(currStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    currStart,
    currEnd,
    prevStart,
    prevEnd
  };
};

/**
 * Aggregates financial report metrics and period comparison
 */
const getFinancialReportData = async (userId, period = 'this_month', customStart, customEnd) => {
  const { currStart, currEnd, prevStart, prevEnd } = getPeriodDateRanges(period, customStart, customEnd);

  // Fetch current period, previous period, budgets, and savings goals
  const [currTx, prevTx, categoryBudgets, savingsGoals] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: Number(userId),
        date: { gte: currStart, lte: currEnd }
      },
      orderBy: { date: 'asc' }
    }),
    prisma.transaction.findMany({
      where: {
        userId: Number(userId),
        date: { gte: prevStart, lte: prevEnd }
      }
    }),
    prisma.categoryBudget.findMany({
      where: { userId: Number(userId) }
    }),
    prisma.savingsGoal.findMany({
      where: { userId: Number(userId) }
    })
  ]);

  // Current Period Metrics
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryExpensesMap = new Map();
  let largestExpense = null;

  currTx.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === 'income') {
      totalIncome += amt;
    } else if (t.type === 'expense') {
      totalExpense += amt;

      // Track Category Totals
      const cat = (t.category || 'General').trim();
      categoryExpensesMap.set(cat, (categoryExpensesMap.get(cat) || 0) + amt);

      // Track Largest Expense
      if (!largestExpense || amt > Number(largestExpense.amount)) {
        largestExpense = {
          id: t.id,
          title: t.title || t.category || 'Expense',
          category: t.category,
          amount: amt,
          date: t.date
        };
      }
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Previous Period Metrics (Comparison)
  let prevIncome = 0;
  let prevExpense = 0;
  const prevCategoryExpensesMap = new Map();

  prevTx.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === 'income') {
      prevIncome += amt;
    } else if (t.type === 'expense') {
      prevExpense += amt;
      const cat = (t.category || 'General').trim();
      prevCategoryExpensesMap.set(cat, (prevCategoryExpensesMap.get(cat) || 0) + amt);
    }
  });

  const prevNetSavings = prevIncome - prevExpense;
  const comparisonAvailable = prevTx.length > 0;

  const calculatePctChange = (curr, prev) => {
    if (!prev || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const periodComparison = {
    comparisonAvailable,
    prevPeriodLabel: `${prevStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${prevEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
    incomeChangePct: comparisonAvailable ? calculatePctChange(totalIncome, prevIncome) : null,
    expenseChangePct: comparisonAvailable ? calculatePctChange(totalExpense, prevExpense) : null,
    savingsChangePct: comparisonAvailable ? calculatePctChange(netSavings, prevNetSavings) : null,
    prevIncome,
    prevExpense,
    prevNetSavings
  };

  // Category Breakdown & Top Spending Categories
  const categoryBreakdown = [];
  categoryExpensesMap.forEach((spent, category) => {
    const prevSpent = prevCategoryExpensesMap.get(category) || 0;
    const percentageOfTotal = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
    const changePct = comparisonAvailable ? calculatePctChange(spent, prevSpent) : null;

    categoryBreakdown.push({
      category,
      spent,
      prevSpent,
      percentageOfTotal: Number(percentageOfTotal.toFixed(1)),
      changePct: changePct !== null ? Number(changePct.toFixed(1)) : null
    });
  });

  // Sort Top Spending Categories descending by spent
  categoryBreakdown.sort((a, b) => b.spent - a.spent);

  // Income vs Expense Trend (Monthly Breakdown)
  const monthlyTrendMap = new Map();
  currTx.forEach((t) => {
    const d = new Date(t.date);
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (!monthlyTrendMap.has(monthLabel)) {
      monthlyTrendMap.set(monthLabel, { month: monthLabel, income: 0, expense: 0 });
    }
    const item = monthlyTrendMap.get(monthLabel);
    if (t.type === 'income') item.income += Number(t.amount);
    else item.expense += Number(t.amount);
  });
  const trend = Array.from(monthlyTrendMap.values());

  // Budget Performance during the period
  const budgetPerformance = categoryBudgets.map((b) => {
    const spent = categoryExpensesMap.get(b.category.trim()) || 0;
    const limit = Number(b.amount);
    const usagePct = (spent / limit) * 100;
    return {
      id: b.id,
      category: b.category,
      limit,
      spent,
      remaining: Math.max(0, limit - spent),
      usagePct: Number(usagePct.toFixed(1)),
      isExceeded: spent > limit
    };
  });

  return {
    period,
    periodDates: {
      startDate: currStart,
      endDate: currEnd
    },
    summary: {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: Number(savingsRate.toFixed(1)),
      transactionCount: currTx.length
    },
    largestExpense,
    periodComparison,
    categoryBreakdown,
    topCategories: categoryBreakdown.slice(0, 5),
    trend,
    budgetPerformance,
    savingsGoals: savingsGoals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      progressPct: Number(((Number(g.currentAmount) / Number(g.targetAmount)) * 100).toFixed(1)),
      targetDate: g.targetDate
    }))
  };
};

module.exports = {
  getFinancialReportData
};
