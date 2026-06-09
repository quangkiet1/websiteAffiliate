const nodemailer = require('nodemailer');

const SERVICE_LABELS = {
  AFFILIATE: 'Tiếp thị liên kết',
  LIVESTREAM: 'Livestream bán hàng',
  FULL_PACKAGE: 'Gói bao trọn Affiliate & Livestream'
};

const SERVICE_PRICES = {
  AFFILIATE: '10M/tháng + 5% GMV từ kênh affiliate.',
  LIVESTREAM: '15M/tháng + 8% GMV từ phiên livestream.',
  FULL_PACKAGE: '25M/tháng + 10% GMV từ Affiliate & Livestream.'
};

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAppointmentMeta(appointment) {
  return {
    serviceName: SERVICE_LABELS[appointment.service_interest] || appointment.service_interest,
    servicePrice: SERVICE_PRICES[appointment.service_interest] || '',
    appointmentDate: formatDate(appointment.appointment_date),
    appointmentTime: formatTime(appointment.appointment_time)
  };
}

function buildCustomerConfirmationEmail(appointment) {
  const { serviceName, servicePrice, appointmentDate, appointmentTime } = getAppointmentMeta(appointment);
  const subject = `[Affiliate Live Co.] Xác nhận đã nhận lịch hẹn #${appointment.id}`;

  const text = [
    `Xin chào ${appointment.full_name},`,
    '',
    'Affiliate Live Co. đã nhận được lịch hẹn của bạn. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.',
    '',
    `Mã lịch hẹn: #${appointment.id}`,
    `Dịch vụ: ${serviceName}`,
    `Giá gói: ${servicePrice}`,
    `Ngày hẹn: ${appointmentDate}`,
    `Giờ hẹn: ${appointmentTime}`,
    'Trạng thái: Chờ xác nhận',
    '',
    'Nếu cần bổ sung thông tin trước buổi trao đổi, bạn có thể phản hồi trực tiếp email này.',
    '',
    'Affiliate Live Co.',
    'Email: hello@affiliatelive.vn',
    'Số điện thoại: 0900 123 456'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a;max-width:680px;margin:0 auto;">
      <div style="padding:24px;background:#0f2f56;color:#ffffff;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#ffffff;">Affiliate Live Co. đã nhận lịch hẹn của bạn</h2>
        <p style="margin:8px 0 0;color:#d9ecff;">Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
      </div>
      <div style="padding:22px;border:1px solid #dde5ee;border-top:0;border-radius:0 0 8px 8px;">
        <p>Xin chào <strong>${escapeHtml(appointment.full_name)}</strong>,</p>
        <p>Cảm ơn bạn đã đặt lịch trao đổi với Affiliate Live Co. Dưới đây là thông tin lịch hẹn của bạn:</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #dde5ee;margin:18px 0;">
          <tbody>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Mã lịch hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">#${escapeHtml(appointment.id)}</td></tr>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Dịch vụ</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(serviceName)}</td></tr>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Giá gói</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(servicePrice)}</td></tr>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Ngày hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointmentDate)}</td></tr>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Giờ hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointmentTime)}</td></tr>
            <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Trạng thái</td><td style="padding:10px;border:1px solid #dde5ee;">Chờ xác nhận</td></tr>
          </tbody>
        </table>
        <p>Nếu cần bổ sung thông tin trước buổi trao đổi, bạn có thể phản hồi trực tiếp email này.</p>
        <p style="color:#526272;">Affiliate Live Co.<br>hello@affiliatelive.vn<br>0900 123 456</p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

function buildAdminNotificationEmail(appointment) {
  const { serviceName, servicePrice, appointmentDate, appointmentTime } = getAppointmentMeta(appointment);
  const subject = `[Affiliate Live Co.] Lịch hẹn mới #${appointment.id} - ${appointment.full_name}`;

  const text = [
    'Có lịch hẹn mới từ website Affiliate Live Co.',
    '',
    `Mã lịch hẹn: #${appointment.id}`,
    `Họ tên: ${appointment.full_name}`,
    `Số điện thoại: ${appointment.phone}`,
    `Email: ${appointment.email}`,
    `Dịch vụ: ${serviceName}`,
    `Giá gói: ${servicePrice}`,
    `Ngày hẹn: ${appointmentDate}`,
    `Giờ hẹn: ${appointmentTime}`,
    `Trạng thái: ${appointment.status}`,
    '',
    'Ghi chú:',
    appointment.note || 'Không có'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a;max-width:680px;margin:0 auto;">
      <h2 style="color:#0f2f56;margin-bottom:8px;">Có lịch hẹn mới từ website</h2>
      <p style="margin-top:0;color:#526272;">Thông tin đặt lịch được gửi tự động từ Affiliate Live Co.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #dde5ee;">
        <tbody>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Mã lịch hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">#${escapeHtml(appointment.id)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Họ tên</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointment.full_name)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Số điện thoại</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointment.phone)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Email</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointment.email)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Dịch vụ</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(serviceName)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Giá gói</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(servicePrice)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Ngày hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointmentDate)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Giờ hẹn</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointmentTime)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Trạng thái</td><td style="padding:10px;border:1px solid #dde5ee;">${escapeHtml(appointment.status)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #dde5ee;background:#f8fafc;font-weight:bold;">Ghi chú</td><td style="padding:10px;border:1px solid #dde5ee;white-space:pre-line;">${escapeHtml(appointment.note || 'Không có')}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  return { subject, text, html };
}

async function sendMailSafely(transporter, options) {
  try {
    await transporter.sendMail(options);
    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      reason: error.message
    };
  }
}

async function sendAppointmentNotification(appointment) {
  if (!isSmtpConfigured()) {
    const reason = 'SMTP_USER hoặc SMTP_PASS chưa được cấu hình.';

    return {
      sent: false,
      skipped: true,
      reason,
      customer: { sent: false, skipped: true, reason },
      admin: { sent: false, skipped: true, reason }
    };
  }

  const transporter = createTransporter();
  const customerEmail = buildCustomerConfirmationEmail(appointment);
  const customer = await sendMailSafely(transporter, {
    from: process.env.SMTP_FROM || `"Affiliate Live Co." <${process.env.SMTP_USER}>`,
    to: appointment.email,
    replyTo: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
    subject: customerEmail.subject,
    text: customerEmail.text,
    html: customerEmail.html
  });

  let admin = {
    sent: false,
    skipped: true,
    reason: 'NOTIFICATION_EMAIL chưa được cấu hình.'
  };

  if (process.env.NOTIFICATION_EMAIL) {
    const adminEmail = buildAdminNotificationEmail(appointment);
    admin = await sendMailSafely(transporter, {
      from: process.env.SMTP_FROM || `"Affiliate Live Co." <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      replyTo: appointment.email,
      subject: adminEmail.subject,
      text: adminEmail.text,
      html: adminEmail.html
    });
  }

  return {
    sent: customer.sent || admin.sent,
    skipped: false,
    customer,
    admin
  };
}

module.exports = {
  sendAppointmentNotification
};
