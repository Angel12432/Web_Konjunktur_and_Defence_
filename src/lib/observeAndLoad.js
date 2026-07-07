/**
 * observeAndLoad
 * Helper that attaches an IntersectionObserver to an element (or element id)
 * and calls the provided async `loader` when the element becomes visible.
 * After a successful load the helper sets `data-loaded="true"` on the element.
 *
 * Usage:
 *   import observeAndLoad from '../lib/observeAndLoad.js';
 *   observeAndLoad('#my-chart', async () => { await createChart(); }, { threshold: 0.3 });
 *
 * Parameters:
 * - elementOrId: DOM element or string id of the element to observe.
 * - loader: async function that performs the loading/initialization (e.g. fetch CSV + create chart).
 * - opts: optional object with settings. See defaults below.
 *
 * Options (opts) and syntax:
 * - We use JavaScript object destructuring with defaults:
 *     const { threshold = 0.3, rootMargin = '0px 0px -8% 0px' } = opts;
 *   This means if you call `observeAndLoad(el, loader)` without `opts`,
 *   `threshold` will be 0.3 and `rootMargin` will be '0px 0px -8% 0px'.
 *
 * - `threshold`: a number between 0 and 1 that indicates how much
 *    of the element must be visible before `loader` runs (0.3 = 30%).
 * - `rootMargin`: a string matching IntersectionObserver's rootMargin
 *    (e.g. '0px 0px -8% 0px'). It offsets the intersection bounding box.
 *
 * Behavior notes:
 * - If `IntersectionObserver` is not supported, the loader runs immediately.
 * - After successful load `element.dataset.loaded = 'true'` is set; CSS
 *   can target `[data-loaded="true"]` to transition to the visible state.
 */
export async function observeAndLoad(elementOrId, loader, opts = {}) {
  // Resolve element from id or passed element
  const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!element) return;

  // Avoid double-loading
  if (element.dataset.loaded === 'true') return;

  // destructure options with defaults — this is the syntax that provides default values
  const { threshold = 0.3, rootMargin = '0px 0px -8% 0px' } = opts;

  // If IntersectionObserver is unavailable, fallback to immediate load
  if (typeof IntersectionObserver === 'undefined') {
    try {
      await loader();
      element.dataset.loaded = 'true';
    } catch (err) {
      console.error('Error loading element:', err);
      element.innerHTML = `<p class="chart-empty chart-empty--error">Fehler beim Laden der Daten: ${String(err.message ?? err)}</p>`;
    }
    return;
  }

  // Create an observer that triggers loader for the first intersecting entry
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return; // ignore non-intersecting entries
      try {
        await loader();
        element.dataset.loaded = 'true';
      } catch (err) {
        console.error('Error loading element:', err);
        element.innerHTML = `<p class="chart-empty chart-empty--error">Fehler beim Laden der Daten: ${String(err.message ?? err)}</p>`;
      }
      obs.unobserve(entry.target); // stop observing after load
    });
  }, { threshold, rootMargin });

  io.observe(element);
}

export default observeAndLoad;
