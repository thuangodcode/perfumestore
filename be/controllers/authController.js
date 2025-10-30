// controllers/authController.js
const Collector = require('../models/Collector');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// --------------------
// 📝 REGISTER
// --------------------
exports.register = async (req, res) => {
  try {
    const { email, password, name, YOB, gender } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email & password required' });
    }

    const existing = await Collector.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const collector = new Collector({ email, password: hash, name, YOB, gender });
    await collector.save();

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please log in.',
      data: {
        _id: collector._id,
        email: collector.email,
        name: collector.name
      }
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// --------------------
// 🔑 LOGIN
// --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await Collector.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: 'Email not found' });

    if (user.isDeleted)
      return res.status(403).json({
        success: false,
        message: `Account locked: ${user.deleteReason || 'Unknown reason'}`
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Incorrect password' });

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET profile
exports.getProfile = async (req, res) => {
  try {
    const user = await Collector.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT profile (update name / password)
exports.updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await Collector.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password incorrect' });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


