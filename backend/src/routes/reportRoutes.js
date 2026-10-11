const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/weekly', reportController.weekly);
router.post('/weekly/ai-summary', reportController.weeklyAiSummary);

module.exports = router;
