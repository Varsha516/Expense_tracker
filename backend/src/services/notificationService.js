const prisma = require('../config/db');
const { calculateFinancialForecast } = require('./forecastingService');

/**
 * Gets or initializes user notification preferences
 */
const getUserNotificationPreferences = async (userId) => {
  let pref = await prisma.notificationPreference.findUnique({
    where: { userId: Number(userId) }
  });

  if (!pref) {
    pref = await prisma.notificationPreference.create({
      data: {
        userId: Number(userId),
        recurringReminders: true,
        budgetAlerts: true,
        goalReminders: true,
        forecastWarnings: true,
        reminderDaysBefore: 1
      }
    });
  }

  return pref;
};

/**
 * Updates user notification preferences
 */
const updateUserNotificationPreferences = async (userId, data) => {
  const {
    recurringReminders,
    budgetAlerts,
    goalReminders,
    forecastWarnings,
    reminderDaysBefore
  } = data;

  const pref = await prisma.notificationPreference.upsert({
    where: { userId: Number(userId) },
    update: {
      recurringReminders: recurringReminders !== undefined ? Boolean(recurringReminders) : undefined,
      budgetAlerts: budgetAlerts !== undefined ? Boolean(budgetAlerts) : undefined,
      goalReminders: goalReminders !== undefined ? Boolean(goalReminders) : undefined,
      forecastWarnings: forecastWarnings !== undefined ? Boolean(forecastWarnings) : undefined,
      reminderDaysBefore: reminderDaysBefore !== undefined ? Number(reminderDaysBefore) : undefined
    },
    create: {
      userId: Number(userId),
      recurringReminders: recurringReminders !== undefined ? Boolean(recurringReminders) : true,
      budgetAlerts: budgetAlerts !== undefined ? Boolean(budgetAlerts) : true,
      goalReminders: goalReminders !== undefined ? Boolean(goalReminders) : true,
      forecastWarnings: forecastWarnings !== undefined ? Boolean(forecastWarnings) : true,
      reminderDaysBefore: reminderDaysBefore !== undefined ? Number(reminderDaysBefore) : 1
    }
  });

  return pref;
};

/**
 * Idempotent Notification Generator
 * Evaluates real financial records and generates un-duplicated notifications
 */
