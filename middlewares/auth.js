const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

exports.verifyToken = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ msg: 'No token' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, isAdmin }
    // optional: fetch full user
    req.currentUser = await Member.findById(decoded.id).select('-password');
    next();
  } catch (err) { res.status(401).json({ msg: 'Invalid token' }); }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ msg: 'Admin only' });
};

exports.isSelf = (req, res, next) => {
  // used for routes like /members/:id where only owner can edit
  if (!req.user) return res.status(401).json({ msg: 'No token' });
  if (req.user.id === req.params.id) return next();
  return res.status(403).json({ msg: 'Forbidden: can only modify own account' });
};
