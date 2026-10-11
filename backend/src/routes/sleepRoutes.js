const express = require('express');
const sleepController = require('../controllers/sleepController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// IMPORTANTE: /stats precisa vir ANTES de /:id nas rotas do Express,
// senão "stats" seria interpretado como um valor de :id.
router.get('/stats', sleepController.stats);
router.get('/', sleepController.list);
router.post('/', sleepController.create);
router.put('/:id', sleepController.update);
router.delete('/:id', sleepController.remove);

module.exports = router;
