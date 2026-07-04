import Highcharts from 'highcharts/highmaps';
import worldTopology from '@highcharts/map-collection/custom/world.topo.json';

import { loadCsv, publicPath, toNumber } from '../lib/csv.js';
import { chartColors } from '../lib/highchartsTheme.js';

const BATTLE_DEATHS_PATH = publicPath('data/battle-deaths.csv');
const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];
const FIRST_YEAR = YEARS[0];
const LAST_YEAR = YEARS[YEARS.length - 1];
const STEP_INTERVAL_MS = 1800;
const MAP_TRANSITION_MS = 600;

const COUNTRY_TO_HC_KEY = {
  Afghanistan: 'af', Algeria: 'dz', Angola: 'ao', Australia: 'au', Azerbaijan: 'az', Bangladesh: 'bd', Benin: 'bj',
  'Bosnia-Herzegovina': 'ba', 'Burkina Faso': 'bf', Burundi: 'bi', 'Cambodia (Kampuchea)': 'kh', Cameroon: 'cm',
  'Central African Republic': 'cf', Chad: 'td', China: 'cn', Colombia: 'co', 'DR Congo (Zaire)': 'cd', Egypt: 'eg',
  Ethiopia: 'et', Haiti: 'ht', India: 'in', Indonesia: 'id', Iran: 'ir', Iraq: 'iq', Israel: 'il', Kenya: 'ke',
  Kyrgyzstan: 'kg', Libya: 'ly', Mali: 'ml', Mozambique: 'mz', 'Myanmar (Burma)': 'mm', Niger: 'ne', Nigeria: 'ng',
  Pakistan: 'pk', Philippines: 'ph', 'Russia (Soviet Union)': 'ru', Rwanda: 'rw', Somalia: 'so', 'South Sudan': 'ss',
  Sudan: 'sd', Syria: 'sy', Tajikistan: 'tj', Tanzania: 'tz', Thailand: 'th', Togo: 'tg', Turkey: 'tr', Uganda: 'ug',
  Ukraine: 'ua', 'United Kingdom': 'gb', 'United States of America': 'us', 'Yemen (North Yemen)': 'ye',
};

const COUNTRY_LABEL_DE = {
  af: 'Afghanistan', dz: 'Algerien', ao: 'Angola', au: 'Australien', az: 'Aserbaidschan', bd: 'Bangladesch',
  bj: 'Benin', ba: 'Bosnien-Herzegowina', bf: 'Burkina Faso', bi: 'Burundi', kh: 'Kambodscha', cm: 'Kamerun',
  cf: 'Zentralafrikan. Republik', td: 'Tschad', cn: 'China', co: 'Kolumbien', cd: 'DR Kongo', eg: 'Ägypten',
  et: 'Äthiopien', ht: 'Haiti', in: 'Indien', id: 'Indonesien', ir: 'Iran', iq: 'Irak', il: 'Israel', ke: 'Kenia',
  kg: 'Kirgisistan', ly: 'Libyen', ml: 'Mali', mz: 'Mosambik', mm: 'Myanmar', ne: 'Niger', ng: 'Nigeria', pk: 'Pakistan',
  ph: 'Philippinen', ru: 'Russland', rw: 'Ruanda', so: 'Somalia', ss: 'Südsudan', sd: 'Sudan', sy: 'Syrien',
  tj: 'Tadschikistan', tz: 'Tansania', th: 'Thailand', tg: 'Togo', tr: 'Türkei', ug: 'Uganda', ua: 'Ukraine',
  gb: 'Ver. Königreich', us: 'USA', ye: 'Jemen',
};

const DEFAULT_MAP_VIEW = { projection: { name: 'Miller' }, center: [10, 18], zoom: 1.65 };
const MOBILE_MAP_VIEW = { projection: { name: 'Miller' }, center: [18, 18], zoom: 1.35 };

