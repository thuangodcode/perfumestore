const router = require('express').Router();
const { requireAdminSession } = require('../middlewares/adminSession');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Member = require('../models/Member');

// ✅ Trang Dashboard
// GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const perfumes = await Perfume.find().populate('brand', 'brandName');
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const membersCount = await Member.countDocuments();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      admin: req.session.user,
      perfumes,
      perfumesCount,
      brandsCount,
      membersCount,
    });

  } catch (err) {
    res.send('Lỗi: ' + err.message);
  }
});



// ✅ Trang form thêm sản phẩm mới
router.get('/perfumes/add', async (req, res) => {
  try {
    // Lấy danh sách brand để chọn
    const brands = await Brand.find();

    res.render('admin/addPerfume', {
      title: 'Add New Product',
      admin: req.session.user,
      brands
    });
  } catch (err) {
    res.send('Lỗi: ' + err.message);
  }
});

// ✅ Xử lý thêm sản phẩm mới
router.post('/perfumes/add', async (req, res) => {
  try {
    const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = req.body;

    const newPerfume = new Perfume({
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      brand
    });

    await newPerfume.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.send('Lỗi khi thêm sản phẩm: ' + err.message);
  }
});


// ✅ Trang form chỉnh sửa
router.get('/perfumes/edit/:id', async (req, res) => {
  const perfume = await Perfume.findById(req.params.id).populate('brand');

  res.render('admin/editPerfume', {
    title: 'Edit Product',
    admin: req.session.user,
    perfume,
  });
});

// ✅ Xử lý lưu chỉnh sửa
router.post('/perfumes/edit/:id', async (req, res) => {
  await Perfume.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/admin/dashboard');
});

// ✅ Xóa sản phẩm (Perfume)
router.post('/perfumes/delete/:id', requireAdminSession, async (req, res) => {
  try {
    const perfumeId = req.params.id;
    await Perfume.findByIdAndDelete(perfumeId);
    res.redirect('/admin/dashboard'); // Hoặc trả JSON nếu dùng API
  } catch (err) {
    res.send('Lỗi khi xóa sản phẩm: ' + err.message);
  }
});


// 📌 Trang liệt kê Brands (UI Admin)
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();

    // ✅ Thống kê các số liệu
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const membersCount = await Member.countDocuments();

    res.render('admin/brands', {
      title: 'Brand List',
      admin: req.session.user,
      user: req.session.user,
      brands,
      perfumesCount,
      brandsCount,
      membersCount,
        successMessage: req.flash('success'),
  errorMessage: req.flash('error')
    });
  } catch (err) {
    res.send('Lỗi: ' + err.message);
  }
});

// Trang form thêm Brand mới
router.get('/brands/add', (req, res) => {
  res.render('admin/addBrand', {
    title: 'Add New Brand',
    admin: req.session.user
  });
});

// Xử lý thêm Brand mới
router.post('/brands/add', async (req, res) => {
  try {
    const { brandName } = req.body;

    const newBrand = new Brand({ brandName });
    await newBrand.save();

    res.redirect('/admin/brands');
  } catch (err) {
    res.send('Lỗi khi thêm brand: ' + err.message);
  }
});

// Trang form chỉnh sửa Brand
router.get('/brands/edit/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.redirect('/admin/brands');
    }

    res.render('admin/editBrand', {
      title: 'Edit Brand',
      admin: req.session.user,
      brand
    });
  } catch (err) {
    res.send('Lỗi: ' + err.message);
  }
});

// Xử lý lưu chỉnh sửa Brand
router.post('/brands/edit/:id', async (req, res) => {
  try {
    const { brandName } = req.body;
    await Brand.findByIdAndUpdate(req.params.id, { brandName });
    res.redirect('/admin/brands');
  } catch (err) {
    res.send('Lỗi khi cập nhật brand: ' + err.message);
  }
});


// 📌 Trang liệt kê Users (Admin xem tất cả thành viên)
router.get('/members', requireAdminSession, async (req, res) => {
  try {
    // ✅ Thành viên đang hoạt động (chưa xoá mềm)
    const members = await Member.find({ isDeleted: false }).select('-password');

    // ✅ Thành viên đã xoá mềm
    const deletedMembers = await Member.find({ isDeleted: true }).select('-password');

    // ✅ Thống kê
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const membersCount = await Member.countDocuments();

    res.render('admin/members', {
      title: 'Member List',
      admin: req.session.user,
      members,
      deletedMembers, // ✅ THÊM DÒNG NÀY
      perfumesCount,
      brandsCount,
      membersCount,
  successMessage: req.flash('success'),
  errorMessage: req.flash('error')
    });

  } catch (err) {
    res.send('Lỗi khi lấy danh sách thành viên: ' + err.message);
  }
});



// ✅ Xóa mềm Member (Ban user)
router.post('/members/delete/:id', requireAdminSession, async (req, res) => {
  try {
    const reason = req.body.deleteReason || "Không xác định";

    await Member.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deleteReason: reason
    });

    req.flash('success', 'Đã khóa tài khoản và lưu lý do!');
    res.redirect('/admin/members');
  } catch (err) {
    req.flash('error', 'Lỗi khi xoá người dùng: ' + err.message);
    res.redirect('/admin/members');
  }
});

// ✅ Khôi phục Member (Unban user)
router.post('/members/restore/:id', requireAdminSession, async (req, res) => {
  try {
    await Member.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deleteReason: ''
    });

    req.flash('success', 'Tài khoản đã được khôi phục!');
    res.redirect('/admin/members');
  } catch (err) {
    req.flash('error', 'Lỗi khi khôi phục tài khoản: ' + err.message);
    res.redirect('/admin/members');
  }
});





module.exports = router;
