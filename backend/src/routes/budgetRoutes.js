const express = require('express');
const router = express.Router();
const {
  getCategoryBudgets,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

// Router-wide JWT protection
router.use(authMiddleware);

router.get('/', getCategoryBudgets);
router.post('/', createCategoryBudget);
router.put('/:id', updateCategoryBudget);
router.delete('/:id', deleteCategoryBudget);

module.exports = router;
