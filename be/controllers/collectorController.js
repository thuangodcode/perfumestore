// controllers/collectorController.js
const Collector = require('../models/Collector');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const bcrypt = require('bcryptjs');

// --------------------
// 📋 Get all collectors (Admin)
// --------------------
exports.getAllCollectors = async (req, res) => {
  try {
    const collectors = await Collector.find().select('-password');
    res.json({ success: true, data: collectors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// 👤 Get collector by ID
// --------------------
exports.getCollector = async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id).select('-password');
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    res.json({ success: true, data: collector });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// ✏️ Collector updates own profile
// --------------------
exports.updateSelf = async (req, res) => {
  try {
    const { name, YOB, gender } = req.body;
    const updates = { name, YOB, gender };

    const updated = await Collector.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// 🔑 Change password (self only)
// --------------------
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Collector.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Old password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// 📊 Get collectors statistics (Admin)
// --------------------
exports.getCollectorsPage = async (req, res) => {
  try {
    const activeCollectors = await Collector.find({ isDeleted: false }).select('-password');
    const deletedCollectors = await Collector.find({ isDeleted: true }).select('-password');

    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const collectorsCount = await Collector.countDocuments();

    res.json({
      success: true,
      data: {
        activeCollectors,
        deletedCollectors,
        stats: { perfumesCount, brandsCount, collectorsCount }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// ♻️ Restore collector (Admin)
// --------------------
exports.restoreCollector = async (req, res) => {
  try {
    await Collector.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deleteReason: ''
    });

    res.json({ success: true, message: 'Collector restored successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
