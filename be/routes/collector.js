const router = require('express').Router();
const collectorCtrl = require('../controllers/collectorController');
const { verifyToken, isAdmin, isSelf } = require('../middlewares/auth');

// Trang EJS cho admin: xem collectors (active + deleted)
router.get('/page', verifyToken, isAdmin, collectorCtrl.getCollectorsPage);

// Admin lấy tất cả collectors (JSON API)
router.get('/', verifyToken, isAdmin, collectorCtrl.getAllCollectors);

// Lấy thông tin collector theo id
router.get('/:id', verifyToken, collectorCtrl.getCollector);

// Collector tự cập nhật thông tin cá nhân
router.put('/:id', verifyToken, isSelf, collectorCtrl.updateSelf);

// Collector đổi mật khẩu
router.put('/:id/change-password', verifyToken, isSelf, collectorCtrl.changePassword);

// Khôi phục collector đã bị xóa
router.post('/restore/:id', verifyToken, isAdmin, collectorCtrl.restoreCollector);

module.exports = router;
