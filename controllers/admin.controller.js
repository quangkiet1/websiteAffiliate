const pool = require('../db/connection');

const SERVICE_VALUES = ['AFFILIATE', 'LIVESTREAM', 'FULL_PACKAGE'];
const STATUS_VALUES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toNumber(value) {
  return Number(value || 0);
}

function parseId(id) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function validateDate(value) {
  return DATE_PATTERN.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

async function getDashboard(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_appointments,
        COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) AS today_appointments,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_appointments,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed_appointments,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_appointments,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_appointments
       FROM appointments`
    );

    const row = result.rows[0];

    return res.json({
      totalAppointments: toNumber(row.total_appointments),
      todayAppointments: toNumber(row.today_appointments),
      pendingAppointments: toNumber(row.pending_appointments),
      confirmedAppointments: toNumber(row.confirmed_appointments),
      completedAppointments: toNumber(row.completed_appointments),
      cancelledAppointments: toNumber(row.cancelled_appointments)
    });
  } catch (err) {
    return next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const conditions = [];
    const values = [];

    const search = String(req.query.search || '').trim();
    const service = String(req.query.service || '').trim();
    const status = String(req.query.status || '').trim();
    const date = String(req.query.date || '').trim();
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(Number.parseInt(req.query.per_page, 10) || 10, 1), 50);

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${values.length} OR phone ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }

    if (service) {
      if (!SERVICE_VALUES.includes(service)) {
        return res.status(400).json({ message: 'Dịch vụ lọc không hợp lệ.' });
      }
      values.push(service);
      conditions.push(`service_interest = $${values.length}`);
    }

    if (status) {
      if (!STATUS_VALUES.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái lọc không hợp lệ.' });
      }
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (date) {
      if (!validateDate(date)) {
        return res.status(400).json({ message: 'Ngày lọc không hợp lệ.' });
      }
      values.push(date);
      conditions.push(`appointment_date = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM appointments ${whereClause}`,
      values
    );

    values.push(perPage);
    const limitIndex = values.length;
    values.push((page - 1) * perPage);
    const offsetIndex = values.length;

    const result = await pool.query(
      `SELECT id, full_name, phone, email, service_interest, appointment_date,
        appointment_time, status, created_at, updated_at
       FROM appointments
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      values
    );

    const total = toNumber(countResult.rows[0].total);

    return res.json({
      appointments: result.rows,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.max(Math.ceil(total / perPage), 1)
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function getAppointmentById(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Mã lịch hẹn không hợp lệ.' });
    }

    const result = await pool.query(
      `SELECT id, full_name, phone, email, service_interest, appointment_date,
        appointment_time, note, admin_note, status, created_at, updated_at
       FROM appointments
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const status = String(req.body.status || '').trim();

    if (!id) {
      return res.status(400).json({ message: 'Mã lịch hẹn không hợp lệ.' });
    }

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái lịch hẹn không hợp lệ.' });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET status = $1
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }

    return res.json({
      message: 'Đã cập nhật trạng thái lịch hẹn.',
      appointment: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
}

async function updateAppointmentNote(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const adminNote = String(req.body.admin_note || '').trim();

    if (!id) {
      return res.status(400).json({ message: 'Mã lịch hẹn không hợp lệ.' });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET admin_note = $1
       WHERE id = $2
       RETURNING id, admin_note, updated_at`,
      [adminNote || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }

    return res.json({
      message: 'Đã cập nhật ghi chú nội bộ.',
      appointment: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Mã lịch hẹn không hợp lệ.' });
    }

    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }

    return res.json({ message: 'Đã xóa lịch hẹn.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDashboard,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNote,
  deleteAppointment
};

