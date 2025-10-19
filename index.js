// src/index.js
const path = require('path');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ IMPORT middleware
const { blockAdminFromUserPages } = require('./middlewares/auth');
const { requireAdminSession } = require('./middlewares/adminSession');

const app = express();

/* View Engine */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(expressLayouts);
app.set('layout', 'layout');

/* Middlewares */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'perfume-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

app.use(flash());
app.use(express.static(path.join(__dirname, './public')));

/* Gán biến toàn cục cho EJS */
app.use((req, res, next) => {
  res.locals.title = "Perfume Store";
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

/* Import Routes */
const brandRouter = require('./routes/brand');
const perfumeRouter = require('./routes/perfume');
const authRouter = require('./routes/auth');
const collectorRouter = require('./routes/collector');
const commentRouter = require('./routes/comment');
const memberRouter = require('./routes/member');

const ejsRoutes = require('./routes/ejsRoutes');
const profileRoute = require('./routes/profileRoute');
const adminRoutes = require('./routes/adminRoutes');

/* ✅ API Routes */
app.use('/api/brands', brandRouter);
app.use('/api/perfumes', perfumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/collectors', collectorRouter);
app.use('/api/perfumes', commentRouter);
app.use('/api/members', memberRouter);
app.use('/api/v1/auth', require('./routes/apiAuth'));

/* ✅ Chặn ADMIN vào trang người dùng (chạy TRƯỚC ejsRoutes và profileRoute) */
app.use(blockAdminFromUserPages);

/* ✅ Routes dành cho USER */
app.use('/profile', profileRoute);
app.use('/', ejsRoutes);

/* ✅ Routes dành cho ADMIN (bảo vệ bởi requireAdminSession) */
app.use('/admin', requireAdminSession, adminRoutes);

/* Start Server */
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));
