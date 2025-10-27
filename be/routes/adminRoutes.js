const express = require('express');
const router = require('express').Router();
const { requireAdminSession } = require('../middlewares/adminSession');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Collector = require('../models/Collector');

// ✅ Trang Dashboard
// GET /admin/dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Lấy toàn bộ thống kê
    const [perfumes, perfumesCount, brandsCount, collectorsCount] = await Promise.all([
      Perfume.find().populate('brand', 'brandName'),
      Perfume.countDocuments(),
      Brand.countDocuments(),
      Collector.countDocuments(),
    ]);

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      stats: {
        perfumesCount,
        brandsCount,
        collectorsCount,
      },
      perfumes,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ success: false, message: 'Error loading dashboard', error: err.message });
  }
});


// ✅ Trang form thêm sản phẩm mới
router.get('/brands', requireAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().select('brandName');
    res.json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading brands', error: err.message });
  }
});

// ✅ Xử lý thêm sản phẩm mới
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      brand,
    } = req.body;

    const newPerfume = new Perfume({
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      brand,
    });

    await newPerfume.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      perfume: newPerfume,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: err.message,
    });
  }
});


// ✅ Trang form chỉnh sửa
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id).populate('brand', 'brandName');
    if (!perfume) return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({ success: true, perfume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching perfume', error: err.message });
  }
});

// ✅ Xử lý lưu chỉnh sửa
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updatedPerfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPerfume)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({ success: true, message: 'Product updated successfully', perfume: updatedPerfume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating perfume', error: err.message });
  }
});

// ✅ Xóa sản phẩm (Perfume)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Perfume.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting perfume', error: err.message });
  }
});

// 📌 Trang liệt kê Brands (UI Admin)
router.get('/', requireAdmin, async (req, res) => {
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
      stats: {
        perfumesCount,
        brandsCount,
        collectorsCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brand list',
      error: err.message,
    });
  }
});

// Trang form thêm Brand mới
router.post('/', requireAdmin, async (req, res) => {
  try {
    let { brandName } = req.body;
    if (!brandName || brandName.trim() === '')
      return res.status(400).json({ success: false, message: 'Brand name is required' });

    brandName = brandName.trim();

    // Kiểm tra trùng tên (case-insensitive)
    const existing = await Brand.findOne({ brandName }).collation({ locale: 'en', strength: 2 });
    if (existing)
      return res.status(400).json({ success: false, message: 'Brand already exists' });

    const newBrand = new Brand({ brandName });
    await newBrand.save();

    res.status(201).json({
      success: true,
      message: 'Brand added successfully',
      brand: newBrand,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error adding brand',
      error: err.message,
    });
  }
});



// Trang form chỉnh sửa Brand
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    res.json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching brand', error: err.message });
  }
});

// Xử lý lưu chỉnh sửa Brand
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { brandName } = req.body;
    if (!brandName || brandName.trim() === '')
      return res.status(400).json({ success: false, message: 'Brand name required' });

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { brandName: brandName.trim() },
      { new: true }
    );

    if (!updatedBrand)
      return res.status(404).json({ success: false, message: 'Brand not found' });

    res.json({ success: true, message: 'Brand updated successfully', brand: updatedBrand });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      error: err.message,
    });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const [activeCollectors, deletedCollectors, perfumesCount, brandsCount, collectorsCount] =
      await Promise.all([
        Collector.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 }),
        Collector.find({ isDeleted: true }).select('-password').sort({ updatedAt: -1 }),
        Perfume.countDocuments(),
        Brand.countDocuments(),
        Collector.countDocuments(),
      ]);

    res.json({
      success: true,
      message: 'Collectors fetched successfully',
      data: {
        activeCollectors,
        deletedCollectors,
        stats: { perfumesCount, brandsCount, collectorsCount },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching collectors',
      error: err.message,
    });
  }
});

router.patch('/:id/ban', requireAdmin, async (req, res) => {
  try {
    const reason = req.body.deleteReason || 'Không xác định';

    const collector = await Collector.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deleteReason: reason },
      { new: true }
    ).select('-password');

    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    res.json({
      success: true,
      message: 'Collector has been banned',
      collector,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error banning collector',
      error: err.message,
    });
  }
});

// ✅ Khôi phục Collector (Unban user)
router.patch('/:id/restore', requireAdmin, async (req, res) => {
  try {
    const collector = await Collector.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deleteReason: '' },
      { new: true }
    ).select('-password');

    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    res.json({
      success: true,
      message: 'Collector restored successfully',
      collector,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error restoring collector',
      error: err.message,
    });
  }
});


module.exports = router;
