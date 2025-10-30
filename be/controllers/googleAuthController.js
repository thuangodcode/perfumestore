const Collector = require('../models/Collector');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --------------------
// 🔑 Login with Google
// --------------------
exports.loginWithGoogle = async (req, res) => {
  const { tokenId } = req.body;
  
  if (!tokenId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token ID is required' 
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

    // Kiểm tra email đã tồn tại chưa
    let user = await Collector.findOne({ email });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = new Collector({
        email,
        name,
        googleId, // Lưu Google ID để phân biệt
        avatar: picture, // Lưu ảnh đại diện từ Google
        password: null, // Không cần password cho Google login
        authProvider: 'google', // Đánh dấu nguồn đăng ký
      });
      await user.save();
    } else {
      // Nếu user đã tồn tại, cập nhật thông tin
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login with Google successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    });

  } catch (err) {
    console.error('Google login error:', err);
    
    // Xử lý các loại lỗi cụ thể
    if (err.message.includes('Token used too late')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Google login failed. Please try again.', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};