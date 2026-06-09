require('../config/env');

const bcrypt = require('bcrypt');
const pool = require('../db/connection');

async function main() {
  const fullName = process.env.ADMIN_NAME || 'Admin';
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('Vui lòng đặt ADMIN_EMAIL và ADMIN_PASSWORD trong môi trường trước khi chạy script.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'ADMIN')
     ON CONFLICT (email)
     DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = 'ADMIN'
     RETURNING id, full_name, email, role`,
    [fullName, email, passwordHash]
  );

  console.log('Admin đã được tạo/cập nhật:', result.rows[0]);
}

main()
  .catch((err) => {
    console.error('Không thể tạo admin:', err.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
