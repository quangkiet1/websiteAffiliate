const fs = require('fs');
let code = fs.readFileSync('public/js/booking.js', 'utf8');

code = code.replace(/AFFILIATE: '.+?',/, "AFFILIATE: 'Tiếp thị liên kết',");
code = code.replace(/LIVESTREAM: '.+?',/, "LIVESTREAM: 'Livestream bán hàng',");
code = code.replace(/FULL_PACKAGE: '.+?'/, "FULL_PACKAGE: 'Gói bao trọn Affiliate & Livestream'");

code = code.replace(/AFFILIATE: '10M.+?',/, "AFFILIATE: '10M/tháng + 5% GMV từ kênh affiliate.',");
code = code.replace(/LIVESTREAM: '15M.+?',/, "LIVESTREAM: '15M/tháng + 8% GMV từ phiên livestream.',");
code = code.replace(/FULL_PACKAGE: '25M.+?'/, "FULL_PACKAGE: '25M/tháng + 10% GMV từ Affiliate & Livestream.'");

code = code.replace(/: 'Chua.+?'/g, ": 'Chưa chọn ngày giờ.'");
code = code.replace(/\? `.+? ch\?n:/g, "? `Đã chọn:");
code = code.replace(/: 'Chua ch\?n'/g, ": 'Chưa chọn'");

code = code.replace(/errors\.full_name = '.+?';/, "errors.full_name = 'Vui lòng nhập họ và tên.';");
code = code.replace(/errors\.phone = '.+?';/, "errors.phone = 'Vui lòng nhập số điện thoại.';");
code = code.replace(/errors\.email = 'Vui.+?';/, "errors.email = 'Vui lòng nhập email.';");
code = code.replace(/errors\.email = 'Email.+?';/, "errors.email = 'Email chưa đúng định dạng.';");
code = code.replace(/errors\.service_interest = '.+?';/, "errors.service_interest = 'Vui lòng chọn dịch vụ.';");
code = code.replace(/errors\.appointment_date = '.+?';/, "errors.appointment_date = 'Vui lòng chọn ngày hẹn.';");
code = code.replace(/errors\.appointment_time = '.+?';/, "errors.appointment_time = 'Vui lòng chọn giờ hẹn.';");

code = code.replace(/`Ghi.+?\$\{values\.note\}`/, "`Ghi chú khách: ${values.note}`");
code = code.replace(/`Kh.+?\$\{values\.guests\}`/, "`Khách mời: ${values.guests}`");
code = code.replace(/`Gi.+?\$\{SERVICE_LABELS/, "`Gói dịch vụ: ${SERVICE_LABELS");
code = code.replace(/`Gi.+?\$\{SERVICE_PRICES/, "`Giá gói: ${SERVICE_PRICES");

code = code.replace(/<strong>Ch.+?<\/strong>/, "<strong>Chờ xác nhận</strong>");
code = code.replace(/`Kh.+?\$\{escapeHtml/, "`Khách mời - ${escapeHtml");

code = code.replace(/showMessage\('error', 'Vui.+?'\);/, "showMessage('error', 'Vui lòng kiểm tra lại thông tin đặt lịch.');");
code = code.replace(/submitButton\.textContent = '.+?';/, "submitButton.textContent = 'Đang xác nhận...';");
code = code.replace(/showMessage\('error', data\.message \|\| 'Kh.+?'\);/, "showMessage('error', data.message || 'Không thể xác nhận lịch hẹn lúc này.');");
code = code.replace(/showMessage\('error', 'Kh.+?'\);/, "showMessage('error', 'Không thể kết nối backend. Hãy chạy npm start và mở đúng API ở http://localhost:3000.');");

fs.writeFileSync('public/js/booking.js', code, 'utf8');
