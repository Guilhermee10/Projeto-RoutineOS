const express = require('express');
const workScheduleController = require('../controllers/workScheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/hours', workScheduleController.hours);
router.get('/', workScheduleController.list);
router.post('/', workScheduleController.create);
router.put('/:id', workScheduleController.update);
router.delete('/:id', workScheduleController.remove);

module.exports = router;
