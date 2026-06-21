(function () {
  'use strict';

  const colors = {
    accent: '#8bd7ff', accent2: '#ffc56f', danger: '#ff667f', ok: '#9df6ca', purple: '#c9b2ff', muted: '#b9c6da'
  };
  const fmt = new Intl.NumberFormat('de-DE');

  const conflicts = [
    { name: 'Ukraine', x: 675, y: 230, deaths: 74000, hot: true, show: 0 },
    { name: 'Nahost', x: 705, y: 325, deaths: 38000, hot: true, show: 0 },
    { name: 'Sudan', x: 650, y: 405, deaths: 44000, hot: true, show: 0 },
    { name: 'Sahel', x: 575, y: 385, deaths: 28000, hot: false, show: 1 },
    { name: 'Myanmar', x: 910, y: 385, deaths: 31000, hot: false, show: 1 },
    { name: 'Horn von Afrika', x: 690, y: 470, deaths: 22000, hot: false, show: 1 },
    { name: 'Kaukasus', x: 735, y: 270, deaths: 14000, hot: false, show: 1 },
    { name: 'Südchinesisches Meer', x: 995, y: 420, deaths: 18000, hot: true, show: 2 },
    { name: 'Haiti', x: 350, y: 390, deaths: 11000, hot: false, show: 2 }
  ];

  const europe = [
    { name: 'Deutschland', values: [52, 56, 63, 74, 82], color: colors.accent },
    { name: 'Polen', values: [16, 19, 25, 32, 38], color: colors.accent2 },
    { name: 'Frankreich', values: [49, 51, 55, 61, 66], color: colors.ok },
    { name: 'Italien', values: [28, 30, 34, 37, 41], color: colors.purple },
    { name: 'Schweden', values: [7, 8, 10, 13, 16], color: '#ff9fb0' }
  ];
  const years = ['2021', '2022', '2023', '2024', '2025'];
  const germany = [
    { year: '2021', value: 1.4 }, { year: '2022', value: 1.5 }, { year: '2023', value: 1.7 }, { year: '2024', value: 2.0 }, { year: '2025', value: 2.2 }
  ];
  const rhein = [
    { year: '2021', revenue: 5.7, employees: 24500 }, { year: '2022', revenue: 6.4, employees: 26800 },
    { year: '2023', revenue: 7.6, employees: 30900 }, { year: '2024', revenue: 9.2, employees: 35600 }, { year: '2025', revenue: 11.8, employees: 42100 }
  ];
  let rheinMode = 'both';

  const surveyData = {
    routes: [
      { label: 'Bereits aktiv', value: 46 },
      { label: 'Einstieg geplant', value: 31 },
      { label: 'Kein Einstieg geplant', value: 23 }
    ],
    barriers: [
      { label: 'Regulatorik & Recht', value: 4.3, suffix: '/5' },
      { label: 'Vergabe & Bürokratie', value: 4.1, suffix: '/5' },
      { label: 'Sicherheitsfreigaben', value: 3.9, suffix: '/5' },
      { label: 'Finanzierung / ESG', value: 3.6, suffix: '/5' },
      { label: 'Fachkräfte', value: 3.4, suffix: '/5' },
      { label: 'Reputation intern/extern', value: 3.1, suffix: '/5' }
    ],
    procurement: [
      { label: 'Lange Verfahren', value: 68, suffix: '%' },
      { label: 'Hohe Bürokratie', value: 61, suffix: '%' },
      { label: 'Mangelnde Transparenz', value: 49, suffix: '%' },
      { label: 'Vorteile etablierter Anbieter', value: 44, suffix: '%' }
    ],
    investment: [
      { label: 'F&E', value: 64, suffix: '%' },
      { label: 'Produktion', value: 57, suffix: '%' },
      { label: 'IT / Digitalisierung', value: 51, suffix: '%' },
      { label: 'Fachkräfte', value: 48, suffix: '%' },
      { label: 'Zertifizierung', value: 42, suffix: '%' }
    ],
    technology: [
      { label: 'KI', value: 71, suffix: '%' },
      { label: 'Cyber', value: 66, suffix: '%' },
      { label: 'Autonome Systeme', value: 58, suffix: '%' },
      { label: 'Sensorik / ISR', value: 52, suffix: '%' },
      { label: 'Satelliten', value: 37, suffix: '%' }
    ],
    regions: [
      { label: 'Deutschland', value: 79, suffix: '%' },
      { label: 'Westeuropa', value: 64, suffix: '%' },
      { label: 'Osteuropa', value: 58, suffix: '%' },
      { label: 'Nordamerika', value: 33, suffix: '%' },
      { label: 'Naher Osten', value: 26, suffix: '%' }
    ],
    policy: [
      { label: 'Schnellere Beschaffung', value: 74, suffix: '%' },
      { label: 'KMU-/Startup-Einstieg', value: 62, suffix: '%' },
      { label: 'Planbare Exportgenehmigung', value: 56, suffix: '%' },
      { label: 'EU-Harmonisierung', value: 49, suffix: '%' },
      { label: 'Sicherheitsakkreditierung', value: 45, suffix: '%' },
      { label: 'Investitionsanreize', value: 41, suffix: '%' }
    ]
  };

  function $(selector) { return document.querySelector(selector); }
  function $all(selector) { return Array.from(document.querySelectorAll(selector)); }
  function svg(tag, attrs = {}, text) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function de(value) { return String(value).replace('.', ','); }

  function renderMap(step) {
    const root = $('#conflictMap');
    if (!root) return;
    root.replaceChildren();
    const land = [
      'M80 190 C150 120 275 120 340 185 C390 235 345 330 252 348 C160 365 88 300 80 190Z',
      'M235 420 C280 365 382 370 426 438 C470 506 390 588 292 555 C225 532 198 466 235 420Z',
      'M500 170 C585 100 720 122 790 208 C850 282 805 365 696 366 C576 366 476 290 500 170Z',
      'M570 360 C630 312 738 330 790 410 C842 492 778 606 668 585 C568 566 510 430 570 360Z',
      'M760 185 C870 105 1058 120 1168 236 C1240 312 1164 438 1010 447 C890 454 758 350 760 185Z',
      'M880 505 C955 462 1060 490 1118 560 C1072 625 944 636 875 588 C846 565 846 528 880 505Z'
    ];
    land.forEach(d => root.append(svg('path', { d, class: 'land' })));
    ['M675 230 C690 270 700 300 705 325', 'M575 385 C610 390 630 395 650 405', 'M735 270 C800 315 855 350 910 385', 'M910 385 C940 398 970 410 995 420']
      .forEach(d => root.append(svg('path', { d, class: 'route' })));

    conflicts.forEach(c => {
      const g = svg('g', { class: c.show <= step ? 'visible-marker' : 'hidden-marker' });
      const r = 18 + Math.sqrt(c.deaths / 1000) * 4.1;
      g.append(svg('circle', { cx: c.x, cy: c.y, r, class: `marker-ring${c.hot ? ' hot' : ''}` }));
      g.append(svg('text', { x: c.x, y: c.y + 11, 'text-anchor': 'middle', class: 'skull' }, '☠'));
      g.append(svg('text', { x: c.x + r + 12, y: c.y - 4, class: 'map-label' }, c.name));
      g.append(svg('text', { x: c.x + r + 12, y: c.y + 20, class: 'map-value' }, `${fmt.format(c.deaths)} Opfer`));
      root.append(g);
    });

    const titles = ['Phase 1: Brennpunkte', 'Phase 2: Verdichtung', 'Phase 3: Budgetdruck'];
    const copy = [
      'Zunächst erscheinen die größten Konflikträume. Sie bilden den narrativen Einstieg: Sicherheitsrisiken wirken konkret und geografisch greifbar.',
      'Weitere Konflikte kommen hinzu. Dadurch entsteht ein Bild paralleler Krisen, das höhere Sicherheitsausgaben politisch plausibler macht.',
      'Die Konfliktkarte leitet zur Budgetfrage über: Wenn Bedrohung als dauerhaft wahrgenommen wird, steigt der Druck auf Politik, Bundeswehr und Industrie.'
    ];
    if ($('#conflictTitle')) $('#conflictTitle').textContent = titles[step];
    if ($('#conflictText')) $('#conflictText').textContent = copy[step];
    const list = $('#casualtyList');
    if (list) {
      list.innerHTML = conflicts.filter(c => c.show <= step).sort((a, b) => b.deaths - a.deaths).slice(0, 6)
        .map(c => `<div><b>${c.name}</b><span>${fmt.format(c.deaths)} Opfer</span></div>`).join('');
    }
  }

  function lineChart(container, series, max, suffix) {
    if (!container) return;
    const width = 900, height = 430, pad = 62;
    const s = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
    for (let i = 0; i <= 4; i += 1) {
      const y = height - pad - (i / 4) * (height - 2 * pad);
      s.append(svg('line', { x1: pad, y1: y, x2: width - pad, y2: y, class: 'grid' }));
      s.append(svg('text', { x: pad - 14, y: y + 5, 'text-anchor': 'end', class: 'tick' }, `${Math.round(max * i / 4 * 10) / 10}${suffix || ''}`));
    }
    s.append(svg('line', { x1: pad, y1: pad, x2: pad, y2: height - pad, class: 'axis' }));
    s.append(svg('line', { x1: pad, y1: height - pad, x2: width - pad, y2: height - pad, class: 'axis' }));
    years.forEach((year, i) => {
      const x = pad + i * (width - 2 * pad) / (years.length - 1);
      s.append(svg('text', { x, y: height - 22, 'text-anchor': 'middle', class: 'tick' }, year));
    });
    series.forEach((item, si) => {
      const points = item.values.map((v, i) => {
        const x = pad + i * (width - 2 * pad) / (item.values.length - 1);
        const y = height - pad - (v / max) * (height - 2 * pad);
        return { x, y, v };
      });
      s.append(svg('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), class: 'line', stroke: item.color }));
      points.forEach(p => {
        s.append(svg('circle', { cx: p.x, cy: p.y, r: 5.8, class: 'dot', fill: item.color }));
        s.append(svg('title', {}, `${item.name}: ${p.v}${suffix || ' Mrd. €'}`));
      });
      s.append(svg('text', { x: width - pad - 160, y: pad + si * 24, fill: item.color, class: 'legend' }, item.name));
    });
    container.replaceChildren(s);
  }

  function germanyChart() {
    const container = $('#germanyChart');
    if (!container) return;
    const width = 900, height = 390, pad = 62, max = 2.5;
    const s = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
    for (let i = 0; i <= 5; i += 1) {
      const val = i * 0.5;
      const y = height - pad - (val / max) * (height - 2 * pad);
      s.append(svg('line', { x1: pad, y1: y, x2: width - pad, y2: y, class: 'grid' }));
      s.append(svg('text', { x: pad - 14, y: y + 5, 'text-anchor': 'end', class: 'tick' }, `${de(val)}%`));
    }
    s.append(svg('line', { x1: pad, y1: pad, x2: pad, y2: height - pad, class: 'axis' }));
    s.append(svg('line', { x1: pad, y1: height - pad, x2: width - pad, y2: height - pad, class: 'axis' }));
    const natoY = height - pad - (2 / max) * (height - 2 * pad);
    s.append(svg('line', { x1: pad, y1: natoY, x2: width - pad, y2: natoY, stroke: colors.accent2, 'stroke-width': 2, 'stroke-dasharray': '10 8' }));
    s.append(svg('text', { x: pad + 10, y: natoY - 10, fill: colors.accent2, class: 'legend' }, '2%-Marke'));
    const points = germany.map((d, i) => ({
      x: pad + i * (width - 2 * pad) / (germany.length - 1),
      y: height - pad - (d.value / max) * (height - 2 * pad),
      d
    }));
    s.append(svg('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), class: 'line', stroke: colors.accent }));
    points.forEach(p => {
      s.append(svg('circle', { cx: p.x, cy: p.y, r: 6, class: 'dot', fill: colors.accent }));
      s.append(svg('text', { x: p.x, y: height - 22, 'text-anchor': 'middle', class: 'tick' }, p.d.year));
      s.append(svg('text', { x: p.x, y: p.y - 14, 'text-anchor': 'middle', class: 'value-label' }, `${de(p.d.value)}%`));
    });
    container.replaceChildren(s);
  }

  function rheinChart() {
    const container = $('#rheinChart');
    if (!container) return;
    const width = 900, height = 420, pad = 62, maxRevenue = 12, maxEmployees = 45000;
    const s = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
    for (let i = 0; i <= 4; i += 1) {
      const y = height - pad - (i / 4) * (height - 2 * pad);
      s.append(svg('line', { x1: pad, y1: y, x2: width - pad, y2: y, class: 'grid' }));
      s.append(svg('text', { x: pad - 14, y: y + 5, 'text-anchor': 'end', class: 'tick' }, `${Math.round(maxRevenue * i / 4)}`));
    }
    s.append(svg('line', { x1: pad, y1: pad, x2: pad, y2: height - pad, class: 'axis' }));
    s.append(svg('line', { x1: pad, y1: height - pad, x2: width - pad, y2: height - pad, class: 'axis' }));
    const step = (width - 2 * pad) / (rhein.length - 1), barW = 54;
    if (rheinMode !== 'employees') {
      rhein.forEach((d, i) => {
        const x = pad + i * step - barW / 2;
        const barH = (d.revenue / maxRevenue) * (height - 2 * pad);
        s.append(svg('rect', { x, y: height - pad - barH, width: barW, height: barH, rx: 10, class: 'bar' }));
        s.append(svg('text', { x: x + barW / 2, y: height - pad - barH - 10, 'text-anchor': 'middle', class: 'value-label' }, `${de(d.revenue)}`));
      });
      s.append(svg('text', { x: pad, y: 32, fill: colors.accent, class: 'legend' }, 'Umsatz in Mrd. €'));
    }
    if (rheinMode !== 'revenue') {
      const points = rhein.map((d, i) => ({ x: pad + i * step, y: height - pad - (d.employees / maxEmployees) * (height - 2 * pad), d }));
      s.append(svg('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), class: 'line', stroke: colors.accent2 }));
      points.forEach(p => s.append(svg('circle', { cx: p.x, cy: p.y, r: 6, class: 'dot', fill: colors.accent2 })));
      s.append(svg('text', { x: pad, y: 58, fill: colors.accent2, class: 'legend' }, 'Mitarbeiterzahl skaliert'));
    }
    rhein.forEach((d, i) => s.append(svg('text', { x: pad + i * step, y: height - 22, 'text-anchor': 'middle', class: 'tick' }, d.year)));
    container.replaceChildren(s);
  }

  function horizontalBarChart(container, data, options = {}) {
    if (!container) return;
    const width = options.width || 880;
    const rowH = options.rowH || 48;
    const top = options.top || 28;
    const left = options.left || 230;
    const right = options.right || 80;
    const height = top + data.length * rowH + 30;
    const max = options.max || Math.max(...data.map(d => d.value));
    const s = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
    data.forEach((d, i) => {
      const y = top + i * rowH;
      const w = Math.max(4, (d.value / max) * (width - left - right));
      s.append(svg('text', { x: left - 16, y: y + 22, 'text-anchor': 'end', class: 'bar-label' }, d.label));
      s.append(svg('rect', { x: left, y: y + 2, width: width - left - right, height: 24, rx: 12, fill: 'rgba(255,255,255,.06)' }));
      s.append(svg('rect', { x: left, y: y + 2, width: w, height: 24, rx: 12, class: `bar ${d.className || ''}` }));
      s.append(svg('text', { x: left + w + 10, y: y + 21, class: 'percent-label' }, `${de(d.value)}${d.suffix || '%'}`));
    });
    container.replaceChildren(s);
  }

  function verticalBarChart(container, data, options = {}) {
    if (!container) return;
    const width = options.width || 820, height = options.height || 330, pad = 56;
    const max = options.max || Math.max(...data.map(d => d.value));
    const s = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
    for (let i = 0; i <= 4; i += 1) {
      const y = height - pad - (i / 4) * (height - 2 * pad);
      s.append(svg('line', { x1: pad, y1: y, x2: width - pad, y2: y, class: 'grid' }));
      s.append(svg('text', { x: pad - 12, y: y + 5, 'text-anchor': 'end', class: 'tick' }, `${Math.round(max * i / 4)}%`));
    }
    const step = (width - 2 * pad) / data.length;
    const barW = Math.min(62, step * 0.58);
    data.forEach((d, i) => {
      const x = pad + i * step + (step - barW) / 2;
      const barH = (d.value / max) * (height - 2 * pad);
      const cls = i % 3 === 1 ? 'bar secondary' : (i % 3 === 2 ? 'bar tertiary' : 'bar');
      s.append(svg('rect', { x, y: height - pad - barH, width: barW, height: barH, rx: 12, class: cls }));
      s.append(svg('text', { x: x + barW / 2, y: height - pad - barH - 10, 'text-anchor': 'middle', class: 'value-label' }, `${d.value}%`));
      const label = d.label.length > 12 ? d.label.replace(' / ', '/').split(' ') : [d.label];
      label.slice(0, 2).forEach((part, line) => s.append(svg('text', { x: x + barW / 2, y: height - 30 + line * 15, 'text-anchor': 'middle', class: 'tick' }, part)));
    });
    s.append(svg('line', { x1: pad, y1: height - pad, x2: width - pad, y2: height - pad, class: 'axis' }));
    container.replaceChildren(s);
  }

  function renderSurveyCharts() {
    horizontalBarChart($('#routeChart'), surveyData.routes, { max: 50, left: 210, rowH: 58 });
    horizontalBarChart($('#barrierChart'), surveyData.barriers, { max: 5, left: 235, rowH: 45 });
    horizontalBarChart($('#procurementChart'), surveyData.procurement, { max: 75, left: 225, rowH: 48 });
    verticalBarChart($('#investmentChart'), surveyData.investment, { max: 75 });
    verticalBarChart($('#technologyChart'), surveyData.technology, { max: 80 });
    verticalBarChart($('#regionChart'), surveyData.regions, { max: 85 });
    horizontalBarChart($('#policyChart'), surveyData.policy, { max: 80, left: 255, rowH: 43 });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderMap(0);
    lineChart($('#europeChart'), europe, 90, '');
    germanyChart();
    rheinChart();
    renderSurveyCharts();

    $all('[data-step]').forEach(button => {
      button.addEventListener('click', () => {
        $all('[data-step]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        renderMap(Number(button.dataset.step || 0));
      });
    });
    $all('[data-rhein]').forEach(button => {
      button.addEventListener('click', () => {
        $all('[data-rhein]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        rheinMode = button.dataset.rhein || 'both';
        rheinChart();
      });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
      }, { threshold: 0.12 });
      $all('.reveal').forEach(el => observer.observe(el));
    } else {
      $all('.reveal').forEach(el => el.classList.add('visible'));
    }
  });
}());
