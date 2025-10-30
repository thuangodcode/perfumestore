const router = require('express').Router();
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Collector = require('../models/Collector');
const bcrypt = require('bcryptjs');
const { requireLogin } = require('../middlewares/auth');
const { verifyToken } = require('../middlewares/auth');

// --------------------
// 🏠 GET /api/perfumes  → Trang chủ (React gọi để lấy danh sách)
// --------------------
router.get('/', async (req, res) => {
  try {
    const { q, brand, gender, sortPrice } = req.query;
    const filter = {};

    // 🔍 Tìm theo tên nước hoa
    if (q) filter.perfumeName = { $regex: q, $options: 'i' };

    // 🏷️ Lọc theo thương hiệu
    if (brand) filter.brand = brand;

    // 🚻 Lọc theo giới tính
    if (gender) filter.targetAudience = gender;

    // 📦 Tạo truy vấn cơ bản
    let query = Perfume.find(filter).populate('brand', 'brandName');

    // 💰 Sắp xếp theo giá
    if (sortPrice === 'asc') query = query.sort({ price: 1 });
    else if (sortPrice === 'desc') query = query.sort({ price: -1 });

    // ⚙️ Thực thi truy vấn
    const perfumes = await query.exec();
    const brands = await Brand.find();

    // 🔁 Trả JSON cho React
    res.json({
      success: true,
      data: {
        perfumes,
        brands,
        filters: { q, brand, gender, sortPrice }
      }
    });

  } catch (error) {
    console.error('Error loading perfumes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
});


// --------------------
// 🔍 Chi tiết sản phẩm
// --------------------
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name');

    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: 'Perfume not found'
      });
    }

    // ✅ Tính trung bình rating
    let avgRating = 0;
    if (perfume.comments.length > 0) {
      const total = perfume.comments.reduce((sum, c) => sum + c.rating, 0);
      avgRating = (total / perfume.comments.length).toFixed(1);
    }

    // ✅ Trả dữ liệu JSON
    res.json({
      success: true,
      data: {
        perfume,
        avgRating: Number(avgRating)
      }
    });

  } catch (error) {
    console.error('Error fetching perfume detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
});

// --------------------
// 💬 COMMENT FEATURE
// --------------------

// 📝 Thêm bình luận
router.post('/:perfumeId/comments', verifyToken, async (req, res) => {
  try {
    // 🚫 Chặn admin comment
    if (req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot add comments'
      });
    }

    const { rating, content } = req.body;

    // 🔎 Tìm perfume
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: 'Perfume not found'
      });
    }

    // 🚫 Chặn comment nhiều lần cùng 1 perfume
    const alreadyCommented = perfume.comments.find(
      c => c.author.toString() === req.user.id
    );
    if (alreadyCommented) {
      return res.status(400).json({
        success: false,
        message: 'You can only comment once on this perfume'
      });
    }

    // ✅ Validate rating
    const numRating = parseInt(rating);
    if (![1, 2, 3].includes(numRating)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating (must be 1, 2, or 3)'
      });
    }

    // 📝 Thêm bình luận
    perfume.comments.push({
      rating: numRating,
      content,
      author: req.user.id
    });

    await perfume.save();

    res.json({
      success: true,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
});


// ======================================================
// ✏️ PUT /api/perfumes/:perfumeId/comments/:commentId → Cập nhật bình luận
// ======================================================
router.put('/:perfumeId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { rating, content } = req.body;
    const perfume = await Perfume.findById(req.params.perfumeId);

    if (!perfume) {
      return res.status(404).json({ success: false, message: 'Perfume not found' });
    }

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // ✅ Chỉ cho phép chỉnh sửa comment của chính mình
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to edit this comment'
      });
    }

    // ✅ Validate rating
    const numRating = parseInt(rating);
    if (![1, 2, 3].includes(numRating)) {
      return res.status(400).json({ success: false, message: 'Invalid rating value' });
    }

    // ✅ Cập nhật nội dung
    comment.rating = numRating;
    comment.content = content;

    await perfume.save();
    res.json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment',
      error: error.message
    });
  }
});

// ======================================================
// ❌ DELETE /api/perfumes/:perfumeId/comments/:commentId → Xoá bình luận
// ======================================================
// DELETE comment
router.delete('/:perfumeId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) return res.status(404).json({ success: false, message: 'Perfume not found' });

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // 🔹 Lấy authorId luôn đúng dạng string
    let authorId = '';
    if (comment.author?._id) authorId = comment.author._id.toString();
    else if (typeof comment.author === 'string') authorId = comment.author;
    else if (comment.author?._id?.toString) authorId = comment.author._id.toString();

    const isAdmin = currentUser.isAdmin === true;
    const isAuthor = authorId === currentUser.id;

    console.log('==== DELETE COMMENT DEBUG ====');
    console.log('currentUser:', currentUser);
    console.log('comment.author:', comment.author);
    console.log('authorId:', authorId);
    console.log('isAdmin:', isAdmin, 'isAuthor:', isAuthor);

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ success: false, message: 'You cannot delete this comment' });
    }

    comment.deleteOne();
    await perfume.save();

    console.log(`Comment ${req.params.commentId} deleted by ${currentUser.id} (isAdmin: ${isAdmin})`);
    return res.json({ success: true, message: 'Comment deleted successfully' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


// // 🔑 Login
// // --------------------
// router.get("/login", (req, res) => {
//   const redirectUrl = req.query.redirect || "/";
//   res.render("login", {
//     redirectUrl,
    
//   });
// });

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔎 Kiểm tra user tồn tại
    const user = await Collector.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email does not exist'
      });
    }

    // 🚫 Kiểm tra tài khoản bị khoá
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: `Account has been locked. Reason: ${user.deleteReason || 'Unknown'}`
      });
    }

    // 🔐 So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Wrong password'
      });
    }

    // ✅ Tạo JWT token (chứa id, isAdmin)
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Trả kết quả JSON cho React
    res.json({
      success: true,
      message: user.isAdmin ? 'Admin login successful!' : 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message
    });
  }
});

// ======================================================
// 🚪 POST /api/auth/logout → Đăng xuất (React xóa JWT)
// ======================================================
router.post('/logout', (req, res) => {
  // Với JWT, server không lưu session, nên logout = client xoá token
  res.json({
    success: true,
    message: 'Logout successful (client should remove token)'
  });
});

router.post('/register', async (req, res) => {
  const { email, password, name, YOB, gender } = req.body;

  try {
    // 🔍 Kiểm tra trùng email
    const existing = await Collector.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists!'
      });
    }

    // 🔐 Hash mật khẩu
    const hash = await bcrypt.hash(password, 10);

    // 🧾 Tạo tài khoản mới
    const collector = new Collector({
      email,
      password: hash,
      name,
      YOB,
      gender
    });

    await collector.save();

    // ✅ Phản hồi JSON cho React
    res.json({
      success: true,
      message: 'Registration successful! Please log in to continue.'
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// ======================================================
// 👤 GET /api/auth/profile → Trang cá nhân (yêu cầu JWT)
// ======================================================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // 🧩 Lấy user từ token
    const user = await Collector.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Trả thông tin user
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        YOB: user.YOB,
        gender: user.gender,
        isAdmin: user.isAdmin,
        isDeleted: user.isDeleted,
        deleteReason: user.deleteReason
        authProvider: user.authProvider,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

module.exports = router;
