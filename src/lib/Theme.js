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
