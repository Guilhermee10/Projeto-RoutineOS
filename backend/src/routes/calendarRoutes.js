const express = require('express');
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/weekly', calendarController.weekly);

module.exports = router;
