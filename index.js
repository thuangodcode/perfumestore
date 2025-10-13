// src/index.js
const path = require('path');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ---------------------------
   Cấu hình view + layouts
   --------------------------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs trong thư mục views

/* ---------------------------
   Middlewares (thứ tự quan trọng)
   - parsers trước session nếu bạn cần đọc body để tạo session
   - session trước middleware gán res.locals.user
   --------------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // để nhận form POST

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'perfume-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // secure: true khi dùng HTTPS
  })
);

// static files
app.use(express.static(path.join(__dirname, './public')));

/* ---------------------------
   Globals cho EJS
   - đặt res.locals ở đây để mọi view có thể dùng
   --------------------------- */
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.successMessage = req.session.successMessage || null;
  next();
});

/* ---------------------------
   Import routes
   --------------------------- */
const brandRouter = require('./routes/brand');
const perfumeRouter = require('./routes/perfume');
const authRouter = require('./routes/auth');
const collectorRouter = require('./routes/collector');
const commentRouter = require('./routes/comment');
const memberRouter = require('./routes/member'); // API members (JSON)
const ejsRoutes = require('./routes/ejsRoutes'); // trang EJS chính
const profileRoute = require('./routes/profileRoute');

app.use((req, res, next) => {
  res.locals.title = "Perfume Store"; // tiêu đề mặc định
  res.locals.user = req.session.user || null;
  res.locals.successMessage = req.session.successMessage || null;
  next();
});


/* ---------------------------
   Mount routes (sau khi mọi middleware đã sẵn sàng)
   --------------------------- */
app.use('/api/brands', brandRouter);
app.use('/api/perfumes', perfumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/collectors', collectorRouter);
app.use('/api/perfumes', commentRouter); // comments nested under perfumes
app.use('/api/members', memberRouter);

app.use('/profile', profileRoute); // EJS profile routes (session-based)
app.use('/', ejsRoutes); // routes render trang chủ, login, register...

/* ---------------------------
   Start server
   --------------------------- */
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch((err) => console.error(err));
