const router = require('express').Router();
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const { requireLogin } = require('../middlewares/auth');

// --------------------
// 🏠 Trang chủ
// --------------------
router.get('/', async (req, res) => {
  const { q, brand } = req.query;
  const filter = {};
  if (q) filter.perfumeName = { $regex: q, $options: 'i' };
  if (brand) filter.brand = brand;

  const perfumes = await Perfume.find(filter).populate('brand', 'brandName');
  const brands = await Brand.find();

  res.render('index', { title: 'Perfume Store', perfumes, brands, q, brand });
  req.session.successMessage = null;
});

// --------------------
// 🔍 Chi tiết sản phẩm
// --------------------
router.get('/perfume/:id', async (req, res) => {
  const perfume = await Perfume.findById(req.params.id)
    .populate('brand', 'brandName')
    .populate('comments.author', 'name');

  // ✅ Tính trung bình rating
  let avgRating = 0;
  if (perfume.comments.length > 0) {
    const total = perfume.comments.reduce((sum, c) => sum + c.rating, 0);
    avgRating = (total / perfume.comments.length).toFixed(1);
  }

  res.render('perfumeDetail', {
    title: perfume ? perfume.perfumeName : 'Perfume Detail',
    perfume,
    user: req.session.user,
    avgRating,
  });
});

// --------------------
// 💬 COMMENT FEATURE
// --------------------

// 📝 Thêm bình luận
router.post('/perfume/:perfumeId/comments', requireLogin, async (req, res) => {
  try {
    const { rating, content } = req.body;
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume)
      return res.send('<script>alert("Không tìm thấy sản phẩm!");window.history.back();</script>');

    // ✅ Chặn comment nhiều lần
    const existingComment = perfume.comments.find(
      c => c.author.toString() === req.session.user._id.toString()
    );
    if (existingComment) {
      return res.send('<script>alert("Bạn chỉ được bình luận 1 lần!");window.history.back();</script>');
    }

    // ✅ Validate rating
    const numRating = parseInt(rating);
    if (![1, 2, 3].includes(numRating)) {
      return res.send('<script>alert("Rating không hợp lệ!");window.history.back();</script>');
    }

    perfume.comments.push({
      rating: numRating,
      content,
      author: req.session.user._id
    });

    await perfume.save();
    res.redirect(`/perfume/${req.params.perfumeId}`);
  } catch (err) {
    res.send(`<script>alert("Lỗi: ${err.message}");window.history.back();</script>`);
  }
});

// ✏️ Cập nhật bình luận
router.post('/perfume/:perfumeId/comments/:commentId/edit', requireLogin, async (req, res) => {
  try {
    const { rating, content } = req.body;
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume)
      return res.send('<script>alert("Không tìm thấy sản phẩm!");window.history.back();</script>');

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment)
      return res.send('<script>alert("Không tìm thấy bình luận!");window.history.back();</script>');

    // chỉ cho phép sửa bình luận của chính mình
    if (comment.author.toString() !== req.session.user._id.toString())
      return res.send('<script>alert("Bạn không có quyền chỉnh sửa bình luận này!");window.history.back();</script>');

    const numRating = parseInt(rating);
    if (![1, 2, 3].includes(numRating)) {
      return res.send('<script>alert("Rating không hợp lệ!");window.history.back();</script>');
    }

    comment.rating = numRating;
    comment.content = content;

    await perfume.save();
    res.redirect(`/perfume/${req.params.perfumeId}`);
  } catch (err) {
    res.send(`<script>alert("Lỗi: ${err.message}");window.history.back();</script>`);
  }
});

// ❌ Xoá bình luận
router.post('/perfume/:perfumeId/comments/:commentId/delete', requireLogin, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume)
      return res.send('<script>alert("Không tìm thấy sản phẩm!");window.history.back();</script>');

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment)
      return res.send('<script>alert("Không tìm thấy bình luận!");window.history.back();</script>');

    // chỉ cho phép xóa bình luận của chính mình
    if (comment.author.toString() !== req.session.user._id.toString())
      return res.send('<script>alert("Bạn không có quyền xóa bình luận này!");window.history.back();</script>');

    comment.deleteOne();
    await perfume.save();
    res.redirect(`/perfume/${req.params.perfumeId}`);
  } catch (err) {
    res.send(`<script>alert("Lỗi: ${err.message}");window.history.back();</script>`);
  }
});

// --------------------
// --------------------
// 🔑 Login
// --------------------
router.get("/login", (req, res) => {
  const redirectUrl = req.query.redirect || "/";
  res.render("login", {
    redirectUrl,
    successMessage: req.flash('success'),
    errorMessage: req.flash('error')
  });
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const redirectUrl = req.query.redirect || "/";

  try {
    const user = await Member.findOne({ email });
    if (!user) {
      req.flash('error', 'Email không tồn tại');
      return res.redirect("/login");
    }

    if (user.isDeleted) {
      req.flash('error', `Tài khoản đã bị khoá. Lý do: ${user.deleteReason || 'Không xác định'}`);
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Sai mật khẩu');
      return res.redirect("/login");
    }

    // ✅ Lưu session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };

    // ✅ Flash message
    req.flash('success', user.isAdmin ? 'Admin login success!' : 'Login success!');

    // ✅ Redirect
    return user.isAdmin ? res.redirect('/admin/dashboard') : res.redirect(redirectUrl);

  } catch (err) {
    req.flash('error', `Lỗi: ${err.message}`);
    return res.redirect("/login");
  }
});



// --------------------
// 🚪 Logout
// --------------------
router.get('/logout', (req, res) => {
  req.session.user = null;
  req.flash('success', 'Logout Successful!');
  res.redirect('/');
});


// --------------------
// 📝 Đăng ký
// --------------------
router.get('/register', (req, res) => res.render('register', { title: 'Register' }));

router.post('/register', async (req, res) => {
  const { email, password, name, YOB, gender } = req.body;
  try {
    const existing = await Member.findOne({ email });
    if (existing)
      return res.send('<script>alert("Email đã tồn tại");window.history.back();</script>');

    const hash = await bcrypt.hash(password, 10);
    const member = new Member({ email, password: hash, name, YOB, gender });
    await member.save();

    res.send('<script>alert("Đăng ký thành công!");window.location="/login";</script>');
  } catch (err) {
    res.send(`<script>alert("Lỗi: ${err.message}");window.history.back();</script>`);
  }
});

// --------------------
// 👤 Trang cá nhân
// --------------------
router.get('/profile', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login');
  }

  res.render('profile', {
    title: 'Hồ sơ cá nhân',
    user,
    successMessage: req.session.successMessage
  });

  req.session.successMessage = null;
});

module.exports = router;
