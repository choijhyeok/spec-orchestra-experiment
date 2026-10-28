(() => {
  const form = document.querySelector('#search-form');
  const search = document.querySelector('#search');
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  let requestNumber = 0;

  async function loadRequests(query) {
    const currentRequest = ++requestNumber;
    results.replaceChildren();
    results.setAttribute('aria-busy', 'true');
    status.className = 'muted';
    status.textContent = 'Loading requests…';
    try {
      const response = await fetch(`/api/requests?${new URLSearchParams({q: query})}`);
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      if (currentRequest !== requestNumber) return;
      for (const request of data.requests) {
        const card = document.createElement('article');
        card.className = 'card stack';
        const title = document.createElement('h2');
        title.textContent = request.title;
        const name = document.createElement('p');
        name.className = 'muted';
        name.textContent = request.requester.name;
        const email = document.createElement('p');
        email.className = 'muted';
        email.textContent = request.requester.email;
        card.append(title, name, email);
        results.append(card);
      }
      status.textContent = data.requests.length
        ? `${data.requests.length} request${data.requests.length === 1 ? '' : 's'} found.`
        : query ? 'No requests match your search. Try another title, name or email.'
          : 'No requests yet.';
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      results.replaceChildren();
      status.className = 'error';
      status.textContent = 'Could not load requests. Please try Search again.';
    } finally {
      if (currentRequest === requestNumber) results.setAttribute('aria-busy', 'false');
    }
  }

  search.value = new URLSearchParams(location.search).get('q') || '';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = search.value;
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    loadRequests(query);
  });
  loadRequests(search.value);
})();
