exports.requireAdminSession = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  return res.redirect('/login');
};
