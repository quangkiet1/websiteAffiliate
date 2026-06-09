const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function contactSetError(name, message) {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) {
    error.textContent = message || '';
  }
}

function contactShowMessage(type, message) {
  const messageBox = document.getElementById('contactMessage');
  if (!messageBox) return;
  messageBox.className = `form-message ${type} is-visible`;
  messageBox.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelectorAll('[data-error-for]').forEach((node) => {
      node.textContent = '';
    });

    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    Object.keys(values).forEach((key) => {
      values[key] = String(values[key]).trim();
    });

    const errors = {};
    if (!values.contact_name) errors.contact_name = 'Vui l�ng nh?p h? t�n.';
    if (!values.contact_phone) errors.contact_phone = 'Vui l�ng nh?p s? di?n tho?i.';
    if (!values.contact_email) {
      errors.contact_email = 'Vui l�ng nh?p email.';
    } else if (!CONTACT_EMAIL_PATTERN.test(values.contact_email)) {
      errors.contact_email = 'Email chua d�ng d?nh d?ng.';
    }
    if (!values.contact_message) errors.contact_message = 'Vui l�ng nh?p n?i dung li�n h?.';

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([name, message]) => contactSetError(name, message));
      contactShowMessage('error', 'Vui l�ng ki?m tra l?i th�ng tin li�n h?.');
      return;
    }

    form.reset();
    contactShowMessage('success', 'C?m on b?n d� li�n h?. Ch�ng t�i s? ph?n h?i trong th?i gian s?m nh?t.');
  });
});


