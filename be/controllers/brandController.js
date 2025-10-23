const Brand = require('../models/Brand');

exports.getAll = async (req, res) => {
  const brands = await Brand.find();
  res.json(brands);
};

exports.create = async (req, res) => {
  const b = new Brand(req.body);
  await b.save();
  res.status(201).json(b);
};

exports.update = async (req, res) => {
  const updated = await Brand.findByIdAndUpdate(req.params.brandId, req.body, { new: true });
  res.json(updated);
};

exports.delete = async (req, res) => {
  await Brand.findByIdAndDelete(req.params.brandId);
  res.json({ msg: 'Deleted' });
};
