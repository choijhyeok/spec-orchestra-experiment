document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-form');
  const title = document.getElementById('title');
  const requesterName = document.getElementById('requester-name');
  const requesterEmail = document.getElementById('requester-email');
  const inputs = [title, requesterName, requesterEmail];
  const button = form.querySelector('button');
  const error = document.getElementById('form-error');
  const result = document.getElementById('create-result');
  const successMessage = document.getElementById('success-message');
  let submitting = false;

  function clearFeedback() {
    error.hidden = true;
    error.textContent = '';
    result.hidden = true;
    for (const input of inputs) input.removeAttribute('aria-invalid');
  }

  form.addEventListener('input', clearFeedback);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    clearFeedback();
    const payload = {
      title: title.value.trim(),
      requester: { name: requesterName.value.trim(), email: requesterEmail.value.trim() },
    };
    for (const [input, label, limit] of [[title, 'Title', 80], [requesterName, 'Requester name', 60]]) {
      const length = Array.from(input.value.trim()).length;
      if (length < 1 || length > limit) {
        error.textContent = `${label} must be between 1 and ${limit} characters.`;
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }

    if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(payload.requester.email)) {
      error.textContent = 'Requester email must be a valid email address, such as arin@example.test.';
      error.hidden = false;
      requesterEmail.setAttribute('aria-invalid', 'true');
      requesterEmail.focus();
      return;
    }

    submitting = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    for (const input of inputs) input.readOnly = true;
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not create the request. Please try again.');
      }
      successMessage.textContent = `Request “${data.request.title}” created successfully.`;
      result.hidden = false;
      form.reset();
    } catch (failure) {
      error.textContent = failure instanceof TypeError
        ? 'Could not reach the server. Please try again.'
        : failure.message || 'Could not create the request. Please try again.';
      error.hidden = false;
    } finally {
      submitting = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
      for (const input of inputs) input.readOnly = false;
    }
  });
});
