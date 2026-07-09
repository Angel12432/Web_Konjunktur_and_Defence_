import './styles/main.css';
import { initializeThemeFeatures } from './lib/Theme.js';

import { initializeWorldMap } from './components/worldMap.js';
import { initializeVcCharts } from './components/vcCharts.js';
import { initializeMannheimerAnimation } from './components/mannheimerAnimation.js';
import { initializeThemeToggle } from './components/themeToggle.js';
import { initializeDsrChart } from './components/dsr_chart.js';
import { initializeDsrCountriesChart } from './components/dsr_countries.js';
import { initializeMilitaryEconomyCharts } from './components/militaryEconomyCharts.js';
import { initializeBitkomDirectOrdersChart } from './components/bitkomDirectOrdersChart.js';
import { initializeStoryNavigation } from './components/storyNavigation.js';

function startApp() {
  initializeThemeToggle();
  initializeThemeFeatures();
  initializeStoryNavigation();
  initializeWorldMap();
  initializeVcCharts();
  initializeMannheimerAnimation();
  initializeDsrChart();
  initializeDsrCountriesChart();
  initializeMilitaryEconomyCharts();
  initializeBitkomDirectOrdersChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}
