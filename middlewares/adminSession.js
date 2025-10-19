exports.requireAdminSession = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Bạn cần đăng nhập admin!');
    return res.redirect('/login');
  }

  if (!req.session.user.isAdmin) {
    req.flash('error', 'Bạn không có quyền truy cập!');
    return res.redirect('/');
  }

  next();
};
