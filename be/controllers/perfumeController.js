const Perfume = require('../models/Perfume');

exports.getAll = async (req, res) => {
  // add search and filter logic
  const { q, brand } = req.query;
  const filter = {};
  if (q) filter.perfumeName = { $regex: q, $options: 'i' };
  if (brand) filter.brand = brand;
  const perfumes = await Perfume.find(filter).select('perfumeName uri targetAudience brand concentration price').populate('brand', 'brandName');
  res.json(perfumes);
};

exports.getOne = async (req, res) => {
  const p = await Perfume.findById(req.params.perfumeId).populate('brand', 'brandName').populate('comments.author', 'name email');
  res.json(p);
};

// Admin-only CRUD for perfumes:
exports.create = async (req, res) => {
  const p = new Perfume(req.body);
  await p.save();
  res.status(201).json(p);
};
exports.update = async (req, res) => {
  const p = await Perfume.findByIdAndUpdate(req.params.perfumeId, req.body, { new: true });
  res.json(p);
};
exports.delete = async (req, res) => {
  await Perfume.findByIdAndDelete(req.params.perfumeId);
  res.json({ msg: 'Deleted' });
};
