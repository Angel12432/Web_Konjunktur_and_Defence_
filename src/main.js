import './styles/main.css';

import { initializeWorldMap } from './components/worldMap.js';
import { initializeVcCharts } from './components/vcCharts.js';
import { initializeMannheimerAnimation } from './components/mannheimerAnimation.js';
import { initializeThemeToggle } from './components/themeToggle.js';
import { initializeDsrChart } from './components/dsr_chart.js';
import { initializeDsrCountriesChart } from './components/dsr_countries.js';

function startApp() {
  initializeThemeToggle();
  initializeWorldMap();
  initializeVcCharts();
  initializeMannheimerAnimation();
  initializeDsrChart();
  initializeDsrCountriesChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}
