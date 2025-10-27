// controllers/brandController.js
const Brand = require('../models/Brand');

// --------------------
// 📦 Get all brands
// --------------------
exports.getAll = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Fetched all brands successfully',
      data: brands
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: err.message
    });
  }
};

// --------------------
// ➕ Create a new brand
// --------------------
exports.create = async (req, res) => {
  try {
    let { brandName } = req.body;
    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    // ✅ Trim & check duplicate (case-insensitive)
    brandName = brandName.trim();
    const existing = await Brand.findOne({ brandName }).collation({ locale: 'en', strength: 2 });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Brand name already exists'
      });
    }

    const newBrand = new Brand({ brandName });
    await newBrand.save();

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: newBrand
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating brand',
      error: err.message
    });
  }
};

// --------------------
// ✏️ Update brand by ID
// --------------------
exports.update = async (req, res) => {
  try {
    const { brandName } = req.body;
    const updated = await Brand.findByIdAndUpdate(
      req.params.brandId,
      { brandName },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      error: err.message
    });
  }
};

// --------------------
// ❌ Delete brand by ID
// --------------------
exports.delete = async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.brandId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting brand',
      error: err.message
    });
  }
};