function normalizeConflictTypes(value) {
  return String(value ?? '')
    .replace(/^"|"$/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function aggregateBattleDeaths(rows) {
  const grouped = Object.fromEntries(YEARS.map((year) => [year, {}]));

  rows.forEach((row) => {
    const country = row.country?.trim();
    const year = row.year?.trim();
    const deaths = toNumber(row.bd_best);
    const conflictCount = toNumber(row.num_conflicts) ?? 0;
    const hcKey = COUNTRY_TO_HC_KEY[country];

    if (!country || !YEARS.includes(year) || !hcKey || deaths === null) return;

    const current = grouped[year][hcKey];
    const conflictTypes = normalizeConflictTypes(row.type_of_conflict);

    if (current) {
      current.value += deaths;
      current.num_conflicts += conflictCount;
      current.typeSet = new Set([...current.typeSet, ...conflictTypes]);
      current.type_of_conflict = [...current.typeSet].sort().join(', ');
      return;
    }

    grouped[year][hcKey] = {
      'hc-key': hcKey,
      name: COUNTRY_LABEL_DE[hcKey] ?? country,
      value: deaths,
      num_conflicts: conflictCount,
      typeSet: new Set(conflictTypes),
      type_of_conflict: conflictTypes.sort().join(', '),
    };
  });

  return Object.fromEntries(
    Object.entries(grouped).map(([year, countries]) => [
      year,
      Object.values(countries).map(({ typeSet, ...entry }) => entry),
    ]),
  );
}

function getMapControls() {
  return {
    slider: document.getElementById('jahrSlider'),
    yearLabel: document.getElementById('jahrLabel'),
    playButton: document.getElementById('playButton'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    ticks: [...document.querySelectorAll('.slider-tick')],
  };
}

function buildKeyLookup(dataByYear, year) {
  return Object.fromEntries((dataByYear[year] ?? []).map((entry) => [entry['hc-key'], entry]));
}

function setSliderProgress(slider, year) {
  const progress = ((Number(year) - Number(FIRST_YEAR)) / (Number(LAST_YEAR) - Number(FIRST_YEAR))) * 100;
  slider.style.setProperty('--slider-progress', `${progress}%`);
}

function renderLoadError(container, error) {
  container.innerHTML = `
    <div class="error-state">
      <strong>Fehler beim Laden der Daten</strong>
      <code>${String(error.message ?? error).replace(/[<>&]/g, '')}</code>
    </div>`;
}

function createWorldMap(dataByYear) {
  let currentYear = FIRST_YEAR;
  let animationTimer = null;
  let isPlaying = false;
  const controls = getMapControls();

  if (!controls.slider || !controls.yearLabel || !controls.playButton) {
    throw new Error('Kartenelemente wurden im HTML nicht vollständig gefunden.');
  }

  const chart = Highcharts.mapChart('kartenContainer', {
    chart: {
      map: worldTopology,
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
      zooming: { mouseWheel: { enabled: false } },
      panning: { enabled: true },
      height: null,
    },
    title: { text: null },
    subtitle: {
      text: 'Quelle: UCDP Battle-Related Deaths Dataset v26.1 · Bester Schätzwert (bd_best)',
      style: { color: chartColors.muted, fontSize: '11px' },
    },
    mapView: DEFAULT_MAP_VIEW,
    colorAxis: {
      min: 1,
      max: 99000,
      type: 'logarithmic',
      minColor: chartColors.mapLow,
      maxColor: chartColors.mapMax,
      tickAmount: 6,
      stops: [
        [0, chartColors.mapLow],
        [0.2, chartColors.mapMidLow],
        [0.65, chartColors.mapMid],
        [0.95, chartColors.mapHigh],
        [1, chartColors.mapMax],
      ],
      labels: {
        style: { color: chartColors.muted },
        formatter() {
          return this.value >= 1000 ? `${(this.value / 1000).toFixed(0)}k` : this.value;
        },
      },
    },
    legend: {
      title: { text: 'Todesfälle<br>(logarithmisch)', style: { color: chartColors.muted } },
      align: 'right',
      verticalAlign: 'bottom',
      layout: 'vertical',
      floating: false,
      itemStyle: { color: chartColors.soft },
      itemMarginTop: 2,
      itemMarginBottom: 2,
    },
    tooltip: {
      useHTML: true,
      backgroundColor: chartColors.card,
      borderColor: chartColors.line,
      borderRadius: 10,
      shadow: false,
      style: { color: chartColors.text, fontSize: '12px' },
      formatter() {
        const point = this.point;
        if (point.value == null) {
          return `<b>${point.name}</b><br><span style="color:${chartColors.muted}">Keine Konfliktdaten</span>`;
        }
        return `
          <b style="font-size:13px">${point.name}</b><br>
          <span style="color:${chartColors.muted}">Jahr: </span><b>${currentYear}</b><br>
          <span style="color:${chartColors.muted}">Todesfälle: </span>
          <b style="color:${chartColors.accentWarm}">${point.value.toLocaleString('de-DE')}</b><br>
          <span style="color:${chartColors.muted}">Konflikte: </span><b>${point.num_conflicts}</b><br>
          <span style="color:${chartColors.muted}">Konfliktart: </span>${point.type_of_conflict || 'Keine Angabe'}
        `;
      },
    },
    series: [{
      name: 'Länder',
      data: dataByYear[currentYear] ?? [],
      joinBy: 'hc-key',
      nullColor: chartColors.panel,
      borderColor: chartColors.line,
      states: { hover: { borderColor: chartColors.text, borderWidth: 1.5 } },
      dataLabels: { enabled: false },
    }],
    mapNavigation: {
      enabled: true,
      enableMouseWheelZoom: false,
      buttonOptions: {
        verticalAlign: 'top',
        align: 'left',
        theme: {
          fill: chartColors.card,
          stroke: chartColors.line,
          style: { color: chartColors.text, fontSize: '16px' },
          states: {
            hover: { fill: chartColors.panel, stroke: chartColors.danger },
            select: { fill: chartColors.panel },
          },
        },
      },
    },
    credits: { enabled: false },
    accessibility: { enabled: false },
    responsive: {
      rules: [{
        condition: { maxWidth: 700 },
        chartOptions: {
          mapView: MOBILE_MAP_VIEW,
          legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal', title: { text: null } },
          subtitle: { style: { fontSize: '10px' } },
        },
      }],
    },
  });

  function setPlaybackState(playing) {
    isPlaying = playing;
    controls.playIcon.hidden = playing;
    controls.pauseIcon.hidden = !playing;
    controls.playButton.setAttribute('aria-label', playing ? 'Animation pausieren' : 'Animation abspielen');
  }

  function stopAnimation() {
    window.clearInterval(animationTimer);
    animationTimer = null;
    setPlaybackState(false);
  }

  function updateMap(year) {
    currentYear = String(year);
    controls.yearLabel.textContent = currentYear;
    controls.slider.value = currentYear;
    setSliderProgress(controls.slider, currentYear);

    const lookup = buildKeyLookup(dataByYear, currentYear);
    const series = chart.series[0];

    series.points.forEach((point) => {
      const key = point['hc-key'] ?? point.properties?.['hc-key'];
      const nextData = lookup[key];
      point.update({
        value: nextData?.value ?? null,
        num_conflicts: nextData?.num_conflicts ?? null,
        type_of_conflict: nextData?.type_of_conflict ?? null,
      }, false, { duration: MAP_TRANSITION_MS });
    });

    series.chart.redraw({ duration: MAP_TRANSITION_MS });
    controls.ticks.forEach((tick) => tick.classList.toggle('is-active', tick.dataset.year === currentYear));
  }

  function startAnimation() {
    if (currentYear === LAST_YEAR) updateMap(FIRST_YEAR);
    setPlaybackState(true);

    animationTimer = window.setInterval(() => {
      const nextYear = String(Number(currentYear) + 1);
      if (Number(nextYear) > Number(LAST_YEAR)) {
        stopAnimation();
        return;
      }
      updateMap(nextYear);
    }, STEP_INTERVAL_MS);
  }

  controls.playButton.addEventListener('click', () => {
    if (isPlaying) stopAnimation();
    else startAnimation();
  });

  controls.slider.addEventListener('input', (event) => {
    if (isPlaying) stopAnimation();
    updateMap(event.target.value);
  });

  controls.ticks.forEach((button) => {
    button.addEventListener('click', () => {
      if (isPlaying) stopAnimation();
      updateMap(button.dataset.year);
    });
  });

  updateMap(FIRST_YEAR);
}

export async function initializeWorldMap() {
  const container = document.getElementById('kartenContainer');
  if (!container) return;

  try {
    const rows = await loadCsv(BATTLE_DEATHS_PATH, { label: 'Battle-Deaths-Daten' });
    createWorldMap(aggregateBattleDeaths(rows));
  } catch (error) {
    renderLoadError(container, error);
    console.error(error);
  }
}

export default initializeWorldMap;
