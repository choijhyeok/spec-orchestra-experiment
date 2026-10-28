const form = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const results = document.getElementById('requests');
const status = document.getElementById('status');
const error = document.getElementById('error');
const empty = document.getElementById('empty');
let latestSearch = 0;

async function loadRequests(query) {
  const searchNumber = ++latestSearch;
  results.setAttribute('aria-busy', 'true');
  results.replaceChildren();
  empty.hidden = true;
  error.hidden = true;
  status.textContent = 'Loading requests…';

  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`/api/requests?${params}`);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (searchNumber !== latestSearch) return;

    for (const request of data.requests) {
      const item = document.createElement('li');
      item.className = 'card';
      const title = document.createElement('h2');
      title.textContent = request.title;
      const name = document.createElement('p');
      name.textContent = `Requester: ${request.requester.name}`;
      const email = document.createElement('p');
      email.textContent = `Email: ${request.requester.email}`;
      item.append(title, name, email);
      results.append(item);
    }

    const count = data.requests.length;
    status.textContent = `${count} ${count === 1 ? 'request' : 'requests'}${query ? ' found' : ''}.`;
    if (count === 0) {
      document.getElementById('empty-title').textContent = query ? 'No matching requests' : 'No requests yet';
      document.getElementById('empty-description').textContent = query
        ? 'Try a different title, requester name or email, or clear Search to see all requests.'
        : 'Create a request to get started.';
      empty.hidden = false;
    }
  } catch (failure) {
    if (searchNumber !== latestSearch) return;
    status.textContent = '';
    error.textContent = 'Could not load requests. Please try Search again.';
    error.hidden = false;
  } finally {
    if (searchNumber === latestSearch) results.setAttribute('aria-busy', 'false');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value;
  const url = new URL(location.href);
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  history.replaceState(null, '', url);
  loadRequests(query);
});

searchInput.value = new URLSearchParams(location.search).get('q') || '';
loadRequests(searchInput.value);
