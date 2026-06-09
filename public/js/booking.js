const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVICE_LABELS = {
  AFFILIATE: 'Ti?p th? li�n k?t',
  LIVESTREAM: 'Livestream b�n h�ng',
  FULL_PACKAGE: 'G�i bao tr?n Affiliate & Livestream'
};

const SERVICE_PRICES = {
  AFFILIATE: '10M/th�ng + 5% GMV t? k�nh affiliate.',
  LIVESTREAM: '15M/th�ng + 8% GMV t? phi�n livestream.',
  FULL_PACKAGE: '25M/th�ng + 10% GMV t? Affiliate & Livestream.'
};

const TIME_SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' }
];

const bookingState = {
  currentMonth: null,
  selectedDate: '',
  selectedTime: '',
  selectedTimeLabel: '',
  serviceInterest: 'AFFILIATE',
  lastBooking: null
};

function getApiBaseUrl() {
  const isLiveServer = ['5500', '5501'].includes(window.location.port);
  const isFilePreview = window.location.protocol === 'file:';

  if (isLiveServer || isFilePreview) {
    return 'http://localhost:3000';
  }

  // GitHub Pages or production
  const hostname = window.location.hostname;
  if (hostname.includes('github.io')) {
    return 'https://website-affiliate.onrender.com';
  }

  // If running on Render, use relative path
  if (hostname.includes('render.com')) {
    return '';
  }

  return '';
}

function getToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateValue(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

function formatAppointmentDate(dateValue) {
  if (!dateValue) return '';
  return fromDateValue(dateValue).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setError(name, message) {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) {
    error.textContent = message || '';
  }
}

function clearErrors() {
  document.querySelectorAll('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });
}

function showMessage(type, message) {
  const messageBox = document.getElementById('bookingMessage');
  if (!messageBox) return;
  messageBox.className = `form-message ${type} is-visible`;
  messageBox.textContent = message;
}

function hideMessage() {
  const messageBox = document.getElementById('bookingMessage');
  if (!messageBox) return;
  messageBox.className = 'form-message';
  messageBox.textContent = '';
}

function updateStepPills(activeStep) {
  document.querySelectorAll('[data-step-pill]').forEach((pill) => {
    pill.classList.toggle('is-active', pill.dataset.stepPill === activeStep);
    pill.classList.toggle('is-complete', ['datetime', 'details'].indexOf(pill.dataset.stepPill) < ['datetime', 'details', 'booked'].indexOf(activeStep));
  });
}

function showStep(stepName) {
  document.querySelectorAll('[data-booking-step]').forEach((step) => {
    step.classList.toggle('is-active', step.dataset.bookingStep === stepName);
  });
  updateStepPills(stepName);
  document.getElementById('appointmentShell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateSelectedSlot() {
  const slot = document.getElementById('selectedSlot');
  const continueButton = document.getElementById('continueToDetails');
  const detailsDateTime = document.getElementById('detailsDateTime');
  const detailsService = document.getElementById('detailsService');
  const detailsPrice = document.getElementById('detailsPrice');

  const hasSelection = Boolean(bookingState.selectedDate && bookingState.selectedTime);
  const selectedText = hasSelection
    ? `${formatAppointmentDate(bookingState.selectedDate)}, ${bookingState.selectedTimeLabel}`
    : 'Chua ch?n ng�y gi?.';

  if (slot) {
    slot.textContent = hasSelection ? `�� ch?n: ${selectedText}` : selectedText;
  }

  if (continueButton) {
    continueButton.disabled = !hasSelection;
  }

  if (detailsDateTime) {
    detailsDateTime.textContent = hasSelection ? selectedText : 'Chua ch?n';
  }

  if (detailsService) {
    detailsService.textContent = SERVICE_LABELS[bookingState.serviceInterest];
  }

  if (detailsPrice) {
    detailsPrice.textContent = SERVICE_PRICES[bookingState.serviceInterest];
  }
}

function renderTimeSlots() {
  const grid = document.getElementById('timeGrid');
  if (!grid) return;

  grid.innerHTML = TIME_SLOTS.map((slot) => `
    <button class="time-slot" type="button" data-time="${slot.value}" data-label="${slot.label}">
      ${slot.label}
    </button>
  `).join('');

  grid.querySelectorAll('.time-slot').forEach((button) => {
    button.addEventListener('click', () => {
      bookingState.selectedTime = button.dataset.time;
      bookingState.selectedTimeLabel = button.dataset.label;
      grid.querySelectorAll('.time-slot').forEach((item) => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      updateSelectedSlot();
    });
  });
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendarMonth');
  if (!grid || !monthLabel) return;

  const monthDate = bookingState.currentMonth;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const today = getToday();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  monthLabel.textContent = formatMonth(monthDate);

  for (let i = 0; i < startOffset; i += 1) {
    cells.push('<span class="calendar-day is-empty"></span>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const value = toDateValue(date);
    const isPast = date < today;
    const isSelected = bookingState.selectedDate === value;
    const isToday = value === toDateValue(today);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const classes = [
      'calendar-day',
      isPast ? 'is-disabled' : '',
      isSelected ? 'is-selected' : '',
      isToday ? 'is-today' : '',
      isWeekend ? 'is-weekend' : ''
    ].filter(Boolean).join(' ');

    cells.push(`
      <button class="${classes}" type="button" data-date="${value}" ${isPast ? 'disabled' : ''}>
        ${day}
      </button>
    `);
  }

  grid.innerHTML = cells.join('');

  grid.querySelectorAll('.calendar-day[data-date]').forEach((button) => {
    button.addEventListener('click', () => {
      bookingState.selectedDate = button.dataset.date;
      renderCalendar();
      updateSelectedSlot();
    });
  });
}

function setupCalendarControls() {
  const prev = document.getElementById('prevMonth');
  const next = document.getElementById('nextMonth');

  prev?.addEventListener('click', () => {
    const current = bookingState.currentMonth;
    bookingState.currentMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    renderCalendar();
  });

  next?.addEventListener('click', () => {
    const current = bookingState.currentMonth;
    bookingState.currentMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    renderCalendar();
  });
}

function validateDetails(values) {
  const errors = {};

  if (!values.full_name) errors.full_name = 'Vui l�ng nh?p h? v� t�n.';
  if (!values.phone) errors.phone = 'Vui l�ng nh?p s? di?n tho?i.';

  if (!values.email) {
    errors.email = 'Vui l�ng nh?p email.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Email chua d�ng d?nh d?ng.';
  }

  if (!bookingState.serviceInterest) errors.service_interest = 'Vui l�ng ch?n d?ch v?.';
  if (!bookingState.selectedDate) errors.appointment_date = 'Vui l�ng ch?n ng�y h?n.';
  if (!bookingState.selectedTime) errors.appointment_time = 'Vui l�ng ch?n gi? h?n.';

  return errors;
}

function buildNote(values) {
  const lines = [
    values.note ? `Ghi ch� kh�ch: ${values.note}` : '',
    values.guests ? `Kh�ch m?i: ${values.guests}` : '',
    `G�i d?ch v?: ${SERVICE_LABELS[bookingState.serviceInterest]}`,
    `Gi� g�i: ${SERVICE_PRICES[bookingState.serviceInterest]}`
  ].filter(Boolean);

  return lines.join('\n');
}

function renderConfirmation(values, appointment) {
  const summary = document.getElementById('bookingSummaryTable');
  if (!summary) return;

  const when = `${formatAppointmentDate(bookingState.selectedDate)}, ${bookingState.selectedTimeLabel}`;
  const contactDetails = [
    `${escapeHtml(values.full_name)} - ${escapeHtml(values.email)} - ${escapeHtml(values.phone)}`,
    values.guests ? `Kh�ch m?i - ${escapeHtml(values.guests)}` : ''
  ].filter(Boolean).join('<br>');

  summary.innerHTML = `
    <div class="summary-row">
      <span>When</span>
      <strong>${escapeHtml(when)}</strong>
    </div>
    <div class="summary-row">
      <span>Duration</span>
      <strong>30 minutes</strong>
    </div>
    <div class="summary-row">
      <span>Where</span>
      <strong>Online</strong>
    </div>
    <div class="summary-row">
      <span>Service</span>
      <strong>${escapeHtml(SERVICE_LABELS[bookingState.serviceInterest])}</strong>
    </div>
    <div class="summary-row">
      <span>Price</span>
      <strong>${escapeHtml(SERVICE_PRICES[bookingState.serviceInterest])}</strong>
    </div>
    <div class="summary-row">
      <span>Status</span>
      <strong>Ch? x�c nh?n</strong>
    </div>
    <div class="summary-row">
      <span>Booking ID</span>
      <strong>#${escapeHtml(appointment?.id || 'PENDING')}</strong>
    </div>
    <div class="summary-row">
      <span>Contact Details</span>
      <strong>${contactDetails}</strong>
    </div>
    <div class="summary-row">
      <span>Message</span>
      <p>Your appointment is reserved. We're here to serve � if there's anything specific you'd like us to prepare or review ahead of time, just let us know. See you soon!</p>
    </div>
  `;
}

function setupServiceSelect() {
  const select = document.getElementById('service_interest');
  if (!select) return;

  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  if (service && SERVICE_LABELS[service]) {
    bookingState.serviceInterest = service;
    select.value = service;
  }

  select.addEventListener('change', () => {
    bookingState.serviceInterest = select.value;
    updateSelectedSlot();
  });

  updateSelectedSlot();
}

function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  const submitButton = document.getElementById('bookingSubmit');
  const continueButton = document.getElementById('continueToDetails');
  const backButton = document.getElementById('backToDateTime');
  const anotherButton = document.getElementById('bookAnother');

  continueButton?.addEventListener('click', () => {
    updateSelectedSlot();
    showStep('details');
  });

  backButton?.addEventListener('click', () => {
    hideMessage();
    showStep('datetime');
  });

  anotherButton?.addEventListener('click', () => {
    window.location.href = 'booking.html';
  });

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    hideMessage();

    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    Object.keys(values).forEach((key) => {
      values[key] = String(values[key]).trim();
    });

    const errors = validateDetails(values);

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([name, message]) => setError(name, message));
      showMessage('error', 'Vui l�ng ki?m tra l?i th�ng tin d?t l?ch.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '�ang x�c nh?n...';

    const payload = {
      full_name: values.full_name,
      phone: values.phone,
      email: values.email,
      service_interest: bookingState.serviceInterest,
      appointment_date: bookingState.selectedDate,
      appointment_time: bookingState.selectedTime,
      note: buildNote(values)
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([name, message]) => setError(name, message));
        }
        showMessage('error', data.message || 'Kh�ng th? x�c nh?n l?ch h?n l�c n�y.');
        return;
      }

      bookingState.lastBooking = {
        values,
        appointment: data.appointment
      };

      renderConfirmation(values, data.appointment);
      form.reset();
      showStep('booked');
    } catch (error) {
      showMessage('error', 'Kh�ng th? k?t n?i backend. H�y ch?y npm start v� m? d�ng API ? http://localhost:3000.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Confirm Appointment';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const today = getToday();
  bookingState.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  setupServiceSelect();
  renderTimeSlots();
  renderCalendar();
  setupCalendarControls();
  setupBookingForm();
  updateSelectedSlot();
});

