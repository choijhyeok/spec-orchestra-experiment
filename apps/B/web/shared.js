// Shared shell: every page provides only its task-specific main content.
(() => {
  const header = document.querySelector('[data-shell]');
  if (!header) return;
  const inner = document.createElement('div');
  inner.className = 'header-inner';
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '/requests';
  brand.textContent = 'Request Desk';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main navigation');
  [['/create', 'New request'], ['/requests', 'Requests']].forEach(([href, text]) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    if (location.pathname === href) link.setAttribute('aria-current', 'page');
    nav.append(link);
  });
  inner.append(brand, nav);
  header.append(inner);
})();
