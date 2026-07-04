import './style.css';
import { initialisiereWeltkarte } from './scripts/Weltkarte.js';
import { initialisiereVCCharts } from './scripts/script.js';
import { initialisiereMannheimerAnimation } from './scripts/mannheimer.js';

function startApp() {
  initialisiereWeltkarte();
  initialisiereVCCharts();
  initialisiereMannheimerAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}
