const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getEvents } = require('../controllers/calendarController');

router.use(authMiddleware);

router.get('/', getEvents);

module.exports = router;
