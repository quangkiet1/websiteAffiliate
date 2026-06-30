// ============================================================
// CONTACT.JS — Form validation & submission
// V-Grow Agency
// ============================================================

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
    if (!values.contact_name) errors.contact_name = 'Vui lòng nhập họ tên.';
    if (!values.contact_phone) errors.contact_phone = 'Vui lòng nhập số điện thoại.';
    if (!values.contact_email) {
      errors.contact_email = 'Vui lòng nhập email.';
    } else if (!CONTACT_EMAIL_PATTERN.test(values.contact_email)) {
      errors.contact_email = 'Email chưa đúng định dạng.';
    }
    if (!values.contact_message) errors.contact_message = 'Vui lòng nhập nội dung liên hệ.';

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([name, message]) => contactSetError(name, message));
      contactShowMessage('error', 'Vui lòng kiểm tra lại thông tin liên hệ.');
      return;
    }

    form.reset();
    contactShowMessage('success', 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');

    // Reset email preview
    const previewBody = document.getElementById('emailPreviewBody');
    if (previewBody) {
      previewBody.innerHTML = '<div class="ep-placeholder">✅ Email đã được gửi thành công!</div>';
    }
  });
});
