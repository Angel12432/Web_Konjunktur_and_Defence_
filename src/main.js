import './styles/main.css';

import { initializeWorldMap } from './components/worldMap.js';
import { initializeVcCharts } from './components/vcCharts.js';
import { initializeMannheimerAnimation } from './components/mannheimerAnimation.js';

function startApp() {
  initializeWorldMap();
  initializeVcCharts();
  initializeMannheimerAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}
