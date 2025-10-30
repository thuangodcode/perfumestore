// routes/apiAuth.js
const router = require('express').Router();
const Collector = require('../models/Collector');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// ✅ Login dành cho Postman / Mobile (trả về token)
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await Collector.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không tồn tại' 
      });
    }

    // Kiểm tra nếu user đăng ký bằng Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ 
        success: false,
        message: 'Tài khoản này đã đăng ký bằng Google. Vui lòng đăng nhập bằng Google.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu không đúng' 
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ 
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        authProvider: user.authProvider || 'local',
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập',
      error: err.message 
    });
  }
});

// ============================================
// ✅ Register cho API (nếu cần test)
// ============================================
router.post('/register', async (req, res) => {
  const { email, password, name, YOB, gender } = req.body;
  
  try {
    const existing = await Collector.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Email đã tồn tại' 
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await Collector.create({ 
      email, 
      password: hash, 
      name, 
      YOB, 
      gender,
      authProvider: 'local'
    });

    res.status(201).json({ 
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký',
      error: err.message 
    });
  }
});

// ============================================
// 🆕 Google Login
// ============================================
router.post('/google-login', async (req, res) => {
  const { tokenId } = req.body;
  
  if (!tokenId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token ID không được cung cấp' 
    });
  }

  try {
    // Verify token với Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Kiểm tra user đã tồn tại chưa
    let user = await Collector.findOne({ email, isDeleted: false });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = new Collector({
        email,
        name,
        googleId,
        avatar: picture,
        authProvider: 'google', // ✅ Chỉ cần dòng này
        password: null,
      });
      await user.save();
      
      console.log('✅ Created new Google user:', email);
    } else {
      // User đã tồn tại, cập nhật thông tin Google nếu chưa có
      let updated = false;
      
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      
      if (!user.avatar && picture) {
        user.avatar = picture;
        updated = true;
      }
      
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        updated = true;
      }
      
      if (updated) {
        await user.save();
        console.log('✅ Updated existing user with Google info:', email);
      }
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập Google thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        YOB: user.YOB,
        gender: user.gender,
        isAdmin: user.isAdmin,
        authProvider: user.authProvider, // ✅ THÊM DÒNG NÀY
      },
    });

  } catch (err) {
    console.error('Google login error:', err);
    
    if (err.message && err.message.includes('Token used too late')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn. Vui lòng thử lại.' 
      });
    }
    
    if (err.message && err.message.includes('Invalid token')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Đăng nhập Google thất bại. Vui lòng thử lại.', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ============================================
// 🆕 Verify Token (optional, để check token còn hiệu lực không)
// ============================================
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token không được cung cấp' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Collector.findById(decoded.id).select('-password');
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'User không tồn tại' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        authProvider: user.authProvider,
      }
    });
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ hoặc đã hết hạn' 
    });
  }
});



module.exports = router;