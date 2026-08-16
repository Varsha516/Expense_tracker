const prisma = require('../config/db');

/**
 * Clean backend service for Financial Forecasting & Projections
 */
const calculateFinancialForecast = async (userId) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch user transactions and active recurring transactions
  const [transactions, recurringTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: Number(userId) },
      orderBy: { date: 'desc' }
    }),
    prisma.recurringTransaction.findMany({
      where: {
        userId: Number(userId),
        isPaused: false
      }
    })
  ]);

  // 2. Current Balance & Historical Aggregations
  let totalIncome = 0;
  let totalExpense = 0;
  let nonRecurringIncomeTotal = 0;
  let nonRecurringExpenseTotal = 0;

  const monthlyNonRecurringMap = new Map();

  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      totalIncome += amt;
      if (!t.recurringId) nonRecurringIncomeTotal += amt;
    } else if (t.type === 'expense') {
      totalExpense += amt;
      if (!t.recurringId) nonRecurringExpenseTotal += amt;
    }

    if (!t.recurringId && t.date) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyNonRecurringMap.has(monthKey)) {
          monthlyNonRecurringMap.set(monthKey, { income: 0, expense: 0 });
        }
        const entry = monthlyNonRecurringMap.get(monthKey);
        if (t.type === 'income') entry.income += amt;
        if (t.type === 'expense') entry.expense += amt;
      }
    }
  });

  const currentBalance = totalIncome - totalExpense;

  // Calculate non-recurring historical monthly average
  const monthCount = Math.max(1, monthlyNonRecurringMap.size);
  const avgMonthlyNonRecurringIncome = Math.round(nonRecurringIncomeTotal / monthCount);
  const avgMonthlyNonRecurringExpenses = Math.round(nonRecurringExpenseTotal / monthCount);

  // 3. Project Next 30 Days Recurring Incomes & Expenses & List Upcoming Commitments
  let recurringIncome30d = 0;
  let recurringExpense30d = 0;
  const upcomingCommitments = [];

  recurringTransactions.forEach((rec) => {
    let curr = new Date(rec.nextOccurrence);
    const endDate = rec.endDate ? new Date(rec.endDate) : null;

    while (curr <= thirtyDaysFromNow && (!endDate || curr <= endDate)) {
      if (curr >= now) {
        const amt = Number(rec.amount) || 0;
        const item = {
          id: rec.id,
          title: rec.title || `${rec.category || 'Recurring'} Payment`,
          category: rec.category || 'General',
          amount: amt,
          type: rec.type,
          expectedDate: new Date(curr),
          frequency: rec.frequency
        };

        upcomingCommitments.push(item);

        if (rec.type === 'income') {
          recurringIncome30d += amt;
        } else if (rec.type === 'expense') {
          recurringExpense30d += amt;
        }
      }

      // Increment date for upcoming projection loop
      const freq = (rec.frequency || 'monthly').toLowerCase();
      if (freq === 'weekly') {
        curr.setDate(curr.getDate() + 7);
      } else if (freq === 'yearly') {
        curr.setFullYear(curr.getFullYear() + 1);
      } else {
        const origDay = curr.getDate();
        curr.setMonth(curr.getMonth() + 1);
        if (curr.getDate() !== origDay) curr.setDate(0);
      }
    }
  });

  // Sort upcoming commitments chronologically
  upcomingCommitments.sort((a, b) => a.expectedDate - b.expectedDate);

  // 4. Forecast Calculations for Next Month
  const expectedIncome = recurringIncome30d + avgMonthlyNonRecurringIncome;
  const expectedExpenses = recurringExpense30d + avgMonthlyNonRecurringExpenses;
  const expectedSavings = expectedIncome - expectedExpenses;
  const forecastedBalance = currentBalance + expectedSavings;

  // 5. Generate Forecast Warnings & Alerts based on exact calculations
  const warnings = [];

  if (forecastedBalance < 0) {
    warnings.push({
      id: 'negative-balance',
      severity: 'critical',
      title: 'Projected Balance Deficit Alert',
      message: `Based on expected cash flows, your balance is projected to drop into negative territory (₹${forecastedBalance.toLocaleString('en-IN')}) next month.`
    });
  } else if (forecastedBalance < 5000 && currentBalance >= 5000) {
    warnings.push({
      id: 'low-balance',
      severity: 'warning',
      title: 'Low Reserve Warning',
      message: `Based on current spending patterns, your projected balance may fall below ₹5,000 next month (₹${forecastedBalance.toLocaleString('en-IN')}).`
    });
  }

  if (expectedExpenses > expectedIncome) {
    warnings.push({
      id: 'expense-exceeds-income',
      severity: 'warning',
      title: 'Monthly Cashflow Deficit',
      message: `Expected expenses (₹${expectedExpenses.toLocaleString('en-IN')}) exceed expected income (₹${expectedIncome.toLocaleString('en-IN')}) by ₹${Math.abs(expectedSavings).toLocaleString('en-IN')}.`
    });
  }

  if (expectedIncome > 0 && recurringExpense30d / expectedIncome > 0.6) {
    const pct = Math.round((recurringExpense30d / expectedIncome) * 100);
    warnings.push({
      id: 'high-recurring-ratio',
      severity: 'info',
      title: 'High Fixed Commitment Ratio',
      message: `Your upcoming recurring expenses account for ${pct}% of your expected monthly income (₹${recurringExpense30d.toLocaleString('en-IN')}).`
    });
  }

  if (upcomingCommitments.length > 0 && expectedIncome > 0) {
    const totalCommitmentsAmt = recurringExpense30d;
    if (totalCommitmentsAmt > 0.7 * expectedIncome) {
      warnings.push({
        id: 'commitments-heavy',
        severity: 'warning',
        title: 'Upcoming Commitments Impact',
        message: `Upcoming fixed commitments will absorb ${Math.round((totalCommitmentsAmt / expectedIncome) * 100)}% of your next month's anticipated income.`
      });
    }
  }

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses,
    expectedSavings,
    forecastedBalance,
    recurringIncomeTotal: recurringIncome30d,
    recurringExpenseTotal: recurringExpense30d,
    avgMonthlyNonRecurringIncome,
    avgMonthlyNonRecurringExpenses,
    upcomingCommitments,
    warnings
  };
};

module.exports = {
  calculateFinancialForecast
};
