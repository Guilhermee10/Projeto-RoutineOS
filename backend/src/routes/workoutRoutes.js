const express = require('express');
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', workoutController.stats);
router.get('/', workoutController.list);
router.post('/', workoutController.create);
router.put('/:id', workoutController.update);
router.delete('/:id', workoutController.remove);

module.exports = router;
