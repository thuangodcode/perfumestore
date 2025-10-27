const Perfume = require('../models/Perfume');

// --------------------
// 📦 Lấy danh sách nước hoa (có thể search + filter theo brand)
// --------------------
exports.getAll = async (req, res) => {
  try {
    const { q, brand } = req.query;
    const filter = {};

    if (q) filter.perfumeName = { $regex: q, $options: 'i' };
    if (brand) filter.brand = brand;

    const perfumes = await Perfume.find(filter)
      .select('perfumeName uri targetAudience brand concentration price')
      .populate('brand', 'brandName');

    res.json({
      success: true,
      message: 'Fetched all perfumes successfully',
      data: perfumes,
    });
  } catch (err) {
    console.error('Error fetching perfumes:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching perfumes',
      error: err.message,
    });
  }
};

// --------------------
// 🔍 Lấy chi tiết 1 nước hoa (kèm bình luận + tác giả)
// --------------------
exports.getOne = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name email');

    if (!perfume)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({
      success: true,
      message: 'Perfume fetched successfully',
      data: perfume,
    });
  } catch (err) {
    console.error('Error fetching perfume:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching perfume',
      error: err.message,
    });
  }
};

// --------------------
// 🧑‍💼 (Admin) Thêm nước hoa mới
// --------------------
exports.create = async (req, res) => {
  try {
    const perfume = new Perfume(req.body);
    await perfume.save();

    res.status(201).json({
      success: true,
      message: 'Perfume created successfully',
      data: perfume,
    });
  } catch (err) {
    console.error('Error creating perfume:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating perfume',
      error: err.message,
    });
  }
};

// --------------------
// ✏️ (Admin) Cập nhật nước hoa
// --------------------
exports.update = async (req, res) => {
  try {
    const updated = await Perfume.findByIdAndUpdate(
      req.params.perfumeId,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({
      success: true,
      message: 'Perfume updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating perfume:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating perfume',
      error: err.message,
    });
  }
};

// --------------------
// ❌ (Admin) Xóa nước hoa
// --------------------
exports.delete = async (req, res) => {
  try {
    const deleted = await Perfume.findByIdAndDelete(req.params.perfumeId);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    res.json({
      success: true,
      message: 'Perfume deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting perfume:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting perfume',
      error: err.message,
    });
  }
};
