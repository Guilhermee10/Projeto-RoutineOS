const express = require('express');
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', goalController.list);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);
router.patch('/:id/progress', goalController.registerProgress);
router.patch('/:id/checkin', goalController.checkin);
router.patch('/:id/reset', goalController.resetProgress);

module.exports = router;
