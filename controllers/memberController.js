const Member = require('../models/Member');
const bcrypt = require('bcryptjs');

exports.getAllMembers = async (req, res) => {
  const members = await Member.find().select('-password');
  res.json(members);
};

exports.getMember = async (req, res) => {
  const m = await Member.findById(req.params.id).select('-password');
  res.json(m);
};

// member edits own info (route protected by verifyToken + isSelf)
exports.updateSelf = async (req, res) => {
  const updates = (({ name, YOB, gender }) => ({ name, YOB, gender }))(req.body);
  const updated = await Member.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  res.json(updated);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Member.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: 'No user' });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Old password incorrect' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ msg: 'Password changed' });
};
