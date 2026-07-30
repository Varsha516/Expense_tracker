// Transaction routes
// Define routes for transaction CRUD operations

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// Protected routes - all require authentication
router.use(authMiddleware);

// Create transaction
router.post('/', createTransaction);

// Get all transactions
router.get('/', getTransactions);

// Update transaction
router.put('/:id', updateTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
