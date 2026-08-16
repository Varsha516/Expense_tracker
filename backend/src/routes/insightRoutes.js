const express = require('express');
const router = express.Router();
const { getAIInsights } = require('../controllers/insightController');
const authMiddleware = require('../middleware/authMiddleware');

// Router-wide JWT protection
router.use(authMiddleware);

router.get('/ai', getAIInsights);

module.exports = router;
