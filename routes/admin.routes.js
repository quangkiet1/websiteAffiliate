const express = require('express');
const { requireAdmin } = require('../middleware/auth.middleware');
const {
  getDashboard,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNote,
  deleteAppointment
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.patch('/appointments/:id/note', updateAppointmentNote);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;

