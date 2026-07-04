import Highcharts from 'highcharts';

export const chartColors = {
  background: 'rgba(0,0,0,0)',
  panel: '#0b1223',
  card: '#101a2f',
  text: '#f2f7ff',
  soft: '#d7e2f3',
  muted: '#b9c6da',
  line: 'rgba(255,255,255,0.16)',
  accent: '#8bd7ff',
  accentWarm: '#ffc56f',
  danger: '#ff667f',
  positive: '#9df6ca',
  negative: '#ff667f',
  mapLow: '#fef9c3',
  mapMidLow: '#fde68a',
  mapMid: '#f97316',
  mapHigh: '#dc2626',
  mapMax: '#7f1d1d',
};

export function baseChartOptions() {
  return {
    chart: {
      backgroundColor: chartColors.background,
      style: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
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
