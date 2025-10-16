// routes/apiAuth.js
const router = require('express').Router();
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Login dành cho Postman / Mobile (trả về token)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Member.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Register cho API (nếu cần test)
router.post('/register', async (req, res) => {
  const { email, password, name, YOB, gender } = req.body;
  try {
    const existing = await Member.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email exists' });

    const hash = await bcrypt.hash(password, 10);
    await Member.create({ email, password: hash, name, YOB, gender });

    res.status(201).json({ msg: 'Registered OK' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
