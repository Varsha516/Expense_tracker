const prisma = require('../config/db');

/**
 * Derives financial calendar events from actual user data for a target month and year
 */
const getCalendarEvents = async (userId, targetYear, targetMonth) => {
  const now = new Date();
  const year = targetYear ? Number(targetYear) : now.getFullYear();
  const month = targetMonth !== undefined ? Number(targetMonth) - 1 : now.getMonth(); // 0-indexed month

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // 1. Fetch user data in parallel
  const [transactions, recurringTransactions, categoryBudgets, savingsGoals] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: Number(userId),
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    }),
    prisma.recurringTransaction.findMany({
      where: {
        userId: Number(userId),
        isPaused: false
      }
    }),
    prisma.categoryBudget.findMany({
      where: { userId: Number(userId) }
    }),
    prisma.savingsGoal.findMany({
      where: { userId: Number(userId) }
    })
  ]);

  const events = [];

  // 2. Map Actual Transactions
  transactions.forEach((t) => {
    events.push({
      id: `tx-${t.id}`,
      entityId: t.id,
      eventType: t.type === 'income' ? 'income' : 'expense',
      title: t.title || `${t.category || 'Transaction'}`,
      amount: Number(t.amount),
      category: t.category || 'General',
      date: t.date,
      isRecurring: Boolean(t.recurringId),
      description: t.description || t.note || ''
    });
  });

  // 3. Project Recurring Transactions for the Month
  recurringTransactions.forEach((rec) => {
    let curr = new Date(rec.nextOccurrence);
    const recEndDate = rec.endDate ? new Date(rec.endDate) : null;
    const freq = (rec.frequency || 'monthly').toLowerCase();

    // Move backward to start of month if needed to catch occurrences
    while (curr < startDate) {
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

    // Collect occurrences within target month
    while (curr <= endDate && (!recEndDate || curr <= recEndDate)) {
      if (curr >= startDate) {
        events.push({
          id: `rec-${rec.id}-${curr.toISOString().split('T')[0]}`,
          entityId: rec.id,
          eventType: 'recurring',
          transactionType: rec.type,
          title: rec.title || `${rec.category || 'Recurring'} (${rec.frequency})`,
          amount: Number(rec.amount),
          category: rec.category || 'General',
          date: new Date(curr),
          frequency: rec.frequency,
          description: rec.description || ''
        });
      }

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

  // 4. Savings Goals Target Dates & Milestones
  savingsGoals.forEach((g) => {
    if (g.targetDate) {
      const targetD = new Date(g.targetDate);
      if (targetD >= startDate && targetD <= endDate) {
        events.push({
          id: `goal-${g.id}`,
          entityId: g.id,
          eventType: 'savings_goal',
          title: `Goal Target: ${g.name}`,
          amount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount),
          category: g.category || 'Goal',
          date: targetD,
          description: `Target date to save ₹${Number(g.targetAmount).toLocaleString('en-IN')}`
        });
      }
    }
  });

  // 5. Category Budget Alert Milestones
  categoryBudgets.forEach((b) => {
    // Add budget milestone indicator at start of month
    events.push({
      id: `budget-${b.id}-${month + 1}`,
      entityId: b.id,
      eventType: 'budget',
      title: `Monthly Budget: ${b.category}`,
      amount: Number(b.amount),
      category: b.category,
      date: new Date(year, month, 1),
      description: `Budget limit ₹${Number(b.amount).toLocaleString('en-IN')}`
    });
  });

  // Sort events chronologically
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build Chronological Upcoming Events List from today onwards
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date(now.setHours(0, 0, 0, 0)));

  return {
    year,
    month: month + 1,
    events,
    upcomingEvents
  };
};

module.exports = {
  getCalendarEvents
};
