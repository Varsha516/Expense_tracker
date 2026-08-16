const prisma = require('../config/db');

// Threshold Constants
const THRESHOLDS = {
  HEALTHY: 75,
  APPROACHING: 90,
  EXCEEDED: 100
};

/**
 * Get all Category Budgets for authenticated user with server-calculated spending
 */
const getCategoryBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Fetch budgets and transactions in parallel
    const [budgets, transactions] = await Promise.all([
      prisma.categoryBudget.findMany({
        where: { userId },
        orderBy: { category: 'asc' }
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense'
        }
      })
    ]);

    // Aggregate spending for current month per category
    const categorySpendingMap = new Map();

    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;

      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const catKey = (t.category || 'Other').trim().toLowerCase();
        const amt = Number(t.amount) || 0;
        categorySpendingMap.set(catKey, (categorySpendingMap.get(catKey) || 0) + amt);
      }
    });

    let healthyCount = 0;
    let approachingCount = 0;
    let warningCount = 0;
    let exceededCount = 0;

    const enrichedBudgets = budgets.map((b) => {
      const catKey = b.category.trim().toLowerCase();
      const spent = categorySpendingMap.get(catKey) || 0;
      const limit = Number(b.amount);
      const remaining = limit - spent;
      const usagePercentage = Number(((spent / limit) * 100).toFixed(1));
      const clampedPct = Math.min(Math.max(usagePercentage, 0), 100);

      let status = 'healthy';
      let statusLabel = 'Healthy';

      if (usagePercentage >= THRESHOLDS.EXCEEDED) {
        status = 'exceeded';
        statusLabel = 'Over Budget';
        exceededCount++;
      } else if (usagePercentage >= THRESHOLDS.APPROACHING) {
        status = 'warning';
        statusLabel = 'Near Budget Limit';
        warningCount++;
      } else if (usagePercentage >= THRESHOLDS.HEALTHY) {
        status = 'approaching';
        statusLabel = 'Approaching Limit';
        approachingCount++;
      } else {
        healthyCount++;
      }

      return {
        id: b.id,
        category: b.category,
        limit,
        spent,
        remaining,
        usagePercentage,
        clampedPct,
        status,
        statusLabel,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      };
    });

    const summary = {
      totalBudgetsCount: budgets.length,
      healthyCount,
      approachingCount,
      warningCount,
      exceededCount
    };

    return res.status(200).json({
      budgets: enrichedBudgets,
      summary
    });
  } catch (error) {
    console.error('Error fetching category budgets:', error);
    return res.status(500).json({
      error: 'Failed to fetch category budgets'
    });
  }
};

/**
 * Create or Upsert Category Budget for authenticated user
 */
const createCategoryBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount } = req.body;

    const cleanCategory = (category || '').trim();
    const parsedAmount = parseFloat(amount);

    if (!cleanCategory) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Budget limit must be a positive number greater than 0' });
    }

    const budget = await prisma.categoryBudget.upsert({
      where: {
        userId_category: {
          userId,
          category: cleanCategory
        }
      },
      update: {
        amount: parsedAmount
      },
      create: {
        userId,
        category: cleanCategory,
        amount: parsedAmount
      }
    });

    return res.status(201).json({
      message: 'Category budget saved successfully',
      budget
    });
  } catch (error) {
    console.error('Error creating category budget:', error);
    return res.status(500).json({
      error: 'Failed to create category budget'
    });
  }
};

/**
 * Update Category Budget by ID
 */
const updateCategoryBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = parseInt(req.params.id, 10);
    const { amount, category } = req.body;

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Budget limit must be a positive number greater than 0' });
    }

    // Verify ownership
    const existing = await prisma.categoryBudget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category budget not found or access denied' });
    }

    const updatedData = { amount: parsedAmount };
    if (category && category.trim()) {
      updatedData.category = category.trim();
    }

    const updatedBudget = await prisma.categoryBudget.update({
      where: { id: budgetId },
      data: updatedData
    });

    return res.status(200).json({
      message: 'Category budget updated successfully',
      budget: updatedBudget
    });
  } catch (error) {
    console.error('Error updating category budget:', error);
    return res.status(500).json({
      error: 'Failed to update category budget'
    });
  }
};

/**
 * Delete Category Budget by ID
 */
const deleteCategoryBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = parseInt(req.params.id, 10);

    const existing = await prisma.categoryBudget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category budget not found or access denied' });
    }

    await prisma.categoryBudget.delete({
      where: { id: budgetId }
    });

    return res.status(200).json({
      message: 'Category budget deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category budget:', error);
    return res.status(500).json({
      error: 'Failed to delete category budget'
    });
  }
};

module.exports = {
  getCategoryBudgets,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget
};
