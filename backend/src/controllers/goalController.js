const prisma = require('../config/db');

/**
 * Get all Savings Goals for authenticated user with calculated financial projections
 */
const getSavingsGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [goals, transactions] = await Promise.all([
      prisma.savingsGoal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.findMany({
        where: { userId }
      })
    ]);

    // Derive Average Monthly Savings from historical cash flow
    const monthlyMap = new Map();
    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;

      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(sortKey)) {
        monthlyMap.set(sortKey, { income: 0, expense: 0 });
      }
      const entry = monthlyMap.get(sortKey);
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') entry.income += amt;
      if (t.type === 'expense') entry.expense += amt;
    });

    let totalMonthlySavingsSum = 0;
    const numMonths = Math.max(1, monthlyMap.size);

    monthlyMap.forEach((m) => {
      totalMonthlySavingsSum += Math.max(0, m.income - m.expense);
    });

    const avgMonthlySavings = Math.round(totalMonthlySavingsSum / numMonths);

    const enrichedGoals = goals.map((g) => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;
      const remaining = Math.max(0, target - current);
      const isCompleted = current >= target;
      const progressPercentage = Number(Math.min(100, (current / Math.max(1, target)) * 100).toFixed(1));

      // Estimated months to reach goal based on current avg monthly savings
      let estimatedMonthsToGoal = null;
      if (isCompleted) {
        estimatedMonthsToGoal = 0;
      } else if (avgMonthlySavings > 0) {
        estimatedMonthsToGoal = Math.ceil(remaining / avgMonthlySavings);
      }

      // Required monthly savings to hit targetDate
      let requiredMonthlySavings = null;
      let monthsLeft = null;

      if (g.targetDate && !isCompleted) {
        const tDate = new Date(g.targetDate);
        if (!isNaN(tDate.getTime())) {
          const yearDiff = tDate.getFullYear() - now.getFullYear();
          const monthDiff = tDate.getMonth() - now.getMonth();
          monthsLeft = Math.max(1, yearDiff * 12 + monthDiff);
          requiredMonthlySavings = Math.ceil(remaining / monthsLeft);
        }
      }

      return {
        id: g.id,
        name: g.name,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: remaining,
        progressPercentage,
        isCompleted,
        targetDate: g.targetDate,
        category: g.category,
        estimatedMonthsToGoal,
        requiredMonthlySavings,
        monthsLeft,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      };
    });

    return res.status(200).json({
      goals: enrichedGoals,
      avgMonthlySavings
    });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return res.status(500).json({
      error: 'Failed to fetch savings goals'
    });
  }
};

/**
 * Create Savings Goal for authenticated user
 */
const createSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, targetAmount, currentAmount, targetDate, category } = req.body;

    const cleanName = (name || '').trim();
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = currentAmount !== undefined && currentAmount !== null ? parseFloat(currentAmount) : 0;

    if (!cleanName) {
      return res.status(400).json({ error: 'Goal name is required' });
    }

    if (isNaN(parsedTarget) || !isFinite(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({ error: 'Target amount must be a positive number greater than 0' });
    }

    if (isNaN(parsedCurrent) || !isFinite(parsedCurrent) || parsedCurrent < 0) {
      return res.status(400).json({ error: 'Current saved amount cannot be negative' });
    }

    let validTargetDate = null;
    if (targetDate) {
      const d = new Date(targetDate);
      if (!isNaN(d.getTime())) {
        validTargetDate = d;
      }
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: cleanName,
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate: validTargetDate,
        category: (category || '').trim() || null
      }
    });

    return res.status(201).json({
      message: 'Savings goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return res.status(500).json({
      error: 'Failed to create savings goal'
    });
  }
};

/**
 * Update Savings Goal by ID
 */
const updateSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = parseInt(req.params.id, 10);
    const { name, targetAmount, currentAmount, targetDate, category } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found or access denied' });
    }

    const updatedData = {};

    if (name && name.trim()) {
      updatedData.name = name.trim();
    }

    if (targetAmount !== undefined) {
      const parsedTarget = parseFloat(targetAmount);
      if (isNaN(parsedTarget) || !isFinite(parsedTarget) || parsedTarget <= 0) {
        return res.status(400).json({ error: 'Target amount must be a positive number' });
      }
      updatedData.targetAmount = parsedTarget;
    }

    if (currentAmount !== undefined) {
      const parsedCurrent = parseFloat(currentAmount);
      if (isNaN(parsedCurrent) || !isFinite(parsedCurrent) || parsedCurrent < 0) {
        return res.status(400).json({ error: 'Current saved amount cannot be negative' });
      }
      updatedData.currentAmount = parsedCurrent;
    }

    if (targetDate !== undefined) {
      if (!targetDate) {
        updatedData.targetDate = null;
      } else {
        const d = new Date(targetDate);
        if (!isNaN(d.getTime())) {
          updatedData.targetDate = d;
        }
      }
    }

    if (category !== undefined) {
      updatedData.category = (category || '').trim() || null;
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: goalId },
      data: updatedData
    });

    return res.status(200).json({
      message: 'Savings goal updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return res.status(500).json({
      error: 'Failed to update savings goal'
    });
  }
};

/**
 * Delete Savings Goal by ID
 */
const deleteSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = parseInt(req.params.id, 10);

    const existing = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found or access denied' });
    }

    await prisma.savingsGoal.delete({
      where: { id: goalId }
    });

    return res.status(200).json({
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return res.status(500).json({
      error: 'Failed to delete savings goal'
    });
  }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
};
