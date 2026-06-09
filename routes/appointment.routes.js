const express = require('express');
const { createAppointment } = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/', createAppointment);

module.exports = router;

