const STORAGE_KEY = 'wkd-theme-preference';
const MODES = ['system', 'light', 'dark'];
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

let mediaQueryList;
let currentMode = 'system';

function getSystemTheme() {
  mediaQueryList ??= window.matchMedia(MEDIA_QUERY);
  return mediaQueryList.matches ? 'dark' : 'light';
}

function sanitizeMode(value) {
  return MODES.includes(value) ? value : 'system';
}

function getStoredMode() {
  try {
    return sanitizeMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function storeMode(mode) {
  try {
    if (mode === 'system') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in restrictive browser contexts. The switch still works for the session.
  }
}

function buttonMarkup(mode, label, iconSvg) {
  return `
    <button class="theme-switcher__button" type="button" data-theme-mode="${mode}" aria-label="${label}" aria-pressed="false" title="${label}">
      ${iconSvg}
    </button>
  `;
}

function createSwitcher() {
  const nav = document.createElement('nav');
  nav.className = 'theme-switcher';
  nav.setAttribute('aria-label', 'Farbschema auswählen');
  nav.innerHTML = `
    ${buttonMarkup('system', 'Systemeinstellung verwenden', '<span class="theme-switcher__text">Auto</span>')}
    ${buttonMarkup('light', 'Helles Farbschema verwenden', '<svg class="theme-switcher__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm0-2a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.51 4.93l1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm13.44 13.44 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM4.93 20.49l-1.42-1.42 2.12-2.12 1.42 1.42-2.12 2.12ZM18.37 7.05l-1.42-1.42 2.12-2.12 1.42 1.42-2.12 2.12Z" /></svg>')}
    ${buttonMarkup('dark', 'Dunkles Farbschema verwenden', '<svg class="theme-switcher__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 14.65A8.5 8.5 0 0 1 9.35 3a7.25 7.25 0 1 0 11.65 11.65Z" /></svg>')}
  `;
  return nav;
}

function updateButtons(root, mode) {
  root.querySelectorAll('[data-theme-mode]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeMode === mode));
  });
}

function applyTheme(mode, switcher) {
  currentMode = sanitizeMode(mode);
  const root = document.documentElement;
  const resolvedTheme = currentMode === 'system' ? getSystemTheme() : currentMode;

  if (currentMode === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = currentMode;
  }

  root.dataset.themeMode = currentMode;
  root.style.colorScheme = resolvedTheme;

  if (switcher) updateButtons(switcher, currentMode);
  window.dispatchEvent(new CustomEvent('wkd:themechange', {
    detail: { mode: currentMode, resolvedTheme },
  }));
}

export function initializeThemeToggle() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  mediaQueryList = window.matchMedia(MEDIA_QUERY);
  const switcher = createSwitcher();
  document.body.prepend(switcher);

  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme-mode]');
    if (!button) return;
    const mode = sanitizeMode(button.dataset.themeMode);
    storeMode(mode);
    applyTheme(mode, switcher);
  });

  mediaQueryList.addEventListener('change', () => {
    if (currentMode === 'system') applyTheme('system', switcher);
  });

  applyTheme(getStoredMode(), switcher);
}

export default initializeThemeToggle;
