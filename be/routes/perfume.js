const router = require('express').Router();
const ctrl = require('../controllers/perfumeController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/', ctrl.getAll); // public
router.get('/:perfumeId', ctrl.getOne); // public

// admin protected
router.post('/', verifyToken, isAdmin, ctrl.create);
router.put('/:perfumeId', verifyToken, isAdmin, ctrl.update);
router.delete('/:perfumeId', verifyToken, isAdmin, ctrl.delete);

module.exports = router;
