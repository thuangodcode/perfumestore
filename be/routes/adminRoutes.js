const router = require('express').Router();
const { requireAdminSession } = require('../middlewares/adminSession');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Collector = require('../models/Collector');

// ✅ Trang Dashboard
// GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const perfumes = await Perfume.find().populate('brand', 'brandName');
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const collectorsCount = await Collector.countDocuments();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      admin: req.session.user,
      perfumes,
      perfumesCount,
      brandsCount,
      collectorsCount,
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
    req.flash('success', 'Product added successfully!'); // ✅ Thêm flash
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Error adding product: ' + err.message);
    res.redirect('/admin/dashboard');
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
  try {
    await Perfume.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', 'Product update successful!');
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Error while updating product: ' + err.message);
    res.redirect('/admin/dashboard');
  }
});

// ✅ Xóa sản phẩm (Perfume)
router.post('/perfumes/delete/:id', requireAdminSession, async (req, res) => {
  try {
    const perfumeId = req.params.id;
    await Perfume.findByIdAndDelete(perfumeId);
    req.flash('success', 'Product deleted successfully!');
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Error while deleting product: ' + err.message);
    res.redirect('/admin/dashboard');
  }
});


// 📌 Trang liệt kê Brands (UI Admin)
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();

    // ✅ Thống kê các số liệu
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const collectorsCount = await Collector.countDocuments();

    res.render('admin/brands', {
      title: 'Brand List',
      admin: req.session.user,
      user: req.session.user,
      brands,
      perfumesCount,
      brandsCount,
      collectorsCount,
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
    let { brandName } = req.body;
    brandName = brandName.trim(); // Không ép thành UPPERCASE

    // Kiểm tra trùng case-insensitive
    const existing = await Brand.findOne({ brandName }).collation({ locale: 'en', strength: 2 });
    if (existing) {
      req.flash('error', 'The brand name already exists!');
      return res.redirect('/admin/brands/add');
    }

    const newBrand = new Brand({ brandName });
    await newBrand.save();

    req.flash('success', 'Brand added successfully!');
    res.redirect('/admin/brands');
  } catch (err) {
    req.flash('error', 'Error adding brand: ' + err.message);
    res.redirect('/admin/brands/add');
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
    req.flash('success', 'Brand update successful!');
    res.redirect('/admin/brands');
  } catch (err) {
    req.flash('error', 'Error when updating brand: ' + err.message);
    res.redirect('/admin/brands');
  }
});

// 📌 Trang liệt kê Collectors (Admin xem tất cả collector)
router.get('/collectors', requireAdminSession, async (req, res) => {
  try {
    // ✅ Collector đang hoạt động (chưa xoá mềm)
    const collectors = await Collector.find({ isDeleted: false }).select('-password');

    // ✅ Collector đã xoá mềm
    const deletedCollectors = await Collector.find({ isDeleted: true }).select('-password');

    // ✅ Thống kê
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const collectorsCount = await Collector.countDocuments();

    res.render('admin/collectors', {
      title: 'Collector List',
      admin: req.session.user,
      collectors,
      deletedCollectors, 
      perfumesCount,
      brandsCount,
      collectorsCount,
      successMessage: req.flash('success'),
      errorMessage: req.flash('error')
    });

  } catch (err) {
    res.send('Error when getting collector list: ' + err.message);
  }
});

// ✅ Xóa mềm Collector (Ban user)
router.post('/collectors/delete/:id', requireAdminSession, async (req, res) => {
  try {
    const reason = req.body.deleteReason || "Không xác định";

    await Collector.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deleteReason: reason
    });

    req.flash('success', 'Account locked and reason saved!');
    res.redirect('/admin/collectors');
  } catch (err) {
    req.flash('error', 'Error while deleting collector: ' + err.message);
    res.redirect('/admin/collectors');
  }
});

// ✅ Khôi phục Collector (Unban user)
router.post('/collectors/restore/:id', requireAdminSession, async (req, res) => {
  try {
    await Collector.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deleteReason: ''
    });

    req.flash('success', 'Account has been restored!');
    res.redirect('/admin/collectors');
  } catch (err) {
    req.flash('error', 'Error while recovering collector: ' + err.message);
    res.redirect('/admin/collectors');
  }
});





module.exports = router;
