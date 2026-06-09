const pool = require('../db/connection');
const { sendAppointmentNotification } = require('../services/email.service');

const SERVICE_VALUES = ['AFFILIATE', 'LIVESTREAM', 'FULL_PACKAGE'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isPastDate(dateValue) {
  const selected = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

function validateAppointmentInput(data) {
  const errors = {};

  const fullName = String(data.full_name || '').trim();
  const phone = String(data.phone || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const serviceInterest = String(data.service_interest || '').trim();
  const appointmentDate = String(data.appointment_date || '').trim();
  const appointmentTime = String(data.appointment_time || '').trim();
  const note = String(data.note || '').trim();

  if (!fullName) errors.full_name = 'Vui lòng nhập họ và tên.';
  if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.';
  if (!email) {
    errors.email = 'Vui lòng nhập email.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Email chưa đúng định dạng.';
  }

  if (!SERVICE_VALUES.includes(serviceInterest)) {
    errors.service_interest = 'Vui lòng chọn dịch vụ quan tâm.';
  }

  if (!appointmentDate) {
    errors.appointment_date = 'Vui lòng chọn ngày hẹn.';
  } else if (!DATE_PATTERN.test(appointmentDate) || Number.isNaN(new Date(`${appointmentDate}T00:00:00`).getTime())) {
    errors.appointment_date = 'Ngày hẹn không hợp lệ.';
  } else if (isPastDate(appointmentDate)) {
    errors.appointment_date = 'Không thể đặt lịch trong quá khứ.';
  }

  if (!appointmentTime) {
    errors.appointment_time = 'Vui lòng chọn giờ hẹn.';
  } else if (!TIME_PATTERN.test(appointmentTime)) {
    errors.appointment_time = 'Giờ hẹn không hợp lệ.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      fullName,
      phone,
      email,
      serviceInterest,
      appointmentDate,
      appointmentTime,
      note
    }
  };
}

async function createAppointment(req, res, next) {
  try {
    const validation = validateAppointmentInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Dữ liệu đặt lịch chưa hợp lệ.',
        errors: validation.errors
      });
    }

    const {
      fullName,
      phone,
      email,
      serviceInterest,
      appointmentDate,
      appointmentTime,
      note
    } = validation.values;

    const result = await pool.query(
      `INSERT INTO appointments
        (full_name, phone, email, service_interest, appointment_date, appointment_time, note, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING id, full_name, phone, email, service_interest, appointment_date, appointment_time, note, status, created_at`,
      [fullName, phone, email, serviceInterest, appointmentDate, appointmentTime, note || null]
    );

    let emailStatus = { sent: false, skipped: true };

    try {
      emailStatus = await sendAppointmentNotification(result.rows[0]);
    } catch (emailError) {
      console.error('Cannot send appointment email:', emailError.message);
      emailStatus = {
        sent: false,
        skipped: false,
        reason: 'Không thể gửi email thông báo.'
      };
    }

    return res.status(201).json({
      message: 'Cảm ơn bạn đã đặt lịch. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.',
      appointment: result.rows[0],
      emailSent: emailStatus.sent,
      customerEmailSent: Boolean(emailStatus.customer && emailStatus.customer.sent),
      adminEmailSent: Boolean(emailStatus.admin && emailStatus.admin.sent),
      emailStatus
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createAppointment,
  validateAppointmentInput
};
