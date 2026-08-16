const express = require('express');
const router = express.Router();
const { updateBudget, getProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Router-wide JWT protection
router.use(authMiddleware);

router.get('/budget', getProfile);
router.put('/budget', updateBudget);

module.exports = router;
