const chartStates = new Map();
let observer = null;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      const state = chartStates.get(id);
      if (!state || state.played) return;

      playBarAnimation(id);
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -8% 0px',
  });

  return observer;
}


function isElementInActivationRange(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  return visibleHeight > Math.min(rect.height * 0.3, 160);
}

function zeroLike(point) {
  if (typeof point === 'number') return 0;
  if (Array.isArray(point)) return point.map((value, index) => (index === 1 && typeof value === 'number' ? 0 : value));
  if (point && typeof point === 'object') return { ...point, y: 0 };
  return point;
}

function zeroSeriesData(data) {
  return data.map(zeroLike);
}

function replaceAnimatedSeriesData(options, seriesDataList) {
  return {
    ...options,
    chart: {
      ...options.chart,
      animation: false,
    },
    series: options.series.map((series, index) => {
      const targetData = seriesDataList[index];
      if (!targetData) return series;
      return {
        ...series,
        animation: false,
        data: zeroSeriesData(targetData),
      };
    }),
  };
}

function revealImmediately(id) {
  const state = chartStates.get(id);
  if (!state) return;
  state.played = true;
}

function playBarAnimation(id) {
  const state = chartStates.get(id);
  if (!state || state.played) return;

  if (!state.chart) return;

  state.played = true;

  state.seriesDataList.forEach((targetData, index) => {
    const series = state.chart.series[index];
    if (!series || !targetData) return;
    series.setData(targetData, index === state.seriesDataList.length - 1, {
      duration: state.duration,
    });
  });
}

export function prepareViewportBarChart(id, options, seriesDataList, { duration = 950 } = {}) {
  const element = document.getElementById(id);
  const previousState = chartStates.get(id);
  const alreadyPlayed = Boolean(previousState?.played);
  const reducedMotion = prefersReducedMotion();
  const shouldRenderFinal = alreadyPlayed || reducedMotion || typeof IntersectionObserver === 'undefined';

  chartStates.set(id, {
    played: shouldRenderFinal,
    chart: null,
    seriesDataList,
    duration,
  });

  if (reducedMotion || typeof IntersectionObserver === 'undefined') {
    revealImmediately(id);
    return options;
  }

  if (element) {
    getObserver()?.observe(element);
  }

  if (shouldRenderFinal) return options;
  return replaceAnimatedSeriesData(options, seriesDataList);
}

export function registerViewportBarChart(id, chart) {
  const state = chartStates.get(id);
  if (!state) return;
  state.chart = chart;

  if (!state.played && isElementInActivationRange(chart.renderTo)) {
    requestAnimationFrame(() => playBarAnimation(id));
  }
}
