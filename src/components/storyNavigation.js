const NAV_SELECTOR = '.story-nav';
const LINK_SELECTOR = '.story-nav a[href^="#"]';

export function initializeStoryNavigation() {
  if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;

  const nav = document.querySelector(NAV_SELECTOR);
  if (!nav) return;

  const links = [...nav.querySelectorAll(LINK_SELECTOR)];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    rootMargin: '-20% 0px -58% 0px',
    threshold: [0.12, 0.24, 0.4, 0.6],
  });

  sections.forEach((section) => observer.observe(section));
}

export default initializeStoryNavigation;
