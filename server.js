require('./config/env');

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const appointmentRoutes = require('./routes/appointment.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const defaultCorsOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const configuredCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedCorsOrigins = new Set([...defaultCorsOrigins, ...configuredCorsOrigins]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedCorsOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(cors({
  origin: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'affiliate_live_sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.get('/admin', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard.html');
  }

  return res.redirect('/admin/login.html');
});

app.use('/admin', (req, res, next) => {
  if (req.path === '/login.html') {
    return next();
  }

  if (req.session && req.session.admin) {
    return next();
  }

  return res.redirect('/admin/login.html');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy tài nguyên.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Hệ thống đang gặp lỗi. Vui lòng thử lại sau.' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
