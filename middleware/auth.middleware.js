function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập admin.' });
  }

  return next();
}

module.exports = {
  requireAdmin
};

