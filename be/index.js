// be/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// ✅ Middleware cơ bản
app.use(cors({
  origin: 'http://localhost:5173', // React FE port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session (nếu vẫn cần)
app.use(session({
  secret: process.env.SESSION_SECRET || 'perfume-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(flash());

// ✅ Import routes (REST API)
const brandRouter = require('./routes/brand');
const perfumeRouter = require('./routes/perfume');
const authRouter = require('./routes/auth');
const collectorRouter = require('./routes/collector');
const commentRouter = require('./routes/comment');

// ✅ Sử dụng API routes
app.use('/api/brands', brandRouter);
app.use('/api/perfumes', perfumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/collectors', collectorRouter);
app.use('/api/comments', commentRouter);

// ✅ Route test root
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Perfume Store API is running!' });
});

// ✅ Kết nối MongoDB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log("✅ MONGO_URI =", process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
