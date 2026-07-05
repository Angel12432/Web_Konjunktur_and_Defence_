import Highcharts from 'highcharts';
import { columnChartOptions, chartColors } from '../lib/highchartsTheme.js';
import { loadCsv, publicPath } from '../lib/csv.js';
import { prepareViewportBarChart, registerViewportBarChart } from '../lib/viewportBarAnimation.js';

const DSR_COUNTRIES_PATH = publicPath('data/dsr-countries.csv');

let countriesCache = null;

function getElement(id) {
  return document.getElementById(id);
}

function parseValue(value) {
  if (!value) return 0;

  const str = String(value).trim();
  const multiplier = /b/i.test(str) ? 1 : /m/i.test(str) ? 1 / 1000 : 1;
  const numeric = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(numeric);

  return Number.isFinite(parsed) ? parsed * multiplier : 0;
}

export async function initializeDsrCountriesChart() {
  const container = getElement('dsr-countries-chart');
  if (!container) return;

  try {
    const data = countriesCache || (await loadCsv(DSR_COUNTRIES_PATH));
    if (!countriesCache && data) {
      countriesCache = data;
    }

    const countries = data
      .map((entry) => ({
        name: entry.Country || '',
        funding: parseValue(entry['DSR VC funding (2020-2025)'] || ''),
      }))
      .filter((entry) => entry.name && entry.funding > 0)
      .sort((a, b) => b.funding - a.funding);

    if (countries.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center;">Keine Daten verfügbar</p>';
      return;
    }

    const labels = countries.map((c) => c.name);
    const fundingData = countries.map((c) => c.funding);

    const options = Highcharts.merge(columnChartOptions(), {
      chart: { inverted: true, marginLeft: 120 },
      title: { text: '' },
      xAxis: {
        categories: labels,
        labels: { style: { color: chartColors.muted, fontSize: '12px' }, align: 'right' },
      },
      yAxis: {
        title: { text: 'DSR Risikokapital-Finanzierung (USD Billion)' },
      },
      plotOptions: {
        column: {
          dataLabels: { enabled: true, format: '${point.y:.1f}B' },
        },
      },
      series: [{ name: 'DSR Funding', data: fundingData, color: chartColors.accent }],
      tooltip: {
        pointFormat: '<b>${point.y:.1f}B</b>',
      },
      legend: { enabled: false },
    });

    const animatedOptions = prepareViewportBarChart('dsr-countries-chart', options, [fundingData]);
    const chart = Highcharts.chart('dsr-countries-chart', animatedOptions);
    registerViewportBarChart('dsr-countries-chart', chart);

    if (!window.dsrCountriesChartListener) {
      document.addEventListener('wkd:themechange', () => {
        if (chart) {
          chart.update(Highcharts.merge(columnChartOptions(), options), true);
        }
      });
      window.dsrCountriesChartListener = true;
    }
  } catch (error) {
    console.error('Error rendering DSR countries chart:', error);
    container.innerHTML = '<p style="padding: 20px; text-align: center; color: red;">Fehler beim Laden der Daten</p>';
  }
}