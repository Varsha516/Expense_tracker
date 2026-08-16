const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createRecurringTransaction,
  getRecurringTransactions,
  updateRecurringTransaction,
  togglePauseRecurringTransaction,
  deleteRecurringTransaction,
  getForecastAndUpcoming
} = require('../controllers/recurringController');

// All routes are protected by JWT authentication
router.use(authMiddleware);

// Get forecast & upcoming commitments
router.get('/forecast', getForecastAndUpcoming);

// CRUD for recurring transactions
router.post('/', createRecurringTransaction);
router.get('/', getRecurringTransactions);
router.put('/:id', updateRecurringTransaction);
router.patch('/:id/pause', togglePauseRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);

module.exports = router;
