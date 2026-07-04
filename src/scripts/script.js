import Highcharts from 'highcharts';

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

const chartText = {
  title: '#8bd7ff',
  text: '#f2f7ff',
  muted: '#b9c6da',
  line: 'rgba(255,255,255,0.16)',
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (value || row.length) {
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = '';
      }
      if (char === '\r' && next === '\n') i += 1;
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  const [headers, ...body] = rows;
  if (!headers) return [];

  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

function toNumber(value) {
  const normalized = String(value ?? '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

async function loadCsv(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return parseCsv(await response.text());
  } catch (error) {
    console.warn(`Konnte ${path} nicht laden. Fallback-Daten werden genutzt.`, error);
    return fallback;
  }
}

function chartExists(id) {
  return Boolean(document.getElementById(id));
}

function sharedColumnOptions() {
  return {
    chart: {
      type: 'column',
      backgroundColor: 'rgba(0,0,0,0)',
      style: { fontFamily: 'inherit' },
    },
    title: { style: { color: chartText.title, fontSize: '16px', fontWeight: 700 } },
    xAxis: { labels: { style: { color: chartText.muted } }, lineColor: chartText.line },
    yAxis: {
      labels: { style: { color: chartText.muted } },
      title: { style: { color: chartText.muted } },
      gridLineColor: chartText.line,
    },
    legend: { enabled: false },
    credits: { enabled: false },
    accessibility: { enabled: false },
    responsive: {
      rules: [{
        condition: { maxWidth: 520 },
        chartOptions: {
          title: { style: { fontSize: '14px' } },
          xAxis: { labels: { style: { fontSize: '11px' } } },
          yAxis: { labels: { style: { fontSize: '10px' } } },
        },
      }],
    },
  };
}

function renderGermanyCharts(countryData) {
  const deutschland = countryData.find((entry) => entry.Region === 'Deutschland') ?? FALLBACK_COUNTRY_DATA[0];
  const vc2019 = toNumber(deutschland.VC_Finanzierung_DefTech_seit_2019_USD_Mio) ?? 0;
  const vc2024 = toNumber(deutschland.VC_Finanzierung_DefTech_seit_2024_USD_Mio) ?? 0;
  const share2019 = toNumber(deutschland.Anteil_an_gesamter_nationaler_Finanzierung_seit_2019_Prozent) ?? 0;
  const share2024 = toNumber(deutschland.Anteil_an_gesamter_nationaler_Finanzierung_seit_2024_Prozent) ?? 0;

  if (chartExists('deutschland-funding')) {
    Highcharts.chart('deutschland-funding', Highcharts.merge(sharedColumnOptions(), {
      title: { text: 'VC DefTech Finanzierung' },
      xAxis: { categories: ['seit 2019', 'seit 2024'] },
      yAxis: { title: { text: 'USD Millionen' } },
      plotOptions: {
        column: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.0f}',
            style: { color: chartText.text, fontWeight: 'bold', textOutline: 'none' },
          },
        },
      },
      series: [{ name: 'Finanzierung', data: [vc2019, vc2024], color: '#8bd7ff' }],
      tooltip: { pointFormat: '<b>{point.y:.0f} Mio. USD</b>' },
    }));
  }

  if (chartExists('deutschland-share')) {
    Highcharts.chart('deutschland-share', Highcharts.merge(sharedColumnOptions(), {
      title: { text: 'Anteil nationaler Finanzierung' },
      xAxis: { categories: ['seit 2019', 'seit 2024'] },
      yAxis: { title: { text: 'Prozent (%)' } },
      plotOptions: {
        column: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.1f}%',
            style: { color: chartText.text, fontWeight: 'bold', textOutline: 'none' },
          },
        },
      },
      series: [{ name: 'Anteil', data: [share2019, share2024], color: '#ffc56f' }],
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

  const fundingCategories = verticals.map((entry) => entry.name);
  const fundingData = verticals.map((entry) => entry.funding);
  const growthData = verticals.map((entry) => entry.growth);

  if (chartExists('funding-chart')) {
    Highcharts.chart('funding-chart', Highcharts.merge(sharedColumnOptions(), {
      chart: { inverted: true, marginLeft: 210 },
      title: { text: '2025 VC Funding (USD Billion)' },
      xAxis: {
        categories: fundingCategories,
        labels: { style: { color: chartText.muted, fontSize: '12px' }, align: 'right' },
      },
      yAxis: {
        title: { text: 'USD Billion' },
        tickInterval: 2,
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.2f}B',
            style: { color: chartText.text, fontSize: '11px', textOutline: 'none' },
          },
        },
      },
      series: [{ name: '2025 Funding', data: fundingData, color: '#8bd7ff' }],
      tooltip: {
        formatter() {
          return `${this.series.name}: <b>$${this.y.toFixed(2)}B</b>`;
        },
      },
      responsive: {
        rules: [{
          condition: { maxWidth: 640 },
          chartOptions: {
            chart: { marginLeft: 132 },
            xAxis: { labels: { style: { fontSize: '10px' } } },
            plotOptions: { column: { dataLabels: { enabled: false } } },
          },
        }],
      },
    }));
  }

  if (chartExists('growth-chart')) {
    Highcharts.chart('growth-chart', Highcharts.merge(sharedColumnOptions(), {
      chart: { inverted: true, marginLeft: 16 },
      title: { text: 'Projected Growth 2025 vs 2024 (%)' },
      xAxis: { categories: fundingCategories, labels: { enabled: false } },
      yAxis: {
        title: { text: 'Wachstum (%)' },
        tickInterval: 20,
        plotLines: [{ color: 'rgba(255,255,255,0.3)', width: 1, value: 0 }],
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            format: '{point.y}%',
            style: { color: chartText.text, fontSize: '11px', textOutline: 'none' },
          },
        },
      },
      series: [{
        name: 'Wachstum',
        data: growthData,
        colors: growthData.map((value) => (value >= 0 ? '#9df6ca' : '#ff667f')),
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
          chartOptions: {
            plotOptions: { column: { dataLabels: { enabled: false } } },
          },
        }],
      },
    }));
  }
}

export async function initialisiereVCCharts() {
  const [countryData, verticalData] = await Promise.all([
    loadCsv('data_raw/Venture_Capital/VC_country_comparison.csv', FALLBACK_COUNTRY_DATA),
    loadCsv('data_raw/Venture_Capital/VC_vertical_comparison.csv', FALLBACK_VERTICAL_DATA),
  ]);

  renderGermanyCharts(countryData);
  renderVerticalCharts(verticalData);

  window.addEventListener('resize', () => {
    Highcharts.charts.filter(Boolean).forEach((chart) => chart.reflow());
  }, { passive: true });
}

export default initialisiereVCCharts;
