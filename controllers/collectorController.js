const Collector = require('../models/Collector');
const bcrypt = require('bcryptjs');

exports.getAllCollectors = async (req, res) => {
  const collectors = await Collector.find().select('-password');
  res.json(collectors);
};

exports.getCollector = async (req, res) => {
  const m = await Collector.findById(req.params.id).select('-password');
  res.json(m);
};

// collector edits own info (route protected by verifyToken + isSelf)
exports.updateSelf = async (req, res) => {
  const updates = (({ name, YOB, gender }) => ({ name, YOB, gender }))(req.body);
  const updated = await Collector.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  res.json(updated);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Collector.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: 'No user' });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Old password incorrect' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ msg: 'Password changed' });
};

exports.getCollectorsPage = async (req, res) => {
  try {
    const activeCollectors = await Collector.find({ isDeleted: false }).select('-password');
    const deletedCollectors = await Collector.find({ isDeleted: true }).select('-password');

    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const collectorsCount = await Collector.countDocuments();

    res.render('collectors', {
      title: 'Collector List',
      collectors: activeCollectors,
      deletedCollectors,
      perfumesCount,
      brandsCount,
      collectorsCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.restoreCollector = async (req, res) => {
  try {
    await Collector.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deleteReason: ''
    });
    res.redirect('/admin/collectors');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error restoring collector');
  }
};
