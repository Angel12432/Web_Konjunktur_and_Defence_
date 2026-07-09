import Highcharts from 'highcharts';
import { columnChartOptions, chartColors } from '../lib/highchartsTheme.js';
import { loadCsv, publicPath } from '../lib/csv.js';
import observeAndLoad from '../lib/observeAndLoad.js';

const DSR_COUNTRIES_PATH = publicPath('data/dsr-countries.csv');

let countriesCache = null;

function getElement(id) {
  return document.getElementById(id);
}

const COUNTRY_TRANSLATIONS = {
  'United States': 'Vereinigte Staaten',
  'United Kingdom': 'Vereinigtes Königreich',
  Germany: 'Deutschland',
  France: 'Frankreich',
  Nordics: 'Skandinavien',
  Netherlands: 'Niederlande',
  Switzerland: 'Schweiz',
  'Southern Europe': 'Südeuropa',
  'Rest of Europe': 'Restliches Europa',
  Baltics: 'Baltische Staaten',
  'Rest of CEE': 'Restliches Mittel-/Osteuropa'

};

function translateCountryName(name) {
  const trimmed = String(name ?? '').trim();
  return COUNTRY_TRANSLATIONS[trimmed] || trimmed;
}

function parseValue(value) {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function initializeDsrCountriesChart() {
  const container = getElement('dsr-countries-chart');
  if (!container) return;
  container.classList.add('chart-animate');
  let chart = null;

  const load = async () => {
    try {
      const data = countriesCache || (await loadCsv(DSR_COUNTRIES_PATH));
      if (!countriesCache && data) countriesCache = data;

      // Determine which country names actually appear in the dataset,
      // and apply translations only for those names.
      const uniqueNames = new Set(data.map((d) => String(d.Country ?? '').trim()));
      const usedTranslations = Object.fromEntries(
        Object.entries(COUNTRY_TRANSLATIONS).filter(([k]) => uniqueNames.has(k))
      );

      const countries = data
        .map((entry) => ({
          name: (usedTranslations[String(entry.Country ?? '').trim()] || String(entry.Country ?? '').trim()),
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

      const fundingData = countries.map((c) => ({
        y: c.funding,
        name: c.name,
        custom: { shareTotal: c.shareTotal },
      }));

      const options = Highcharts.merge(columnChartOptions(), {
        chart: { inverted: true, marginLeft: 120 },
        title: { text: '' },
        xAxis: {
          categories: labels,
          title: 'Jahr',
          labels: { style: { color: chartColors.muted, fontSize: '12px' }, align: 'right' },
        },
        yAxis: { title: { text: 'DSR Risikokapital-Finanzierung (Milliarden USD)' } },
        plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y:.1f} Mrd. $' } } },
        series: [{ name: 'DSR Funding', data: fundingData, color: chartColors.accent }],
        tooltip: {
          headerFormat: '<b>{point.key}</b><br/>',
          pointFormatter() {
            const customData = this.custom || this.options.custom || {};
            const shareTotal = customData.shareTotal ?? 0;
            return `DSR-Finanzierung: <b>\$${this.y.toFixed(1)}Mrd.</b><br/>` +
                   `Anteil an Gesamtvolumen: <b>${shareTotal.toFixed(1)}%</b><br/>`;
          },
        },
        legend: { enabled: false },
      });

      chart = Highcharts.chart('dsr-countries-chart', options);

      if (!window.dsrCountriesChartListener) {
        window.addEventListener('wkd:themechange', () => {
          if (chart) chart.update(Highcharts.merge(columnChartOptions(), options), true);
        });
        window.dsrCountriesChartListener = true;
      }
    } catch (error) {
      throw error;
    }
  };

  observeAndLoad(container, load, { threshold: 0.3 });
}