const jwt = require('jsonwebtoken');
const Collector = require('../models/Collector');

/* -----------------------------------------------------
 🧩 Xác thực JWT Token
----------------------------------------------------- */
exports.verifyToken = async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header)
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = header.split(' ')[1]; // Format: Bearer <token>
    if (!token)
      return res.status(401).json({ success: false, message: 'Invalid token format' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'perfume-secret');

    // Lấy thông tin người dùng đầy đủ từ DB
    const user = await Collector.findById(decoded.id).select('-password');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // Gán thông tin cho req.user luôn đầy đủ isAdmin
    req.user = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    };
    req.currentUser = user;

    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};


/* -----------------------------------------------------
 🔐 Kiểm tra quyền Admin
----------------------------------------------------- */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ success: false, message: 'Admin only' });
};

/* -----------------------------------------------------
 👤 Chỉ cho phép chính chủ (Self)
----------------------------------------------------- */
exports.isSelf = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: 'No token provided' });

  if (req.user.id === req.params.id) return next();
  return res
    .status(403)
    .json({ success: false, message: 'Forbidden: can only modify own account' });
};
