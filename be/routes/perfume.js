const router = require('express').Router();
const ctrl = require('../controllers/perfumeController'); // Perfume CRUD
const commentCtrl = require('../controllers/commentController'); // Comment CRUD
const { verifyToken, isAdmin } = require('../middlewares/auth');

// ----------------------
// Perfume routes
// ----------------------
router.get('/', ctrl.getAll); // public
router.get('/:perfumeId', ctrl.getOne); // public

// admin protected
router.post('/', verifyToken, isAdmin, ctrl.create);
router.put('/:perfumeId', verifyToken, isAdmin, ctrl.update);
router.delete('/:perfumeId', verifyToken, isAdmin, ctrl.delete);

// ----------------------
// Comment routes (user protected)
// ----------------------
router.post('/:perfumeId/comments', verifyToken, commentCtrl.addComment);
router.put('/:perfumeId/comments/:commentId', verifyToken, commentCtrl.updateComment);
router.delete('/:perfumeId/comments/:commentId', verifyToken, commentCtrl.deleteComment);

module.exports = router;