const generateNotificationsForUser = async (userId) => {
  const pref = await getUserNotificationPreferences(userId);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  try {
    // 1. RECURRING TRANSACTION REMINDERS
    if (pref.recurringReminders) {
      const activeRecurring = await prisma.recurringTransaction.findMany({
        where: {
          userId: Number(userId),
          isPaused: false
        }
      });

      for (const rec of activeRecurring) {
        const nextOcc = new Date(rec.nextOccurrence);
        const diffMs = nextOcc.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const targetDays = [0, 1, 3]; // Due today, 1 day before, 3 days before
        if (targetDays.includes(diffDays)) {
          const dateStr = nextOcc.toISOString().split('T')[0];
          const dedupKey = `rec_${rec.id}_${dateStr}_${diffDays}d`;

          const existingNotif = await prisma.notification.findUnique({
            where: { dedupKey }
          });

          if (!existingNotif) {
            const timeLabel =
              diffDays === 0
                ? 'due today'
                : diffDays === 1
                ? 'due tomorrow'
                : `due in ${diffDays} days`;

            await prisma.notification.create({
              data: {
                userId: Number(userId),
                type: 'RECURRING_TRANSACTION',
                title: 'Recurring Transaction Due',
                message: `Your ₹${rec.amount.toLocaleString('en-IN')} ${rec.title || rec.category} payment is ${timeLabel}.`,
                dedupKey,
                entityId: rec.id,
                eventDate: nextOcc
              }
            });
          }
        }
      }
    }

    // 2. BUDGET ALERTS & WARNINGS
    if (pref.budgetAlerts) {
      const [categoryBudgets, currentMonthExpenses] = await Promise.all([
        prisma.categoryBudget.findMany({
          where: { userId: Number(userId) }
        }),
        prisma.transaction.findMany({
          where: {
            userId: Number(userId),
            type: 'expense'
          }
        })
      ]);

      // Calculate current month category spending
      const categorySpentMap = new Map();
      currentMonthExpenses.forEach((t) => {
        if (t.date) {
          const d = new Date(t.date);
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
            const cat = (t.category || '').trim().toLowerCase();
            categorySpentMap.set(cat, (categorySpentMap.get(cat) || 0) + Number(t.amount));
          }
        }
      });

      for (const b of categoryBudgets) {
        const catKey = b.category.trim().toLowerCase();
        const spent = categorySpentMap.get(catKey) || 0;
        const limit = Number(b.amount);
        const usagePct = (spent / limit) * 100;

        if (usagePct >= 100) {
          const overAmt = Math.abs(spent - limit);
          const dedupKey = `budget_${b.id}_${monthKey}_exceeded`;

          const existingNotif = await prisma.notification.findUnique({
            where: { dedupKey }
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: Number(userId),
                type: 'BUDGET_EXCEEDED',
                title: 'Budget Exceeded Alert',
                message: `You have exceeded your ${b.category} budget by ₹${overAmt.toLocaleString('en-IN')} (${usagePct.toFixed(0)}% used).`,
                dedupKey,
                entityId: b.id,
                eventDate: now
              }
            });
          }
        } else if (usagePct >= 80) {
          const dedupKey = `budget_${b.id}_${monthKey}_warning`;

          const existingNotif = await prisma.notification.findUnique({
            where: { dedupKey }
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: Number(userId),
                type: 'BUDGET_WARNING',
                title: 'Budget Approaching Limit',
                message: `Your ${b.category} budget is ${usagePct.toFixed(0)}% used (₹${spent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')}).`,
                dedupKey,
                entityId: b.id,
                eventDate: now
              }
            });
          }
        }
      }
    }

    // 3. SAVINGS GOALS REMINDERS
    if (pref.goalReminders) {
      const activeGoals = await prisma.savingsGoal.findMany({
        where: { userId: Number(userId) }
      });

      for (const g of activeGoals) {
        const target = Number(g.targetAmount);
        const current = Number(g.currentAmount);
        const remaining = Math.max(0, target - current);

        if (remaining > 0 && g.targetDate) {
          const targetD = new Date(g.targetDate);
          const diffMs = targetD.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays > 0 && diffDays <= 30) {
            const dedupKey = `goal_${g.id}_${monthKey}_reminder`;

            const existingNotif = await prisma.notification.findUnique({
              where: { dedupKey }
            });

            if (!existingNotif) {
              await prisma.notification.create({
                data: {
                  userId: Number(userId),
                  type: 'SAVINGS_GOAL',
                  title: 'Savings Goal Reminder',
                  message: `You need approximately ₹${remaining.toLocaleString('en-IN')} more this month to stay on track with your "${g.name}" goal.`,
                  dedupKey,
                  entityId: g.id,
                  eventDate: targetD
                }
              });
            }
          }
        }
      }
    }

    // 4. FORECAST WARNINGS
    if (pref.forecastWarnings) {
      const forecast = await calculateFinancialForecast(userId);
      if (forecast && forecast.warnings && forecast.warnings.length > 0) {
        for (const w of forecast.warnings) {
          const dedupKey = `forecast_${userId}_${monthKey}_${w.id}`;

          const existingNotif = await prisma.notification.findUnique({
            where: { dedupKey }
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: Number(userId),
                type: 'FORECAST_WARNING',
                title: w.title || 'Forecast Warning',
                message: w.message,
                dedupKey,
                eventDate: now
              }
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Error generating notifications:', error);
  }
};

module.exports = {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  generateNotificationsForUser
};
