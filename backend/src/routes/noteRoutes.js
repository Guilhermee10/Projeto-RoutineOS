const express = require('express');
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', noteController.list);
router.get('/tags', noteController.tags); // antes de /:id
router.post('/', noteController.create);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.remove);

module.exports = router;
