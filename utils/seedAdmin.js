require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'admin@myteam.com';
  const exists = await Member.findOne({ email });
  if (exists) { console.log('Admin exists'); process.exit(); }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin@123', salt);
  const admin = new Member({ email, password: hash, name: 'Do Nam Trung', YOB: 1990, gender: true, isAdmin: true });
  await admin.save();
  console.log('Admin created');
  process.exit();
}

seed();
