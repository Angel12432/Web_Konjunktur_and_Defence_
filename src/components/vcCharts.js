import Highcharts from 'highcharts';
import { columnChartOptions, chartColors } from '../lib/highchartsTheme.js';
import { loadCsv, publicPath, toNumber } from '../lib/csv.js';

const COUNTRY_DATA_PATH = publicPath('data/vc-country-comparison.csv');
const VERTICAL_DATA_PATH = publicPath('data/vc-vertical-comparison.csv');

let countryCache = null;
let verticalCache = null;
let listenersInstalled = false;

const FALLBACK_COUNTRY_DATA = [
  {
    Region: 'Deutschland',
    VC_Finanzierung_DefTech_seit_2019_USD_Mio: 2000.0,
    VC_Finanzierung_DefTech_seit_2024_USD_Mio: 1500.0,
    Anteil_an_gesamter_nationaler_Finanzierung_seit_2019_Prozent: 2.9,
    Anteil_an_gesamter_nationaler_Finanzierung_seit_2024_Prozent: 10.7,
  },
];

const FALLBACK_VERTICAL_DATA = [
  { Vertical: 'Fintech', '2025_VC_funding_YTD_USD_Billion': 10.6, Projected_growth_2025_vs_2024_Percent: 79 },
  { Vertical: 'Deep Tech', '2025_VC_funding_YTD_USD_Billion': 9.9, Projected_growth_2025_vs_2024_Percent: -9 },
  { Vertical: 'Health', '2025_VC_funding_YTD_USD_Billion': 8.1, Projected_growth_2025_vs_2024_Percent: 5 },
  { Vertical: 'Enterprise Software', '2025_VC_funding_YTD_USD_Billion': 6.3, Projected_growth_2025_vs_2024_Percent: -8 },
  { Vertical: 'Defense security and resilience', '2025_VC_funding_YTD_USD_Billion': 4.7, Projected_growth_2025_vs_2024_Percent: 32 },
  { Vertical: 'Energy', '2025_VC_funding_YTD_USD_Billion': 4.3, Projected_growth_2025_vs_2024_Percent: -32 },
  { Vertical: 'Transportation', '2025_VC_funding_YTD_USD_Billion': 3.2, Projected_growth_2025_vs_2024_Percent: -21 },
  { Vertical: 'Security', '2025_VC_funding_YTD_USD_Billion': 2.2, Projected_growth_2025_vs_2024_Percent: 63 },
  { Vertical: 'Defence', '2025_VC_funding_YTD_USD_Billion': 1.5, Projected_growth_2025_vs_2024_Percent: 132 },
  { Vertical: 'Marketing', '2025_VC_funding_YTD_USD_Billion': 1.4, Projected_growth_2025_vs_2024_Percent: -12 },
  { Vertical: 'Robotics', '2025_VC_funding_YTD_USD_Billion': 1.4, Projected_growth_2025_vs_2024_Percent: -8 },
  { Vertical: 'Travel', '2025_VC_funding_YTD_USD_Billion': 1.4, Projected_growth_2025_vs_2024_Percent: 54 },
  { Vertical: 'Food', '2025_VC_funding_YTD_USD_Billion': 1.2, Projected_growth_2025_vs_2024_Percent: -50 },
  { Vertical: 'Semiconductors', '2025_VC_funding_YTD_USD_Billion': 1.2, Projected_growth_2025_vs_2024_Percent: 44 },
  { Vertical: 'Media', '2025_VC_funding_YTD_USD_Billion': 0.836, Projected_growth_2025_vs_2024_Percent: 1 },
];

function getElement(id) {
  return document.getElementById(id);
}

function renderGermanyCharts(countryData) {
  const germany = countryData.find((entry) => entry.Region === 'Deutschland') ?? FALLBACK_COUNTRY_DATA[0];
  const vc2019 = toNumber(germany.VC_Finanzierung_DefTech_seit_2019_USD_Mio) ?? 0;
  const vc2024 = toNumber(germany.VC_Finanzierung_DefTech_seit_2024_USD_Mio) ?? 0;
  const share2019 = toNumber(germany.Anteil_an_gesamter_nationaler_Finanzierung_seit_2019_Prozent) ?? 0;
  const share2024 = toNumber(germany.Anteil_an_gesamter_nationaler_Finanzierung_seit_2024_Prozent) ?? 0;

  if (getElement('deutschland-funding')) {
    Highcharts.chart('deutschland-funding', Highcharts.merge(columnChartOptions(), {
      title: { text: 'VC-DefTech-Finanzierung' },
      xAxis: { categories: ['seit 2019', 'seit 2024'] },
      yAxis: { title: { text: 'USD Millionen' } },
      plotOptions: {
        column: {
          dataLabels: { enabled: true, format: '{point.y:.0f}' },
        },
      },
      series: [{ name: 'Finanzierung', data: [vc2019, vc2024], color: chartColors.accent }],
      tooltip: { pointFormat: '<b>{point.y:.0f} Mio. USD</b>' },
    }));
  }

  if (getElement('deutschland-share')) {
    Highcharts.chart('deutschland-share', Highcharts.merge(columnChartOptions(), {
      title: { text: 'Anteil nationaler Finanzierung' },
      xAxis: { categories: ['seit 2019', 'seit 2024'] },
      yAxis: { title: { text: 'Prozent (%)' } },
      plotOptions: {
        column: {
          dataLabels: { enabled: true, format: '{point.y:.1f}%' },
        },
      },
      series: [{ name: 'Anteil', data: [share2019, share2024], color: chartColors.accentWarm }],
      tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    }));
  }
}

