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
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
        funding: parseValue(entry['DSR VC funding (2020-2025) in $B']),
        shareTotal: parseValue(entry['% of total funding (2020-2025)']),
      }))
      .filter((entry) => entry.name && entry.funding > 0)
      .sort((a, b) => b.funding - a.funding);

    if (countries.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center;">Keine Daten verfügbar</p>';
      return;
    }

    const labels = countries.map((c) => c.name);
    
    // WICHTIG: Hier packen wir die Zusatzdaten wieder in das 'custom'-Objekt für den Tooltip
    const fundingData = countries.map((c) => ({
      y: c.funding,
      name: c.name,
      custom: {
        shareTotal: c.shareTotal
      }
    }));

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
      
      // WICHTIG: Dein ausführlicher Tooltip
      tooltip: {
        headerFormat: '<b>{point.key}</b><br/>',
        pointFormatter() {
          const customData = this.custom || this.options.custom || {};
          const shareTotal = customData.shareTotal ?? 0;
          const share2025 = customData.share2025 ?? 0;
          const perCapita = customData.perCapita ?? 0;
          
          return `DSR-Finanzierung: <b>\$${this.y.toFixed(1)}B</b><br/>` +
                 `Anteil an Gesamtfinanzierung: <b>${shareTotal.toFixed(1)}%</b><br/>`
        }
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