const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middlewares/auth');
const Member = require('../models/Member');

router.get('/', verifyToken, isAdmin, async (req, res) => {
  const members = await Member.find().select('-password');
  res.json(members);
});

module.exports = router;
