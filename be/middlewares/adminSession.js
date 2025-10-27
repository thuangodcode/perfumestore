const jwt = require('jsonwebtoken');
const Collector = require('../models/Collector');

/**
 * ✅ Xác thực token và kiểm tra quyền Admin
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header)
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = header.split(' ')[1];
    if (!token)
      return res.status(401).json({ success: false, message: 'Invalid token format' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'perfume-secret');
    const user = await Collector.findById(decoded.id).select('-password');

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.isAdmin)
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });

    req.user = decoded; // Thông tin cơ bản từ token
    req.currentUser = user; // Dữ liệu đầy đủ từ DB
    next();
  } catch (err) {
    console.error('❌ Admin Auth Error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
