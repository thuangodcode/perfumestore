const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, YOB, gender } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email & password required' });
    const existing = await Member.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const member = new Member({ email, password: hash, name, YOB, gender });
    await member.save();
    res.status(201).json({ msg: 'Registered' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Member.findOne({ email });
    if (!user) return res.status(400).render('login', { error: 'Sai email hoặc mật khẩu', title: 'Login' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).render('login', { error: 'Sai email hoặc mật khẩu', title: 'Login' });

    // ✅ Lưu user vào session
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    };

    // ✅ Sau đó redirect về trang chủ (thay vì trả JSON)
    res.redirect('/');
  } catch (err) {
    res.status(500).render('login', { error: err.message, title: 'Login' });
  }
};

