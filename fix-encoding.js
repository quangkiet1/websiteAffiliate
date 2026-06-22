const fs = require('fs');
let code = fs.readFileSync('public/js/booking.js', 'utf8');

code = code.replace(/Ti\?p th\? lin k\?t|Ti\?p th\? lin k\?t/g, 'Tiếp thị liên kết');
code = code.replace(/Livestream bn hng|Livestream bn hng/g, 'Livestream bán hàng');
code = code.replace(/Gi bao tr\?n Affiliate & Livestream|Gi bao tr\?n Affiliate & Livestream/g, 'Gói bao trọn Affiliate & Livestream');

code = code.replace(/10M\/thng \+ 5% GMV t\? knh affiliate\.|10M\/thng \+ 5% GMV t\? knh affiliate\./g, '10M/tháng + 5% GMV từ kênh affiliate.');
code = code.replace(/15M\/thng \+ 8% GMV t\? phin livestream\.|15M\/thng \+ 8% GMV t\? phin livestream\./g, '15M/tháng + 8% GMV từ phiên livestream.');
code = code.replace(/25M\/thng \+ 10% GMV t\? Affiliate & Livestream\.|25M\/thng \+ 10% GMV t\? Affiliate & Livestream\./g, '25M/tháng + 10% GMV từ Affiliate & Livestream.');

code = code.replace(/Chua ch\?n ngy gi\?\.|Chua ch\?n ngy gi\?\./g, 'Chưa chọn ngày giờ.');
code = code.replace(/ ch\?n:| ch\?n:/g, 'Đã chọn:');
code = code.replace(/Chua ch\?n/g, 'Chưa chọn');

code = code.replace(/Vui lng nh\?p h\? v tn\.|Vui lng nh\?p h\? v tn\./g, 'Vui lòng nhập họ và tên.');
code = code.replace(/Vui lng nh\?p s\? di\?n tho\?i\.|Vui lng nh\?p s\? di\?n tho\?i\./g, 'Vui lòng nhập số điện thoại.');
code = code.replace(/Vui lng nh\?p email\.|Vui lng nh\?p email\./g, 'Vui lòng nhập email.');
code = code.replace(/Email chua dng d\?nh d\?ng\.|Email chua dng d\?nh d\?ng\./g, 'Email chưa đúng định dạng.');
code = code.replace(/Vui lng ch\?n d\?ch v\?\.|Vui lng ch\?n d\?ch v\?\./g, 'Vui lòng chọn dịch vụ.');
code = code.replace(/Vui lng ch\?n ngy h\?n\.|Vui lng ch\?n ngy h\?n\./g, 'Vui lòng chọn ngày hẹn.');
code = code.replace(/Vui lng ch\?n gi\? h\?n\.|Vui lng ch\?n gi\? h\?n\./g, 'Vui lòng chọn giờ hẹn.');

code = code.replace(/Ghi ch khch:|Ghi ch khch:/g, 'Ghi chú khách:');
code = code.replace(/Khch m\?i:|Khch m\?i:/g, 'Khách mời:');
code = code.replace(/Gi d\?ch v\?:|Gi d\?ch v\?:/g, 'Gói dịch vụ:');
code = code.replace(/Gi gi:|Gi gi:/g, 'Giá gói:');

code = code.replace(/Ch\? xc nh\?n|Ch\? xc nh\?n/g, 'Chờ xác nhận');
code = code.replace(/Khch m\?i -|Khch m\?i -/g, 'Khách mời -');

code = code.replace(/Vui lng ki\?m tra l\?i thng tin d\?t l\?ch\.|Vui lng ki\?m tra l\?i thng tin d\?t l\?ch\./g, 'Vui lòng kiểm tra lại thông tin đặt lịch.');
code = code.replace(/ang xc nh\?n\.\.\.|ang xc nh\?n\.\.\./g, 'Đang xác nhận...');
code = code.replace(/Khng th\? xc nh\?n l\?ch h\?n lc ny\.|Khng th\? xc nh\?n l\?ch h\?n lc ny\./g, 'Không thể xác nhận lịch hẹn lúc này.');
code = code.replace(/Khng th\? k\?t n\?i backend\. Hy ch\?y npm start v m\? dng API \? http:\/\/localhost:3000\.|Khng th\? k\?t n\?i backend\. Hy ch\?y npm start v m\? dng API \? http:\/\/localhost:3000\./g, 'Không thể kết nối backend. Hãy chạy npm start và mở đúng API ở http://localhost:3000.');

fs.writeFileSync('public/js/booking.js', code, 'utf8');
