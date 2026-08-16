const express = require('express');
const router = express.Router();
const {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

// Router-wide JWT protection
router.use(authMiddleware);

router.get('/', getSavingsGoals);
router.post('/', createSavingsGoal);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

module.exports = router;
