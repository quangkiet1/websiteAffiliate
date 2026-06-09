# Affiliate Live Co. Website

Website HTML/CSS/JavaScript thuần với backend Node.js + Express.js và PostgreSQL. Dự án có trang giới thiệu dịch vụ, form đặt lịch không cần đăng nhập, admin đăng nhập bằng session và quản lý lịch hẹn.

## Chạy dự án

1. Cài package:

```powershell
npm install
```

2. Tạo database và chạy schema:

```powershell
npm run setup-db
```

3. Cập nhật `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/affiliate_live_db
SESSION_SECRET=your_secret_key
```

4. Tạo tài khoản admin:

```powershell
$env:ADMIN_NAME="Admin"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="StrongPassword123!"
npm run create-admin
```

5. Start server:

```powershell
npm start
```

Mở website tại `http://localhost:3000` và admin tại `http://localhost:3000/admin/login.html`.

## Gửi thông tin lịch hẹn về Gmail

Website dùng SMTP Gmail qua `nodemailer`. Bạn cần bật xác minh 2 bước cho Gmail và tạo **App Password**, sau đó điền vào `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
NOTIFICATION_EMAIL=your_gmail@gmail.com
```

Khi khách đặt lịch thành công, hệ thống lưu lịch vào PostgreSQL rồi gửi email xác nhận đến chính email khách đã nhập trong form. Nếu có cấu hình `NOTIFICATION_EMAIL`, hệ thống cũng gửi thêm một email thông báo nội bộ đến địa chỉ đó.

Nếu bạn mở frontend bằng Live Server ở `http://127.0.0.1:5500`, JavaScript sẽ gọi API về `http://localhost:3000`. Vì vậy Express server vẫn phải đang chạy bằng `npm start`.

## API chính

- `POST /api/appointments`: khách hàng/nhãn hàng đặt lịch, không cần đăng nhập.
- `POST /api/auth/login`: admin đăng nhập.
- `POST /api/auth/logout`: admin đăng xuất.
- `GET /api/auth/check`: kiểm tra session admin.
- `GET /api/admin/dashboard`: thống kê lịch hẹn.
- `GET /api/admin/appointments`: danh sách lịch hẹn, hỗ trợ `search`, `service`, `status`, `date`, `page`.
- `GET /api/admin/appointments/:id`: chi tiết lịch hẹn.
- `PATCH /api/admin/appointments/:id/status`: cập nhật trạng thái.
- `PATCH /api/admin/appointments/:id/note`: cập nhật ghi chú nội bộ.
- `DELETE /api/admin/appointments/:id`: xóa lịch hẹn.
