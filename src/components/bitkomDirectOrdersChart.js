import Highcharts, { offset } from 'highcharts';

import { loadCsv, publicPath, toNumber } from '../lib/csv.js';
import { baseChartOptions, chartColors } from '../lib/highchartsTheme.js';
import { prepareViewportBarChart, registerViewportBarChart } from '../lib/viewportBarAnimation.js';

const BITKOM_DIRECT_ORDERS_PATH = publicPath('data/bitkom-direct-orders.csv');
const CHART_ID = 'bitkom-direct-orders-chart';

let rowsCache = null;
let chart = null;
let themeListenerInstalled = false;

function getContainer() {
  return document.getElementById(CHART_ID);
}

function normalizeRows(rows) {
  return rows
    .map((row) => ({
      response: String(row.response ?? '').trim(),
      shortLabel: String(row.short_label ?? row.response ?? '').trim(),
      percent: toNumber(row.percent),
    }))
    .filter((row) => row.response && row.shortLabel && row.percent !== null);
}

function createOptions(data) {
  const categories = data.map((row) => row.shortLabel);
  const seriesData = data.map((row) => ({
    y: row.percent,
    name: row.shortLabel,
    fullResponse: row.response,
  }));

  const options = Highcharts.merge(baseChartOptions(), {
    chart: {
      type: 'bar',
      spacing: [18, 18, 18, 18],
    },
    title: { text: '' },
    subtitle: {
      text: 'Anteil der befragten DefTech- und Dual-Use-Gründer:innen, Mehrfachnennung möglich.',
    },
    xAxis: {
      categories,
      title: { text: null },
      labels: {
        style: {
          color: chartColors.muted,
          fontSize: '12px',
          fontWeight: 700,
        },
      },
      lineWidth: 0,
      tickLength: 0,
    },
    yAxis: {
      min: 0,
      max: 40,
      tickInterval: 10,
      title: { text: 'Anteil der Befragten (%)' },
      labels: { format: '{value}%' },
    },
    plotOptions: {
      series: {
        animation: { duration: 900 },
        borderWidth: 0,
        borderRadius: 5,
        pointPadding: 0.18,
        groupPadding: 0.1,
        states: { hover: { brightness: 0.08 } },
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}%',
          inside: false,
          align: 'left',
          x: 8,
          style: {
            color: chartColors.text,
            fontWeight: 800,
            textOutline: 'none',
          },
        },
      },
    },
    series: [{
      name: 'Antwortanteil',
      data: seriesData,
      color: chartColors.danger,
    }],
    legend: { enabled: false },
    tooltip: {
      headerFormat: '',
      pointFormatter() {
        const fullResponse = this.fullResponse || this.options.fullResponse || this.name;
        return `<b>${fullResponse}</b><br/>Anteil: <b>${Highcharts.numberFormat(this.y, 0, ',', '.')} %</b>`;
      },
    },
    responsive: {
      rules: [{
        condition: { maxWidth: 680 },
        chartOptions: {
          chart: { height: 430, spacing: [12, 6, 12, 6] },
          subtitle: { style: { fontSize: '10px' } },
          xAxis: {
            labels: { style: { fontSize: '10.5px' } },
          },
          yAxis: {
            title: { text: null },
            labels: { style: { fontSize: '10px' } },
          },
          plotOptions: {
            series: {
              dataLabels: { style: { fontSize: '10.5px' } },
            },
          },
        },
      }],
    },
  });

  return { options, seriesData };
}

function renderChart(rows) {
  const container = getContainer();
  if (!container) return;

  container.classList.add('chart-animate');

  const data = normalizeRows(rows);
  if (!data.length) {
    container.innerHTML = '<p class="chart-empty">Keine Daten verfügbar.</p>';
    return;
  }

  if (chart) {
    chart.destroy();
    chart = null;
  }

  const { options, seriesData } = createOptions(data);
  const animatedOptions = prepareViewportBarChart(CHART_ID, options, [seriesData]);
  chart = Highcharts.chart(CHART_ID, animatedOptions);
  // mark as loaded so CSS transition plays
  container.dataset.loaded = 'true';
  registerViewportBarChart(CHART_ID, chart);
}

function installThemeListener() {
  if (themeListenerInstalled) return;
  themeListenerInstalled = true;

  window.addEventListener('wkd:themechange', () => {
    if (rowsCache) renderChart(rowsCache);
  });
}

export async function initializeBitkomDirectOrdersChart() {
  const container = getContainer();
  if (!container) return;

  installThemeListener();

  try {
    rowsCache ||= await loadCsv(BITKOM_DIRECT_ORDERS_PATH, { label: 'Bitkom-Direktauftragsdaten' });
    renderChart(rowsCache);
  } catch (error) {
    console.error('Fehler beim Laden des Bitkom-Direktauftragscharts:', error);
    container.innerHTML = `<p class="chart-empty chart-empty--error">Fehler beim Laden der Daten: ${String(error.message ?? error)}</p>`;
  }
}

export default initializeBitkomDirectOrdersChart;
