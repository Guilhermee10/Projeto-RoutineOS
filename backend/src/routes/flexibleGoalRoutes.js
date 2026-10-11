const express = require('express');
const flexibleGoalController = require('../controllers/flexibleGoalController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', flexibleGoalController.list);
router.post('/', flexibleGoalController.create);
router.put('/:id', flexibleGoalController.update);
router.delete('/:id', flexibleGoalController.remove);

module.exports = router;
