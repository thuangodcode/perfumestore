require('dotenv').config();
const mongoose = require('mongoose');
const Collector = require('../models/Collector');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'admin@myteam.com';
  const exists = await Collector.findOne({ email });
  if (exists) { console.log('Admin exists'); process.exit(); }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin@123', salt);
  const admin = new Collector({ email, password: hash, name: 'Do Nam Trung', YOB: 1990, gender: true, isAdmin: true });
  await admin.save();
  console.log('Admin created');
  process.exit();
}

seed();
