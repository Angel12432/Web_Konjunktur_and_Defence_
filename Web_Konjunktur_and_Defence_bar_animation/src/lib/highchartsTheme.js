import Highcharts from 'highcharts';

const FALLBACK_COLORS = {
  background: 'rgba(0,0,0,0)',
  panel: '#101826',
  card: '#162033',
  text: '#f4f7fb',
  soft: '#dce5f2',
  muted: '#aebad0',
  line: 'rgba(255,255,255,0.16)',
  accent: '#7fb6d8',
  accentWarm: '#d9a441',
  danger: '#df5f63',
  positive: '#63b98a',
  negative: '#df5f63',
  mapLow: '#f9e7a8',
  mapMidLow: '#e9bd55',
  mapMid: '#c97828',
  mapHigh: '#b94c3d',
  mapMax: '#67212a',
};

const CSS_COLOR_MAP = {
  background: '--chart-background',
  panel: '--color-panel',
  card: '--color-surface',
  text: '--color-text',
  soft: '--color-soft',
  muted: '--color-muted',
  line: '--color-line',
  accent: '--color-accent',
  accentWarm: '--color-accent-warm',
  danger: '--color-danger',
  positive: '--color-positive',
  negative: '--color-negative',
  mapLow: '--map-low',
  mapMidLow: '--map-mid-low',
  mapMid: '--map-mid',
  mapHigh: '--map-high',
  mapMax: '--map-max',
};

function readCssVariable(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export const chartColors = new Proxy(FALLBACK_COLORS, {
  get(target, property) {
    const key = String(property);
    const cssVariable = CSS_COLOR_MAP[key];
    if (!cssVariable) return target[key];
    return readCssVariable(cssVariable, target[key]);
  },
});

export function getChartFontStack() {
  return readCssVariable('--font-sans', 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
}

export function baseChartOptions() {
  return {
    chart: {
      backgroundColor: chartColors.background,
      style: { fontFamily: getChartFontStack() },
      spacing: [18, 18, 18, 18],
    },
    title: {
      style: {
        color: chartColors.accent,
        fontSize: '16px',
        fontWeight: 800,
        textOutline: 'none',
      },
    },
    subtitle: {
      style: { color: chartColors.muted, fontSize: '11px' },
    },
    xAxis: {
      labels: { style: { color: chartColors.muted } },
      lineColor: chartColors.line,
      tickColor: chartColors.line,
    },
    yAxis: {
      labels: { style: { color: chartColors.muted } },
      title: { style: { color: chartColors.muted } },
      gridLineColor: chartColors.line,
      lineColor: chartColors.line,
      tickColor: chartColors.line,
    },
    legend: {
      itemStyle: { color: chartColors.text },
      itemHoverStyle: { color: chartColors.accentWarm },
      title: { style: { color: chartColors.muted } },
    },
    tooltip: {
      backgroundColor: chartColors.card,
      borderColor: chartColors.line,
      borderRadius: 10,
      shadow: false,
      style: { color: chartColors.text, fontSize: '12px' },
    },
    credits: { enabled: false },
    accessibility: { enabled: false },
  };
}

export function columnChartOptions() {
  return Highcharts.merge(baseChartOptions(), {
    chart: { type: 'column' },
    legend: { enabled: false },
    plotOptions: {
      column: {
        borderWidth: 0,
        borderRadius: 5,
        states: { hover: { brightness: 0.08 } },
        dataLabels: {
          style: {
            color: chartColors.text,
            fontWeight: 800,
            textOutline: 'none',
          },
        },
      },
    },
    responsive: {
      rules: [{
        condition: { maxWidth: 560 },
        chartOptions: {
          chart: { spacing: [14, 10, 14, 10] },
          title: { style: { fontSize: '14px' } },
          xAxis: { labels: { style: { fontSize: '11px' } } },
          yAxis: { labels: { style: { fontSize: '10px' } } },
        },
      }],
    },
  });
}
