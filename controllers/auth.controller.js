const bcrypt = require('bcrypt');
const pool = require('../db/connection');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeAdmin(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role
  };
}

async function loginAdmin(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!EMAIL_PATTERN.test(email) || !password) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu chưa hợp lệ.' });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE email = $1 AND role = 'ADMIN'
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const admin = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    req.session.admin = sanitizeAdmin(admin);

    return res.json({
      message: 'Đăng nhập thành công.',
      admin: req.session.admin
    });
  } catch (err) {
    return next(err);
  }
}

function logoutAdmin(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Không thể đăng xuất lúc này.' });
    }

    res.clearCookie('affiliate_live_sid');
    return res.json({ message: 'Đăng xuất thành công.' });
  });
}

function checkAuth(req, res) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Chưa đăng nhập.' });
  }

  return res.json({ admin: req.session.admin });
}

module.exports = {
  loginAdmin,
  logoutAdmin,
  checkAuth
};

