import Highcharts from 'highcharts';

import { loadCsv, publicPath, toNumber } from '../lib/csv.js';
import { baseChartOptions, chartColors } from '../lib/highchartsTheme.js';

const MILITARY_SPENDING_PATH = publicPath('data/military-spending.csv');
const GERMANY_GDP_GROWTH_PATH = publicPath('data/germany-gdp-growth.csv');
const START_YEAR = 2015;
const END_YEAR = 2025;

const REGION_GROUPS = {
  top5eu: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Polen'],
  eu: ['Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Irland', 'Italien', 'Kroatien', 'Lettland', 'Litauen', 'Luxemburg', 'Malta', 'Niederlande', 'Österreich', 'Polen', 'Portugal', 'Rumänien', 'Schweden', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Ungarn', 'Zypern'],
  nato: ['Albanien', 'Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Island', 'Italien', 'Kanada', 'Lettland', 'Litauen', 'Luxemburg', 'Montenegro', 'Niederlande', 'Nordmazedonien', 'Norwegen', 'Polen', 'Portugal', 'Rumänien', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Türkei', 'Ungarn', 'Vereinigtes Königreich', 'Vereinigte Staaten'],
  europe: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Portugal', 'Niederlande', 'Belgien', 'Luxemburg', 'Österreich', 'Schweiz', 'Dänemark', 'Schweden', 'Norwegen', 'Finnland', 'Polen', 'Tschechien', 'Slowakei', 'Ungarn', 'Rumänien', 'Bulgarien', 'Griechenland', 'Kroatien', 'Serbien', 'Slowenien', 'Bosnien und Herzegowina', 'Montenegro', 'Nordmazedonien', 'Albanien', 'Irland', 'Vereinigtes Königreich', 'Island', 'Ukraine', 'Belarus', 'Litauen', 'Lettland', 'Estland', 'Moldau', 'Russland'],
  asia: ['China', 'Japan', 'Südkorea', 'Nordkorea', 'Indien', 'Pakistan', 'Bangladesch', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan', 'Iran', 'Irak', 'Türkei', 'Saudi-Arabien', 'Vereinigte Arabische Emirate', 'Katar', 'Kuwait', 'Oman', 'Israel', 'Jordanien', 'Syrien', 'Libanon', 'Indonesien', 'Malaysia', 'Thailand', 'Vietnam', 'Philippinen', 'Singapur', 'Myanmar', 'Kambodscha', 'Laos', 'Mongolei', 'Kasachstan'],
  northamerica: ['Kanada', 'Vereinigte Staaten', 'Mexiko'],
  all: [],
};

const COUNTRY_TRANSLATIONS = {
  'United States': 'Vereinigte Staaten',
  'United Kingdom': 'Vereinigtes Königreich',
  Germany: 'Deutschland',
  France: 'Frankreich',
  Italy: 'Italien',
  Spain: 'Spanien',
  Poland: 'Polen',
  Portugal: 'Portugal',
  Netherlands: 'Niederlande',
  Belgium: 'Belgien',
  Luxembourg: 'Luxemburg',
  Austria: 'Österreich',
  Switzerland: 'Schweiz',
  Denmark: 'Dänemark',
  Sweden: 'Schweden',
  Norway: 'Norwegen',
  Finland: 'Finnland',
  Czechia: 'Tschechien',
  'Czech Republic': 'Tschechien',
  Slovakia: 'Slowakei',
  Hungary: 'Ungarn',
  Romania: 'Rumänien',
  Bulgaria: 'Bulgarien',
  Greece: 'Griechenland',
  Croatia: 'Kroatien',
  Serbia: 'Serbien',
  Slovenia: 'Slowenien',
  'Bosnia and Herzegovina': 'Bosnien und Herzegowina',
  Montenegro: 'Montenegro',
  'North Macedonia': 'Nordmazedonien',
  Albania: 'Albanien',
  Ireland: 'Irland',
  Iceland: 'Island',
  Ukraine: 'Ukraine',
  Belarus: 'Belarus',
  Lithuania: 'Litauen',
  Latvia: 'Lettland',
  Estonia: 'Estland',
  Moldova: 'Moldau',
  Russia: 'Russland',
  Turkey: 'Türkei',
  Canada: 'Kanada',
  Mexico: 'Mexiko',
  China: 'China',
  Japan: 'Japan',
  'South Korea': 'Südkorea',
  'North Korea': 'Nordkorea',
  India: 'Indien',
  Pakistan: 'Pakistan',
  Bangladesh: 'Bangladesch',
  Afghanistan: 'Afghanistan',
  Iran: 'Iran',
  Iraq: 'Irak',
  Israel: 'Israel',
  'Saudi Arabia': 'Saudi-Arabien',
  'United Arab Emirates': 'Vereinigte Arabische Emirate',
  Qatar: 'Katar',
  Kuwait: 'Kuwait',
  Oman: 'Oman',
  Jordan: 'Jordanien',
  Syria: 'Syrien',
  Lebanon: 'Libanon',
  Indonesia: 'Indonesien',
  Malaysia: 'Malaysia',
  Thailand: 'Thailand',
  Vietnam: 'Vietnam',
  Philippines: 'Philippinen',
  Singapore: 'Singapur',
  Myanmar: 'Myanmar',
  Cambodia: 'Kambodscha',
  Laos: 'Laos',
  Mongolia: 'Mongolei',
  Kazakhstan: 'Kasachstan',
};

const COUNTRY_COLORS = [
  '#7fb6d8', '#d9a441', '#df5f63', '#63b98a', '#9d7be0', '#e98f55', '#58b8a8', '#c77d99', '#88a85d', '#74a2e0',
];

let spendingRowsCache = null;
let gdpRowsCache = null;
let militaryChart = null;
let macroChart = null;
let selectedRegion = 'top5eu';
let themeListenerInstalled = false;

function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();
}

function translateCountryName(name) {
  const trimmed = String(name ?? '').trim();
  return COUNTRY_TRANSLATIONS[trimmed] || trimmed;
}

function formatPercent(value, decimals = 2) {
  if (!Number.isFinite(value)) return '';
  return Highcharts.numberFormat(value, decimals, ',', '.');
}

function findMilitaryValueKey(row) {
  return Object.keys(row).find((key) => normalizeName(key).includes('militaryexpenditure') && normalizeName(key).includes('gdp'));
}

function buildMilitaryDataset(rows) {
  const countryMap = new Map();
  const years = new Set();
  const valueKey = rows[0] ? findMilitaryValueKey(rows[0]) : 'Military expenditure (% of GDP)';

  rows.forEach((row) => {
    const year = toNumber(row.Year);
    const value = toNumber(row[valueKey]);
    const country = translateCountryName(row.Entity);

    if (!country || !Number.isFinite(year) || value === null || year < START_YEAR || year > END_YEAR) return;

    years.add(String(year));
    if (!countryMap.has(country)) countryMap.set(country, new Map());
    countryMap.get(country).set(String(year), value);
  });

  const categories = [...years].sort((a, b) => Number(a) - Number(b));
  const countries = [...countryMap.keys()].sort((a, b) => normalizeName(a).localeCompare(normalizeName(b)));

  return { categories, countryMap, countries };
}

function getCountriesForRegion(region, countries) {
  if (region === 'all') return countries;
  const group = REGION_GROUPS[region] || [];
  const normalizedGroup = group.map(normalizeName);
  return countries.filter((country) => normalizedGroup.includes(normalizeName(country)));
}

function getSelectElement() {
  return document.getElementById('military-region-filter');
}

function getLegendElement() {
  return document.getElementById('military-legend');
}

function renderLegend(countries) {
  const legend = getLegendElement();
  if (!legend || !militaryChart) return;

  legend.innerHTML = '';
  const selectedCountries = getCountriesForRegion(selectedRegion, countries);

  if (selectedCountries.length === 0) {
    legend.textContent = 'Keine Daten für diese Auswahl verfügbar.';
    return;
  }

  const list = document.createElement('div');
  list.className = 'legend-items';

  selectedCountries.forEach((country) => {
    const series = militaryChart.series.find((item) => item.name === country);
    if (!series) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'legend-item';
    button.setAttribute('aria-pressed', String(series.visible));
    if (!series.visible) button.classList.add('is-disabled');

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.background = series.color;

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = country;

    button.append(swatch, label);
    button.addEventListener('click', () => {
      const nextVisible = !series.visible;
      series.setVisible(nextVisible, true);
      button.classList.toggle('is-disabled', !nextVisible);
      button.setAttribute('aria-pressed', String(nextVisible));
    });

    list.appendChild(button);
  });

  legend.appendChild(list);
}

function applyRegionVisibility(countries, redraw = true) {
  if (!militaryChart) return;
  const selectedCountries = getCountriesForRegion(selectedRegion, countries);

  militaryChart.series.forEach((series) => {
    const shouldShow = selectedCountries.includes(series.name);
    series.update({ visible: shouldShow, showInLegend: false }, false);
  });

  if (redraw) militaryChart.redraw();
  renderLegend(countries);
}

function createMilitaryChart(rows) {
  const container = document.getElementById('military-spending-chart');
  if (!container) return;

  const { categories, countryMap, countries } = buildMilitaryDataset(rows);
  if (!categories.length || !countries.length) {
    container.innerHTML = '<p class="chart-empty">Keine Daten verfügbar.</p>';
    return;
  }

  if (militaryChart) {
    militaryChart.destroy();
    militaryChart = null;
  }

  const selectedCountries = getCountriesForRegion(selectedRegion, countries);
  const series = countries.map((country, index) => ({
    name: country,
    data: categories.map((year) => countryMap.get(country)?.get(year) ?? null),
    visible: selectedCountries.includes(country),
    showInLegend: false,
    color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    marker: { enabled: false },
  }));

  militaryChart = Highcharts.chart('military-spending-chart', Highcharts.merge(baseChartOptions(), {
    chart: { type: 'spline' },
    title: { text: '' },
    subtitle: {
      text: 'Militärausgaben geteilt durch Bruttoinlandsprodukt, 2015–2025.',
    },
    xAxis: {
      categories,
      title: { text: null },
      tickmarkPlacement: 'on',
    },
    yAxis: {
      title: { text: '% des BIP' },
      min: 0,
      labels: {
        formatter() { return `${formatPercent(this.value, 1)} %`; },
      },
    },
    plotOptions: {
      series: {
        animation: { duration: 900 },
        lineWidth: 2.4,
        states: { inactive: { opacity: 0.25 } },
      },
    },
    tooltip: {
      shared: false,
      valueSuffix: ' %',
      valueDecimals: 2,
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y:.2f} %</b><br/>',
    },
    legend: { enabled: false },
    series,
    responsive: {
      rules: [{
        condition: { maxWidth: 640 },
        chartOptions: {
          chart: { spacing: [14, 8, 14, 8] },
          yAxis: { title: { text: null } },
          subtitle: { style: { fontSize: '10px' } },
        },
      }],
    },
  }));

  applyRegionVisibility(countries, false);
}

function getGermanyMilitarySeries(rows, years) {
  const valueKey = rows[0] ? findMilitaryValueKey(rows[0]) : 'Military expenditure (% of GDP)';
  const map = new Map();

  rows.forEach((row) => {
    if (translateCountryName(row.Entity) !== 'Deutschland') return;
    const year = String(toNumber(row.Year));
    const value = toNumber(row[valueKey]);
    if (year && value !== null) map.set(year, value);
  });

  return years.map((year) => map.get(String(year)) ?? null);
}

function createMacroChart(gdpRows, spendingRows) {
  const container = document.getElementById('bip-military-chart');
  if (!container) return;

  const points = gdpRows
    .map((row) => ({
      year: String(toNumber(row.year ?? row.Jahreszahl)),
      gdp: toNumber(row.gdp_growth_percent ?? row.Wachstum_Prozent),
    }))
    .filter((row) => Number(row.year) >= START_YEAR && Number(row.year) <= END_YEAR && row.gdp !== null)
    .sort((a, b) => Number(a.year) - Number(b.year));

  if (!points.length) {
    container.innerHTML = '<p class="chart-empty">Keine Daten verfügbar.</p>';
    return;
  }

  const years = points.map((point) => point.year);
  const gdpValues = points.map((point) => point.gdp);
  const militaryValues = getGermanyMilitarySeries(spendingRows, years);

  if (macroChart) {
    macroChart.destroy();
    macroChart = null;
  }

  macroChart = Highcharts.chart('bip-military-chart', Highcharts.merge(baseChartOptions(), {
    chart: { type: 'line' },
    title: { text: '' },
    subtitle: {
      text: 'Beide Reihen sind Prozentwerte, messen aber unterschiedliche Bezugsgrößen.',
    },
    xAxis: { categories: years, title: { text: null } },
    yAxis: {
      title: { text: '%' },
      plotLines: [{ value: 0, color: chartColors.line, width: 1.5, zIndex: 2 }],
      labels: {
        formatter() { return `${formatPercent(this.value, 1)} %`; },
      },
    },
    plotOptions: {
      series: {
        animation: { duration: 900 },
        lineWidth: 2.6,
        marker: { enabled: true, radius: 3 },
      },
    },
    series: [{
      name: 'BIP-Wachstum Deutschland',
      data: gdpValues,
      color: chartColors.accent,
    }, {
      name: 'Militärausgaben Deutschland',
      data: militaryValues,
      color: chartColors.accentWarm,
    }],
    tooltip: {
      shared: true,
      valueSuffix: ' %',
      valueDecimals: 2,
    },
    responsive: {
      rules: [{
        condition: { maxWidth: 640 },
        chartOptions: {
          chart: { spacing: [14, 8, 14, 8] },
          yAxis: { title: { text: null } },
          legend: { itemStyle: { fontSize: '11px' } },
          subtitle: { style: { fontSize: '10px' } },
        },
      }],
    },
  }));
}

function installRegionFilter() {
  const select = getSelectElement();
  if (!select || select.dataset.initialized === 'true') return;
  select.dataset.initialized = 'true';
  select.value = selectedRegion;
  select.addEventListener('change', () => {
    selectedRegion = select.value;
    if (!spendingRowsCache) return;
    const { countries } = buildMilitaryDataset(spendingRowsCache);
    applyRegionVisibility(countries, true);
  });
}

function installThemeListener() {
  if (themeListenerInstalled) return;
  themeListenerInstalled = true;
  window.addEventListener('wkd:themechange', () => {
    if (spendingRowsCache) createMilitaryChart(spendingRowsCache);
    if (gdpRowsCache && spendingRowsCache) createMacroChart(gdpRowsCache, spendingRowsCache);
  });
}

export async function initializeMilitaryEconomyCharts() {
  const hasMilitaryChart = document.getElementById('military-spending-chart');
  const hasMacroChart = document.getElementById('bip-military-chart');
  if (!hasMilitaryChart && !hasMacroChart) return;

  installThemeListener();
  installRegionFilter();

  try {
    const [spendingRows, gdpRows] = await Promise.all([
      spendingRowsCache || loadCsv(MILITARY_SPENDING_PATH, { label: 'Militärausgaben-Daten' }),
      gdpRowsCache || loadCsv(GERMANY_GDP_GROWTH_PATH, { label: 'BIP-Wachstumsdaten' }),
    ]);

    spendingRowsCache = spendingRows;
    gdpRowsCache = gdpRows;

    createMilitaryChart(spendingRows);
    createMacroChart(gdpRows, spendingRows);
  } catch (error) {
    console.error('Fehler beim Laden der makroökonomischen Charts:', error);
    [hasMilitaryChart, hasMacroChart].filter(Boolean).forEach((element) => {
      element.innerHTML = `<p class="chart-empty chart-empty--error">Fehler beim Laden der Daten: ${String(error.message ?? error)}</p>`;
    });
  }
}

export default initializeMilitaryEconomyCharts;
