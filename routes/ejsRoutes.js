const router = require('express').Router();
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');

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

  res.render('perfumeDetail', {
    title: perfume ? perfume.perfumeName : 'Perfume Detail',
    perfume,
  });
});

// --------------------
// 🔑 Login
// --------------------
router.get('/login', (req, res) =>
  res.render('login', { title: 'Login', error: null })
);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Member.findOne({ email });
    if (!user)
      return res.send('<script>alert("Email không tồn tại");window.history.back();</script>');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.send('<script>alert("Sai mật khẩu");window.history.back();</script>');

    // ✅ Lưu user vào session
    req.session.user = { _id: user._id, name: user.name, email: user.email };
    req.session.successMessage = "Đăng nhập thành công!";
    res.redirect('/');
  } catch (err) {
    res.send('<script>alert("Lỗi: ' + err.message + '");window.history.back();</script>');
  }
});

// --------------------
// 🚪 Logout
// --------------------
router.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.successMessage = "Đăng xuất thành công!";
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
    res.send('<script>alert("Lỗi: ' + err.message + '");window.history.back();</script>');
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

  req.session.successMessage = null; // xóa message sau khi hiển thị
});


module.exports = router;
