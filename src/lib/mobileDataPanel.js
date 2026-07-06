export function setMobileDataPanel(panelId, html) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  panel.innerHTML = html;
  panel.classList.toggle('has-data', Boolean(html));
}

export function formatMobileDatum(label, value) {
  return `<span class="mobile-data-panel__item"><span>${label}</span><strong>${value}</strong></span>`;
}

export function clearMobileDataPanel(panelId) {
  setMobileDataPanel(panelId, '');
}
