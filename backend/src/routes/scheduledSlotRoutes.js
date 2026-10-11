const express = require('express');
const scheduledSlotController = require('../controllers/scheduledSlotController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', scheduledSlotController.list);
router.patch('/:id/confirm', scheduledSlotController.confirm);
router.delete('/:id', scheduledSlotController.reject);

module.exports = router;
