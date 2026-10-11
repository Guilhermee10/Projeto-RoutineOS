const express = require('express');
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas de atividade exigem usuário autenticado
router.use(authMiddleware);

// IMPORTANTE: /checkins precisa vir ANTES de qualquer rota com /:id,
// senão "checkins" seria interpretado como um ID (mesmo problema que
// já vimos com /stats lá no sleepRoutes).
router.get('/checkins', activityController.listCheckIns);
router.get('/', activityController.list);
router.post('/', activityController.create);
router.put('/:id', activityController.update);
router.delete('/:id', activityController.remove);
router.patch('/:id/checkin', activityController.checkin);

module.exports = router;
