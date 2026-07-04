import euroCoin from '../assets/euro-coin.png';

const DEFAULTS = {
  title: '1 Euro rein,\nnur die Hälfte wieder raus.',
  body: 'Laut Krebs und Kaczmarczyk liegt der kurzfristige Multiplikator deutscher Militärausgaben bei maximal etwa 0,5. Das heißt: Zusätzliche Rüstungsausgaben wirken ökonomisch deutlich schwächer als Investitionen in Infrastruktur, Bildung oder Betreuung.',
  kicker: 'Quelle: Krebs & Kaczmarczyk, 2025',
  coinImage: euroCoin,
  className: '',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function getMountElement(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

export function initializeMannheimerAnimation(target = '#mannheimer-animation', options = {}) {
  if (typeof document === 'undefined') return null;

  const mount = getMountElement(target);
  if (!mount) return null;

  const opts = { ...DEFAULTS, ...options };
  const section = document.createElement('section');

  section.className = `mannheimer-shell ${opts.className || ''}`.trim();
  section.style.setProperty('--mannheimer-coin-image', `url("${opts.coinImage}")`);
  section.setAttribute('aria-label', 'Euro-Split-Animation');

  section.innerHTML = `
    <div class="mannheimer-coin" role="button" tabindex="0" aria-label="Euro-Animation öffnen" aria-pressed="false">
      <div class="mannheimer-half mannheimer-half-left"></div>
      <div class="mannheimer-half mannheimer-half-right"></div>
      <div class="mannheimer-printer-slot"></div>
      <div class="mannheimer-flash"></div>
    </div>

    <div class="mannheimer-print-viewport">
      <article class="mannheimer-printed-text">
        <div class="mannheimer-kicker">${escapeHtml(opts.kicker)}</div>
        <h2 class="mannheimer-title">${escapeHtml(opts.title)}</h2>
        <p class="mannheimer-body">${escapeHtml(opts.body)}</p>
      </article>
    </div>
  `;

  mount.replaceChildren(section);

  const coin = section.querySelector('.mannheimer-coin');
  let timers = [];
  let isOpen = false;
  let busy = false;

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function open() {
    if (busy || isOpen) return;
    busy = true;
    clearTimers();

    section.classList.remove('is-closing', 'is-cutting', 'is-open');
    void section.offsetHeight;

    timers.push(window.setTimeout(() => section.classList.add('is-cutting'), 80));
    timers.push(window.setTimeout(() => {
      section.classList.add('is-open');
      isOpen = true;
      coin.setAttribute('aria-pressed', 'true');
      coin.setAttribute('aria-label', 'Euro-Animation schließen');
    }, 460));
    timers.push(window.setTimeout(() => section.classList.remove('is-cutting'), 1320));
    timers.push(window.setTimeout(() => { busy = false; }, 2550));
  }

  function close() {
    if (busy || !isOpen) return;
    busy = true;
    clearTimers();

    section.classList.add('is-closing');
    section.classList.remove('is-cutting');

    timers.push(window.setTimeout(() => {
      section.classList.remove('is-open');
      isOpen = false;
      coin.setAttribute('aria-pressed', 'false');
      coin.setAttribute('aria-label', 'Euro-Animation öffnen');
    }, 430));

    timers.push(window.setTimeout(() => {
      section.classList.remove('is-closing');
      busy = false;
    }, 1450));
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  coin.addEventListener('click', toggle);
  coin.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });

  return {
    element: section,
    open,
    close,
    toggle,
    destroy() {
      clearTimers();
      section.remove();
    },
  };
}

export default initializeMannheimerAnimation;
