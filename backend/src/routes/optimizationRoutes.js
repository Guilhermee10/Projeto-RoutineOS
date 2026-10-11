const express = require('express');
const optimizationController = require('../controllers/optimizationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/analyze', optimizationController.analyze);

module.exports = router;
