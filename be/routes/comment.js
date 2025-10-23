const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

router.post('/:perfumeId/comments', verifyToken, ctrl.addComment);
router.put('/:perfumeId/comments/:commentId', verifyToken, ctrl.updateComment);
router.delete('/:perfumeId/comments/:commentId', verifyToken, ctrl.deleteComment);

module.exports = router;
