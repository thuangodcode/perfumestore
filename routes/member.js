const router = require('express').Router();
const memberCtrl = require('../controllers/memberController');
const { verifyToken, isAdmin, isSelf } = require('../middlewares/auth');

router.get('/:id', verifyToken, memberCtrl.getMember);

// Admin get all members
router.get('/', verifyToken, isAdmin, memberCtrl.getAllMembers);

// update self
router.put('/:id', verifyToken, isSelf, memberCtrl.updateSelf);
router.put('/:id/change-password', verifyToken, isSelf, memberCtrl.changePassword);

module.exports = router;
