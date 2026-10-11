const express = require('express');
const studyController = require('../controllers/studyController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', studyController.stats);
router.get('/', studyController.list);
router.post('/', studyController.create);
router.put('/:id', studyController.update);
router.delete('/:id', studyController.remove);

module.exports = router;
