(() => {
  const key = 'wkd-theme-preference';
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
      document.documentElement.dataset.themeMode = stored;
      document.documentElement.style.colorScheme = stored;
    } else {
      document.documentElement.dataset.themeMode = 'system';
      document.documentElement.style.colorScheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch {
    document.documentElement.dataset.themeMode = 'system';
  }
})();

function applyFazitActive(isActive) {
  if (typeof document === 'undefined' || !document.body) return;
  document.body.classList.toggle('fazit-active', isActive);
}

function initializeFazitObserver() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;
  const section = document.querySelector('#fazit');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    // trigger only when a very large portion of the section is visible (80%)
    applyFazitActive(entry.isIntersecting && entry.intersectionRatio > 0.7);
  }, {
    root: null,
    // require the section to be mostly in view before triggering
    rootMargin: '0px 0px 0% 0px',
    threshold: [0.7],
  });

  observer.observe(section);
}

export function initializeThemeFeatures() {
  initializeFazitObserver();
}

export default initializeThemeFeatures;
