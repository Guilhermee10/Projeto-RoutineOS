const express = require('express');
const streakController = require('../controllers/streakController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', streakController.get);

module.exports = router;
