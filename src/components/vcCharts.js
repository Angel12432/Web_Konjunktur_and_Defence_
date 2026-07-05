import Highcharts from 'highcharts';

let listenersInstalled = false;

function installChartListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener('resize', () => {
    Highcharts.charts.filter(Boolean).forEach((chart) => chart.reflow());
  }, { passive: true });
}

export async function initializeVcCharts() {
  installChartListeners();
}

export default initializeVcCharts;
