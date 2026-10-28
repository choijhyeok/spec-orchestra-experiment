document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('app-header');
  if (!target) return;
  const header = document.createElement('header');
  header.className = 'site-header';
  const inner = document.createElement('div');
  inner.className = 'header-inner';
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '/requests';
  brand.textContent = 'Request Desk';
  inner.append(brand);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main navigation');
  for (const [path, label] of [['/create', 'New request'], ['/requests', 'Requests']]) {
    const link = document.createElement('a');
    link.href = path;
    link.textContent = label;
    if (location.pathname === path) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  inner.append(nav);
  header.append(inner);
  target.replaceWith(header);
});
