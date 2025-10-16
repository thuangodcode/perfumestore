const router = require('express').Router();
const { requireAdminSession } = require('../middlewares/adminSession');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const Member = require('../models/Member');

// ✅ Trang Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // ✅ Lấy danh sách sản phẩm (populate brandName)
    const perfumes = await Perfume.find().populate('brand', 'brandName');

    // ✅ Thống kê
    const perfumesCount = await Perfume.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const membersCount = await Member.countDocuments();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      admin: req.session.user,   // ✅ Thêm dòng này
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
    title: 'Chỉnh sửa sản phẩm',
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
      membersCount
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




module.exports = router;
