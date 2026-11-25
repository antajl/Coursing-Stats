// CoursingStats • Desktop Client Integration
export async function initDesktopIntegration() {
  const isDesktopPort = window.location.port === '4199';
  if (!isDesktopPort) return;

  // Intercept all external navigations and open them in default system browser
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.includes('127.0.0.1:4199') && !href.includes('localhost:4199')) {
        e.preventDefault();
        fetch('/api/desktop/open-external?url=' + encodeURIComponent(href)).catch(() => {});
      }
    }
  });

  // Remove PWA install button and external navbar links in desktop mode
  const pwaBtn = document.getElementById('btn-install-pwa');
  if (pwaBtn) pwaBtn.remove();

  const navLinks = document.querySelector('.nav-links');
  if (navLinks) navLinks.style.display = 'none';

  // Fix breadcrumbs so they don't navigate away
  const breadcrumbs = document.querySelector('.breadcrumbs');
  if (breadcrumbs) {
    breadcrumbs.innerHTML = '<span>РКФ Трекер</span> <span class="bc-sep">›</span> <span class="bc-current" id="bc-current-section">Заявки и состязания</span>';
  }
}
