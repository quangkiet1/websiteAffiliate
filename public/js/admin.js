const SERVICE_LABELS = {
  AFFILIATE: 'Ti?p th? li�n k?t',
  LIVESTREAM: 'Livestream b�n h�ng',
  FULL_PACKAGE: 'G�i bao tr?n Affiliate & Livestream'
};

const STATUS_LABELS = {
  PENDING: 'Ch? x�c nh?n',
  CONFIRMED: '�� x�c nh?n',
  COMPLETED: '�� ho�n th�nh',
  CANCELLED: '�� h?y'
};

const STATUS_BADGES = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled'
};

function showAdminMessage(type, message) {
  const messageBox = document.getElementById('adminMessage') || document.getElementById('adminLoginMessage');
  if (!messageBox) return;
  messageBox.className = `admin-message ${type} is-visible`;
  if (messageBox.id === 'adminLoginMessage') {
    messageBox.className = `form-message ${type} is-visible`;
  }
  messageBox.textContent = message;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    window.location.href = '/admin/login.html';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Kh�ng th? x? l� y�u c?u.');
  }

  return data;
}

function formatDate(value) {
  if (!value) return '';
  const text = String(value).slice(0, 10);
  const parts = text.split('-');
  if (parts.length !== 3) return text;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

function statusBadge(status) {
  return `<span class="badge ${STATUS_BADGES[status] || 'badge-pending'}">${STATUS_LABELS[status] || status}</span>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function checkAdminSession() {
  const response = await fetch('/api/auth/check');
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    window.location.href = '/admin/login.html';
    throw new Error('Unauthorized');
  }

  document.querySelectorAll('[data-admin-name]').forEach((node) => {
    node.textContent = data.admin.full_name || data.admin.email;
  });

  return data.admin;
}

function setupLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } finally {
        window.location.href = '/admin/login.html';
      }
    });
  });
}

function setupLoginPage() {
  const form = document.getElementById('adminLoginForm');
  const button = document.getElementById('adminLoginButton');
  if (!form) return;

  fetch('/api/auth/check')
    .then((response) => {
      if (response.ok) {
        window.location.href = '/admin/dashboard.html';
      }
    })
    .catch(() => {});

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelectorAll('[data-error-for]').forEach((node) => {
      node.textContent = '';
    });

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email) {
      document.querySelector('[data-error-for="email"]').textContent = 'Vui l�ng nh?p email.';
      return;
    }

    if (!password) {
      document.querySelector('[data-error-for="password"]').textContent = 'Vui l�ng nh?p m?t kh?u.';
      return;
    }

    button.disabled = true;
    button.textContent = '�ang dang nh?p...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showAdminMessage('error', data.message || 'Kh�ng th? dang nh?p.');
        return;
      }

      window.location.href = '/admin/dashboard.html';
    } catch (error) {
      showAdminMessage('error', 'Kh�ng th? k?t n?i m�y ch?.');
    } finally {
      button.disabled = false;
      button.textContent = '�ang nh?p';
    }
  });
}

async function setupDashboardPage() {
  await checkAdminSession();
  setupLogout();

  try {
    const data = await apiRequest('/api/admin/dashboard');
    Object.entries(data).forEach(([key, value]) => {
      const node = document.getElementById(key);
      if (node) node.textContent = value;
    });
  } catch (error) {
    showAdminMessage('error', error.message);
  }
}

function getFilterParams(page) {
  const form = document.getElementById('appointmentFilterForm');
  const formData = new FormData(form);
  const params = new URLSearchParams();

  ['search', 'service', 'status', 'date'].forEach((key) => {
    const value = String(formData.get(key) || '').trim();
    if (value) params.set(key, value);
  });

  params.set('page', String(page));
  params.set('per_page', '10');
  return params;
}

function renderAppointments(rows) {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="9">Kh�ng c� l?ch h?n ph� h?p.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((item) => `
    <tr>
      <td>#${item.id}</td>
      <td><strong>${escapeHtml(item.full_name)}</strong></td>
      <td>${escapeHtml(item.phone)}</td>
      <td>${escapeHtml(item.email)}</td>
      <td>${SERVICE_LABELS[item.service_interest] || item.service_interest}</td>
      <td>${formatDate(item.appointment_date)}</td>
      <td>${formatTime(item.appointment_time)}</td>
      <td>${statusBadge(item.status)}</td>
      <td><a class="btn btn-outline" href="appointment-detail.html?id=${item.id}">Xem chi ti?t</a></td>
    </tr>
  `).join('');
}

async function setupAppointmentsPage() {
  await checkAdminSession();
  setupLogout();

  const form = document.getElementById('appointmentFilterForm');
  const resetButton = document.getElementById('resetFilters');
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  let currentPage = 1;
  let totalPages = 1;

  async function loadAppointments() {
    try {
      const tbody = document.getElementById('appointmentsTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="9">�ang t?i d? li?u...</td></tr>';

      const data = await apiRequest(`/api/admin/appointments?${getFilterParams(currentPage).toString()}`);
      renderAppointments(data.appointments);
      totalPages = data.pagination.totalPages;
      currentPage = data.pagination.page;
      pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
      prevButton.disabled = currentPage <= 1;
      nextButton.disabled = currentPage >= totalPages;
    } catch (error) {
      showAdminMessage('error', error.message);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    currentPage = 1;
    loadAppointments();
  });

  resetButton.addEventListener('click', () => {
    window.setTimeout(() => {
      currentPage = 1;
      loadAppointments();
    }, 0);
  });

  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      loadAppointments();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      loadAppointments();
    }
  });

  loadAppointments();
}

function setDetail(name, value) {
  const node = document.querySelector(`[data-detail="${name}"]`);
  if (!node) return;

  if (name === 'status') {
    node.innerHTML = statusBadge(value);
    return;
  }

  node.textContent = value || 'Kh�ng c�';
}

async function setupAppointmentDetailPage() {
  await checkAdminSession();
  setupLogout();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const statusSelect = document.getElementById('detailStatus');
  const noteInput = document.getElementById('adminNote');
  const saveStatus = document.getElementById('saveStatus');
  const saveNote = document.getElementById('saveNote');
  const deleteButton = document.getElementById('deleteAppointment');

  if (!id) {
    showAdminMessage('error', 'Thi?u m� l?ch h?n.');
    return;
  }

  async function loadDetail() {
    try {
      const data = await apiRequest(`/api/admin/appointments/${id}`);
      const item = data.appointment;

      setDetail('full_name', item.full_name);
      setDetail('phone', item.phone);
      setDetail('email', item.email);
      setDetail('service_interest', SERVICE_LABELS[item.service_interest] || item.service_interest);
      setDetail('appointment_date', formatDate(item.appointment_date));
      setDetail('appointment_time', formatTime(item.appointment_time));
      setDetail('status', item.status);
      setDetail('created_at', formatDateTime(item.created_at));
      setDetail('note', item.note);

      statusSelect.value = item.status;
      noteInput.value = item.admin_note || '';
    } catch (error) {
      showAdminMessage('error', error.message);
    }
  }

  saveStatus.addEventListener('click', async () => {
    saveStatus.disabled = true;
    try {
      await apiRequest(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusSelect.value })
      });
      showAdminMessage('success', '�� luu tr?ng th�i l?ch h?n.');
      loadDetail();
    } catch (error) {
      showAdminMessage('error', error.message);
    } finally {
      saveStatus.disabled = false;
    }
  });

  saveNote.addEventListener('click', async () => {
    saveNote.disabled = true;
    try {
      await apiRequest(`/api/admin/appointments/${id}/note`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_note: noteInput.value })
      });
      showAdminMessage('success', '�� luu ghi ch� n?i b?.');
      loadDetail();
    } catch (error) {
      showAdminMessage('error', error.message);
    } finally {
      saveNote.disabled = false;
    }
  });

  deleteButton.addEventListener('click', async () => {
    const confirmed = window.confirm('B?n ch?c ch?n mu?n x�a l?ch h?n n�y?');
    if (!confirmed) return;

    deleteButton.disabled = true;
    try {
      await apiRequest(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      window.location.href = '/admin/appointments.html';
    } catch (error) {
      showAdminMessage('error', error.message);
      deleteButton.disabled = false;
    }
  });

  loadDetail();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.adminPage;

  if (page === 'login') setupLoginPage();
  if (page === 'dashboard') setupDashboardPage();
  if (page === 'appointments') setupAppointmentsPage();
  if (page === 'appointment-detail') setupAppointmentDetailPage();
});

