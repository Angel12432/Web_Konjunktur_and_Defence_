import Highcharts from 'highcharts';

import { loadCsv, publicPath, toNumber } from '../lib/csv.js';
import { baseChartOptions, chartColors } from '../lib/highchartsTheme.js';
import { formatMobileDatum, setMobileDataPanel } from '../lib/mobileDataPanel.js';
import observeAndLoad from '../lib/observeAndLoad.js';

const MILITARY_SPENDING_PATH = publicPath('data/military-spending.csv');
const GERMANY_GDP_GROWTH_PATH = publicPath('data/germany-gdp-growth.csv');
const START_YEAR = 2020;
const END_YEAR = 2025;
const DEFENSE_SERIES_NAME = 'Wachstum Militärbudget (Verteidigungsetat + Sondervermögen)';

const REGION_GROUPS = {
  top5eu: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Polen'],
  eu: ['Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Irland', 'Italien', 'Kroatien', 'Lettland', 'Litauen', 'Luxemburg', 'Malta', 'Niederlande', 'Österreich', 'Polen', 'Portugal', 'Rumänien', 'Schweden', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Ungarn', 'Zypern'],
  nato: ['Albanien', 'Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Island', 'Italien', 'Kanada', 'Lettland', 'Litauen', 'Luxemburg', 'Montenegro', 'Niederlande', 'Nordmazedonien', 'Norwegen', 'Polen', 'Portugal', 'Rumänien', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Türkei', 'Ungarn', 'Vereinigtes Königreich', 'Vereinigte Staaten'],
  'nato-east': ['Estland', 'Lettland', 'Litauen', 'Polen', 'Slowakei', 'Ungarn', 'Rumänien'],
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
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173',
  '#3182bd', '#e6550d', '#31a354', '#756bb1', '#636363',
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

function extractChartYear(row) {
  return toNumber(row.year ?? row.Year ?? row.Jahreszahl);
}

function translateCountryName(name) {
  const trimmed = String(name ?? '').trim();
  return COUNTRY_TRANSLATIONS[trimmed] || trimmed;
}

function formatPercent(value, decimals = 2) {
  if (!Number.isFinite(value)) return '';
  return Highcharts.numberFormat(value, decimals, ',', '.');
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '';
  return Highcharts.numberFormat(value, decimals, ',', '.');
}

function renderMilitaryMobilePanel(point) {
  if (!point || !Number.isFinite(point.y)) return;
  const absValue = Number.isFinite(point.abs) ? ` (${formatNumber(point.abs, 2)} Mrd. Euro)` : '';
  setMobileDataPanel('military-spending-mobile-data', `
    <div class="mobile-data-panel__title">${point.series.name} · ${point.category}</div>
    <div class="mobile-data-panel__grid">
      ${formatMobileDatum('Militärausgaben', `${formatPercent(point.y, 2)} % des BIP${absValue}`)}
    </div>
  `);
}

function renderMacroMobilePanel(point) {
  if (!point?.series?.chart) return;
  const year = point.category;
  const items = point.series.chart.series
    .filter((series) => series.visible !== false)
    .map((series) => {
      const sameYearPoint = series.points?.[point.index];
      if (!sameYearPoint || !Number.isFinite(sameYearPoint.y)) return '';
      const absSuffix = sameYearPoint.series.name.includes('Verteidigungsbudget') && Number.isFinite(sameYearPoint.abs)
        ? ` (${formatNumber(sameYearPoint.abs, 2)} absolut)`
        : '';
      return formatMobileDatum(series.name, `${formatPercent(sameYearPoint.y, 2)} %${absSuffix}`);
    })
    .filter(Boolean)
    .join('');

  if (!items) return;
  setMobileDataPanel('bip-military-mobile-data', `
    <div class="mobile-data-panel__title">${year}</div>
    <div class="mobile-data-panel__grid">${items}</div>
  `);
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
  const regionColorMap = new Map(selectedCountries.map((country, index) => [
    country,
    COUNTRY_COLORS[index % COUNTRY_COLORS.length],
  ]));

  const series = countries.map((country, index) => ({
    name: country,
    data: categories.map((year) => countryMap.get(country)?.get(year) ?? null),
    visible: selectedCountries.includes(country),
    showInLegend: false,
    color: regionColorMap.get(country) || COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    marker: { enabled: false },
  }));

  militaryChart = Highcharts.chart('military-spending-chart', Highcharts.merge(baseChartOptions(), {
    chart: { type: 'spline' },
    title: { text: '' },
    subtitle: {
      text: 'Militärausgaben geteilt durch Bruttoinlandsprodukt, 2020–2025.',
    },
    xAxis: {
      categories,
      title: { text: 'Jahr' },
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
        point: {
          events: {
            mouseOver() { renderMilitaryMobilePanel(this); },
            click() { renderMilitaryMobilePanel(this); },
          },
        },
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
  const firstVisible = militaryChart.series.find((item) => item.visible && item.points?.length);
  const latestPoint = firstVisible?.points?.filter((point) => Number.isFinite(point.y)).at(-1);
  if (latestPoint) renderMilitaryMobilePanel(latestPoint);
}

function getGermanyMilitarySeries(rows, years) {
  const valueKey = rows[0] ? findMilitaryValueKey(rows[0]) : 'Military expenditure (% of GDP)';
  const map = new Map();

  rows.forEach((row) => {
    if (translateCountryName(row.Entity) !== 'Deutschland') return;
    const year = toNumber(row.Year);
    if (!Number.isFinite(year)) return;
    const value = toNumber(row[valueKey]);
    if (value === null) return;
    map.set(String(year), value);
  });

  return years.map((year) => map.get(String(year)) ?? null);
}

function getGermanyDefenseSeries(rows, years) {
  const map = new Map();

  rows.forEach((row) => {
    const year = extractChartYear(row);
    if (!Number.isFinite(year)) return;
    const pct = toNumber(row.growth_defence_budget_pct ?? row['growth_defence_budget_pct']);
    const abs = toNumber(row.growth_defence_budget_abs ?? row['growth_defence_budget_abs']);
    map.set(String(year), { pct, abs });
  });

  return years.map((year) => {
    const entry = map.get(String(year));
    return entry && Number.isFinite(entry.pct) ? { y: entry.pct, abs: entry.abs } : null;
  });
}

function formatMacroTooltipLines(points) {
  return points.map((point) => {
    const isDefenseSeries = point.series.name === DEFENSE_SERIES_NAME;
    const suffix = isDefenseSeries && Number.isFinite(point.point?.abs)
      ? ` (${formatNumber(point.point.abs, 1)} Mrd. Euro)`
      : '';
    return `<span style="color:${point.color}">●</span> ${point.series.name}: <strong>${formatPercent(point.y, 2)} %</strong>${suffix}`;
  }).join('<br/>');
}

function renderMacroAnnotation(chart, annotationIndex) {
  if (annotationIndex < 0) return;
  const point = chart.series?.[1]?.points?.[annotationIndex];
  if (!point || !Number.isFinite(point.plotX) || !Number.isFinite(point.plotY)) return;

  chart._macroAnnotationLabel?.destroy();

  const text = '2024: 2% Natoziel erstmals erreicht';
  const isNarrow = chart.chartWidth <= 620;
  const initialX = chart.plotLeft + point.plotX + (isNarrow ? 20 : -50);
  const initialY = chart.plotTop + point.plotY + (isNarrow ? -40 : -30);

  chart._macroAnnotationLabel = chart.renderer.label(
    text,
    initialX,
    initialY,
    undefined,
    undefined,
    undefined,
    true
  )
    .css({
      color: chartColors.muted,
      fontWeight: '600',
      fontSize: isNarrow ? '0.78rem' : '0.85rem',
      whiteSpace: 'nowrap',
    })
    .attr({ zIndex: 5 })
    .add();

  const labelBBox = chart._macroAnnotationLabel.getBBox();
  const minX = chart.plotLeft + 8;
  const maxX = chart.plotLeft + chart.plotWidth - labelBBox.width - 8;
  const minY = chart.plotTop + 8;
  const maxY = chart.plotTop + chart.plotHeight - labelBBox.height - 8;

  const finalX = Math.min(Math.max(initialX, minX), Math.max(minX, maxX));
  const finalY = Math.min(Math.max(initialY, minY), Math.max(minY, maxY));

  chart._macroAnnotationLabel.attr({ x: finalX, y: finalY });
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
  const defenseValues = getGermanyDefenseSeries(gdpRows, years);
  const annotationIndex = years.indexOf(String(2024));

  if (macroChart) {
    macroChart.destroy();
    macroChart = null;
  }

  macroChart = Highcharts.chart('bip-military-chart', Highcharts.merge(baseChartOptions(), {
    chart: {
      type: 'line',
      events: {
        load() { renderMacroAnnotation(this, annotationIndex); },
        redraw() { renderMacroAnnotation(this, annotationIndex); },
      },
    },
    title: { text: '' },
    subtitle: {
      text: null,
    },
    xAxis: { categories: years, title: { text: null } },
    yAxis: {
      min: -5.0,
      title: { text:null }
      ,
      plotLines: [{ value: 0, color: chartColors.line, width: 1.5, zIndex: 2 }],
      labels: {
        formatter() { return `${formatPercent(this.value, 1)} %`; },
      },
    },
    plotOptions: {
      series: {
        lineWidth: 2.6,
        marker: { enabled: true, radius: 3 },
        point: {
          events: {
            mouseOver() { renderMacroMobilePanel(this); },
            click() { renderMacroMobilePanel(this); },
          },
        },
      },
    },
    series: [{
      name: 'BIP-Wachstum',
      data: gdpValues,
      color: chartColors.accent,
    }, {
      name: DEFENSE_SERIES_NAME,
      data: defenseValues,
      color: chartColors.accentWarm,
    }],
    tooltip: {
      shared: true,
      useHTML: true,
      formatter() {
        return `<div>${formatMacroTooltipLines(this.points)}</div>`;
      },
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

  const latestMacroPoint = macroChart.series[0]?.points?.filter((point) => Number.isFinite(point.y)).at(-1);
  if (latestMacroPoint) renderMacroMobilePanel(latestMacroPoint);
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
  const militaryEl = document.getElementById('military-spending-chart');
  const macroEl = document.getElementById('bip-military-chart');
  if (!militaryEl && !macroEl) return;

  if (militaryEl) militaryEl.classList.add('chart-animate');
  if (macroEl) macroEl.classList.add('chart-animate');

  installThemeListener();
  installRegionFilter();

  // use shared observeAndLoad helper

  // loader for military chart — only needs spendingRows
  const loadMilitary = async () => {
    const spendingRows = spendingRowsCache || await loadCsv(MILITARY_SPENDING_PATH, { label: 'Militärausgaben-Daten' });
    spendingRowsCache = spendingRows;
    createMilitaryChart(spendingRows);
  };

  // loader for macro chart — needs both gdp and spending rows
  const loadMacro = async () => {
    const [gdpRows, spendingRows] = await Promise.all([
      gdpRowsCache || loadCsv(GERMANY_GDP_GROWTH_PATH, { label: 'BIP-Wachstumsdaten' }),
      spendingRowsCache || loadCsv(MILITARY_SPENDING_PATH, { label: 'Militärausgaben-Daten' }),
    ]);
    gdpRowsCache = gdpRows;
    spendingRowsCache = spendingRows;
    createMacroChart(gdpRows, spendingRows);
  };

  // observe elements
  observeAndLoad(militaryEl, loadMilitary, { threshold: 0.3 });
  observeAndLoad(macroEl, loadMacro, { threshold: 0.3 });
}

export default initializeMilitaryEconomyCharts;
