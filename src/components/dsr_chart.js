import Highcharts from 'highcharts';
import { chartColors, baseChartOptions } from '../lib/highchartsTheme.js';
import { loadCsv, publicPath, toNumber } from '../lib/csv.js';
import { formatMobileDatum, setMobileDataPanel } from '../lib/mobileDataPanel.js';

const DSR_TOTAL_PATH = publicPath('data/dsr-total.csv');

let dsrTotalCache = null;

function getElement(id) {
  return document.getElementById(id);
}

function renderDsrMobilePanel(point, year) {
  if (!point) return;
  setMobileDataPanel('dsr-mobile-data', `
    <div class="mobile-data-panel__title">${year}</div>
    <div class="mobile-data-panel__grid">
      ${formatMobileDatum('DSR-Anteil', `${Highcharts.numberFormat(point.y, 2, ',', '.')} %`)}
      ${formatMobileDatum('DSR-Funding', `$${Highcharts.numberFormat(point.dsr, 1, ',', '.')}B`)}
      ${formatMobileDatum('Gesamt-VC', `$${Highcharts.numberFormat(point.total, 1, ',', '.')}B`)}
    </div>
  `);
}

export async function initializeDsrChart() {
  const container = getElement('dsr-chart');
  if (!container) return;
  container.classList.add('chart-animate');
  const observerOptions = { threshold: 0.3 };

  let chart = null;

  function observeAndLoad(element, loader) {
    if (!element) return;
    if (element.dataset.loaded === 'true') return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          try {
            await loader();
            element.dataset.loaded = 'true';
          } catch (err) {
            console.error('Error rendering DSR chart:', err);
            element.innerHTML = '<p style="padding: 20px; text-align: center; color: red;">Fehler beim Laden der Daten</p>';
          }
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);
    io.observe(element);
  }

  const load = async () => {
    try {
      const data = dsrTotalCache || (await loadCsv(DSR_TOTAL_PATH));
      if (!dsrTotalCache && data) dsrTotalCache = data;

      const series = data
        .map((entry) => ({
          year: String(toNumber(entry.Year) || entry.Year || ''),
          dsr: toNumber(entry.DSR_Deep_Tech_VC_B_USD) || 0,
          total: toNumber(entry.Total_VC_B_USD) || 0,
        }))
        .filter((entry) => entry.year);

      if (series.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">Keine Daten verfügbar</p>';
        return;
      }

      const years = series.map((s) => s.year);
      const percentageData = series.map((s) => {
        const percentage = (s.dsr / s.total) * 100;
        return {
          y: Math.round(percentage * 100) / 100,
          dsr: s.dsr,
          total: s.total,
        };
      });

      const options = Highcharts.merge(baseChartOptions(), {
        chart: { type: 'line' },
        title: { text: '' },
        xAxis: { categories: years, title: { text: 'Jahr' } },
        yAxis: {
          title: { text: 'DSR Anteil am Gesamtvolumen(%)' },
          min: 0,
          tickInterval: 2,
          labels: { format: '{value}%' },
        },
        plotOptions: {
          line: {
            dataLabels: { enabled: true, format: '{point.y:.2f}%', style: { color: chartColors.text } },
            enableMouseTracking: true,
            point: {
              events: {
                mouseOver() { renderDsrMobilePanel(this, years[this.index]); },
                click() { renderDsrMobilePanel(this, years[this.index]); },
              },
            },
          },
        },
        series: [
          {
            name: 'DSR Anteil am VC-Markt',
            data: percentageData,
            color: chartColors.accent,
            lineWidth: 3,
            marker: { enabled: true, radius: 5 },
          },
        ],
        tooltip: {
          pointFormat: '<b>DSR Anteil: {point.y:.2f}%</b><br/>DSR Volumen: ${point.dsr:.1f}B<br/>Gesamtes VC Volumen: ${point.total:.1f}B',
        },
        legend: { enabled: false },
        responsive: {
          rules: [
            {
              condition: { maxWidth: 560 },
              chartOptions: {
                chart: { spacing: [14, 10, 14, 10] },
                title: { style: { fontSize: '14px' } },
                xAxis: { labels: { style: { fontSize: '11px' } } },
                yAxis: { labels: { style: { fontSize: '10px' } }, tickInterval: 2 },
                plotOptions: { line: { dataLabels: { enabled: false } } },
              },
            },
          ],
        },
      });

      chart = Highcharts.chart('dsr-chart', options);
      renderDsrMobilePanel(percentageData[percentageData.length - 1], years[years.length - 1]);

      if (!window.dsrChartListener) {
        document.addEventListener('wkd:themechange', () => {
          if (chart) {
            chart.update(Highcharts.merge(baseChartOptions(), options), true);
          }
        });
        window.dsrChartListener = true;
      }
    } catch (error) {
      throw error;
    }
  };

  observeAndLoad(container, load);
}