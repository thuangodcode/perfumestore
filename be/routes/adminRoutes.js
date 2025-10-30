const express = require('express');
const router = require('express').Router();
const { requireAdmin } = require('../middlewares/adminSession'); // tên đúng
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Collector = require('../models/Collector');

// -------------------- DASHBOARD --------------------
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [perfumes, perfumesCount, brandsCount, collectorsCount] = await Promise.all([
      Perfume.find().populate('brand', 'brandName'),
      Perfume.countDocuments(),
      Brand.countDocuments(),
      Collector.countDocuments(),
    ]);

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      stats: { perfumesCount, brandsCount, collectorsCount },
      perfumes,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ success: false, message: 'Error loading dashboard', error: err.message });
  }
});

// -------------------- PERFUMES --------------------
router.post('/perfumes', requireAdmin, async (req, res) => {
  console.log('Incoming body:', req.body); // <--- check đây
  try {
    const newPerfume = new Perfume(req.body);
    await newPerfume.save();
    res.status(201).json({ success: true, message: 'Perfume added successfully', perfume: newPerfume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding perfume', error: err.message });
  }
});


router.get('/perfumes/:id', requireAdmin, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id).populate('brand', 'brandName');
    if (!perfume) return res.status(404).json({ success: false, message: 'Perfume not found' });
    res.json({ success: true, perfume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching perfume', error: err.message });
  }
});

router.put('/perfumes/:id', requireAdmin, async (req, res) => {
  try {
    const updatedPerfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPerfume) return res.status(404).json({ success: false, message: 'Perfume not found' });
    res.json({ success: true, message: 'Perfume updated successfully', perfume: updatedPerfume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating perfume', error: err.message });
  }
});

router.delete('/perfumes/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Perfume.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Perfume not found' });
    res.json({ success: true, message: 'Perfume deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting perfume', error: err.message });
  }
});

// -------------------- BRANDS --------------------
router.get('/brands', requireAdmin, async (req, res) => {
  try {
    const [brands, perfumesCount, brandsCount, collectorsCount] = await Promise.all([
      Brand.find().sort({ brandName: 1 }),
      Perfume.countDocuments(),
      Brand.countDocuments(),
      Collector.countDocuments(),
    ]);

    res.json({
      success: true,
      message: 'Brand list fetched successfully',
      brands,
      stats: { perfumesCount, brandsCount, collectorsCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching brands', error: err.message });
  }
});

router.post('/brands', requireAdmin, async (req, res) => {
  try {
    let { brandName } = req.body;
    if (!brandName || brandName.trim() === '') return res.status(400).json({ success: false, message: 'Brand name is required' });
    brandName = brandName.trim();

    const existing = await Brand.findOne({ brandName }).collation({ locale: 'en', strength: 2 });
    if (existing) return res.status(400).json({ success: false, message: 'Brand already exists' });

    const newBrand = new Brand({ brandName });
    await newBrand.save();
    res.status(201).json({ success: true, message: 'Brand added successfully', brand: newBrand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding brand', error: err.message });
  }
});

router.get('/brands/:id', requireAdmin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching brand', error: err.message });
  }
});

router.put('/brands/:id', requireAdmin, async (req, res) => {
  try {
    const { brandName } = req.body;
    if (!brandName || brandName.trim() === '') return res.status(400).json({ success: false, message: 'Brand name required' });

    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, { brandName: brandName.trim() }, { new: true });
    if (!updatedBrand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand updated successfully', brand: updatedBrand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating brand', error: err.message });
  }
});

router.delete('/brands/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting brand', error: err.message });
  }
});

// -------------------- COLLECTORS --------------------
router.get('/collectors', requireAdmin, async (req, res) => {
  try {
    const [activeCollectors, deletedCollectors, perfumesCount, brandsCount, collectorsCount] = await Promise.all([
      Collector.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 }),
      Collector.find({ isDeleted: true }).select('-password').sort({ updatedAt: -1 }),
      Perfume.countDocuments(),
      Brand.countDocuments(),
      Collector.countDocuments(),
    ]);

    res.json({
      success: true,
      message: 'Collectors fetched successfully',
      data: { activeCollectors, deletedCollectors, stats: { perfumesCount, brandsCount, collectorsCount } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching collectors', error: err.message });
  }
});

module.exports = router;
