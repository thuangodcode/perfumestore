const router = require('express').Router();
const ctrl = require('../controllers/brandController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/', ctrl.getAll);

// Admin-only for create/update/delete:
router.post('/', verifyToken, isAdmin, ctrl.create);
router.put('/:brandId', verifyToken, isAdmin, ctrl.update);
router.delete('/:brandId', verifyToken, isAdmin, ctrl.delete);

module.exports = router;
