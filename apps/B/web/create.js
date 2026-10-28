(() => {
  const form = document.querySelector('#create-form');
  const button = form.querySelector('button');
  const error = document.querySelector('#create-error');
  const success = document.querySelector('#create-success');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    error.hidden = true;
    success.hidden = true;
    button.disabled = true;
    button.textContent = 'Creating…';
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.elements.title.value,
          requester: {
            name: form.elements.requesterName.value,
            email: form.elements.requesterEmail.value,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        error.textContent = result.error || 'Could not create the request. Please try again.';
        error.hidden = false;
        error.focus();
        return;
      }
      form.reset();
      success.hidden = false;
      success.focus();
    } catch {
      error.textContent = 'Could not reach the server. Please try again.';
      error.hidden = false;
      error.focus();
    } finally {
      button.disabled = false;
      button.textContent = 'Create request';
    }
  });
})();