function renderVerticalCharts(verticalData) {
  const verticals = verticalData
    .map((entry) => ({
      name: entry.Vertical,
      funding: toNumber(entry['2025_VC_funding_YTD_USD_Billion']) ?? 0,
      growth: toNumber(entry.Projected_growth_2025_vs_2024_Percent) ?? 0,
    }))
    .filter((entry) => entry.name);

  const categories = verticals.map((entry) => entry.name);

  if (getElement('funding-chart')) {
    Highcharts.chart('funding-chart', Highcharts.merge(columnChartOptions(), {
      chart: { inverted: true, marginLeft: 212 },
      title: { text: '2025 VC-Funding (USD Billion)' },
      xAxis: {
        categories,
        labels: { style: { color: chartColors.muted, fontSize: '12px' }, align: 'right' },
      },
      yAxis: { title: { text: 'USD Billion' }, tickInterval: 2 },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          dataLabels: { enabled: true, format: '{point.y:.2f}B', style: { fontSize: '11px' } },
        },
      },
      series: [{ name: '2025 Funding', data: verticals.map((entry) => entry.funding), color: chartColors.accent }],
      tooltip: {
        formatter() {
          return `${this.series.name}: <b>$${this.y.toFixed(2)}B</b>`;
        },
      },
      responsive: {
        rules: [{
          condition: { maxWidth: 640 },
          chartOptions: {
            chart: { marginLeft: 136 },
            xAxis: { labels: { style: { fontSize: '10px' } } },
            plotOptions: { column: { dataLabels: { enabled: false } } },
          },
        }],
      },
    }));
  }

  if (getElement('growth-chart')) {
    Highcharts.chart('growth-chart', Highcharts.merge(columnChartOptions(), {
      chart: { inverted: true, marginLeft: 20 },
      title: { text: 'Projected Growth 2025 vs 2024 (%)' },
      xAxis: { categories, labels: { enabled: false } },
      yAxis: {
        title: { text: 'Wachstum (%)' },
        tickInterval: 20,
        plotLines: [{ color: chartColors.line, width: 1, value: 0 }],
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          colorByPoint: true,
          dataLabels: { enabled: true, format: '{point.y}%', style: { fontSize: '11px' } },
        },
      },
      series: [{
        name: 'Wachstum',
        data: verticals.map((entry) => entry.growth),
        colors: verticals.map((entry) => (entry.growth >= 0 ? chartColors.positive : chartColors.negative)),
      }],
      tooltip: {
        formatter() {
          const prefix = this.y >= 0 ? '+' : '';
          return `${this.series.name}: <b>${prefix}${this.y}%</b>`;
        },
      },
      responsive: {
        rules: [{
          condition: { maxWidth: 640 },
          chartOptions: { plotOptions: { column: { dataLabels: { enabled: false } } } },
        }],
      },
    }));
  }
}

function renderCachedCharts() {
  if (!countryCache || !verticalCache) return;
  renderGermanyCharts(countryCache);
  renderVerticalCharts(verticalCache);
}

function installChartListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener('resize', () => {
    Highcharts.charts.filter(Boolean).forEach((chart) => chart.reflow());
  }, { passive: true });

  window.addEventListener('wkd:themechange', () => {
    renderCachedCharts();
  });
}

export async function initializeVcCharts() {
  installChartListeners();

  if (!countryCache || !verticalCache) {
    [countryCache, verticalCache] = await Promise.all([
      loadCsv(COUNTRY_DATA_PATH, { fallback: FALLBACK_COUNTRY_DATA, label: 'VC-Länderdaten' }),
      loadCsv(VERTICAL_DATA_PATH, { fallback: FALLBACK_VERTICAL_DATA, label: 'VC-Verticaldaten' }),
    ]);
  }

  renderCachedCharts();
}

export default initializeVcCharts;
