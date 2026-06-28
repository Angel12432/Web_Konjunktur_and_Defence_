import Highcharts from 'highcharts'
import battleDeathsCsv from '../../data_raw/Battle_Deaths/BattleDeaths_v26_1_conf.csv?raw'
import militaryCsv from '../../data_raw/Militaerausgaben/sipri_militaerausgaben_alle_laender_2015_2024_DE-1.csv?raw'
import germanyBipCsv from '../../data_raw/BIP_Deutschland/BIP_Wachstum_92_25.csv?raw'
import rheinmetallUmsatzCsv from '../../data_raw/rheinmetall/umsatz.csv?raw'
import rheinmetallAktienCsv from '../../data_raw/rheinmetall/aktienkurs_und_dividende.csv?raw'
import rheinmetallMitarbeiterCsv from '../../data_raw/rheinmetall/mitarbeiter.csv?raw'

const chartColors = ['#ff6b7a', '#7cd2ff', '#ff9a4d', '#7ef0bf', '#b8a2ff', '#f7de69']

function parseDelimitedCsv(text, delimiter = ',') {
  const normalized = text.replace(/^\uFEFF/, '').trim()
  if (!normalized) return []

  const rows = []
  let row = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      row.push(current.trim())
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1
      }
      row.push(current.trim())
      rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current || row.length) {
    row.push(current.trim())
    rows.push(row)
  }

  return rows.filter((entry) => entry.some((cell) => cell))
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const safe = String(value).trim().replace(/\./g, '').replace(',', '.')
  if (safe === 'k.A.' || safe === 'k.A' || safe === 'NA') return null
  const parsed = Number(safe)
  return Number.isFinite(parsed) ? parsed : null
}

function buildLegend(items, selectedItems, toggleCallback) {
  const legend = document.getElementById('military-legend')
  if (!legend) return
  legend.innerHTML = items
    .map((item, index) => `
      <label class="legend__item">
        <input type="checkbox" data-country="${item}" ${selectedItems.includes(item) ? 'checked' : ''} />
        <span class="legend__swatch" style="background:${chartColors[index % chartColors.length]}"></span>
        <span>${item}</span>
      </label>
    `)
    .join('')

  legend.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => toggleCallback(input.dataset.country, input.checked))
  })
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle')
  const icon = toggle?.querySelector('.theme-toggle__icon')
  if (!toggle) return

  const setTheme = (theme) => {
    document.body.dataset.theme = theme
    localStorage.setItem('theme', theme)
    if (icon) {
      icon.textContent = theme === 'light' ? '🌙' : '☀'
      toggle.setAttribute('aria-label', theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren')
    }
  }

  const stored = localStorage.getItem('theme')
  setTheme(stored || 'light')

  toggle.addEventListener('click', () => {
    setTheme(document.body.dataset.theme === 'light' ? 'dark' : 'light')
  })
}

function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress')
  if (!bar) return
  const update = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0
    bar.style.transform = `scaleX(${Math.min(1, ratio)})`
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
}

function initParallax() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches
  const heroTitle = document.querySelector('.hero-title')
  if (!heroTitle || isMobile) return

  const update = () => {
    const ratio = Math.min(1, window.scrollY / 320)
    heroTitle.style.transform = `translateY(${ratio * -40}px)`
    heroTitle.style.opacity = `${Math.max(0.2, 1 - ratio)}`
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
}

function initRevealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }
  )

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
}

function renderBattleTimeline() {
  const rows = parseDelimitedCsv(battleDeathsCsv, ',')
  const header = rows[0] || []
  const yearIndex = header.findIndex((name) => name.toLowerCase() === 'year')
  const deathsIndex = header.findIndex((name) => name.toLowerCase() === 'bd_best')
  if (yearIndex < 0 || deathsIndex < 0) return

  const grouped = {}
  rows.slice(1).forEach((row) => {
    const year = Number(row[yearIndex])
    const deaths = parseNumber(row[deathsIndex])
    if (!year || deaths === null) return
    grouped[year] = (grouped[year] || 0) + deaths
  })

  const years = Object.keys(grouped)
    .map(Number)
    .filter((year) => year >= 2020)
    .sort((a, b) => a - b)
  const values = years.map((year) => grouped[year])

  const chart = Highcharts.chart('battle-chart', {
    chart: { type: 'area', backgroundColor: 'transparent' },
    title: { text: 'Kampfbedingte Todesfälle (geschätzte Opfer)' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: years,
      labels: { style: { color: 'var(--muted)' } },
      lineColor: 'var(--line)',
      tickColor: 'var(--line)'
    },
    yAxis: {
      title: { text: 'Geschätzte Opfer' },
      labels: { style: { color: 'var(--muted)' } },
      gridLineColor: 'rgba(255,255,255,0.08)'
    },
    plotOptions: {
      area: {
        fillOpacity: 0.2,
        lineColor: '#ff6b7a',
        lineWidth: 2,
        marker: { radius: 3, fillColor: '#ff6b7a' }
      }
    },
    series: [{ name: 'Battle deaths', data: values, color: '#ff6b7a' }],
    tooltip: { valueSuffix: ' Opfer' }
  })

  const slider = document.getElementById('battle-slider')
  const info = document.getElementById('battle-info')
  if (!slider || !info) return

  slider.max = years.length - 1
  slider.value = years.length - 1
  let currentIndex = years.length - 1
  let isPlaying = false

  const updateHighlight = () => {
    const year = years[currentIndex]
    const value = values[currentIndex]
    if (info) {
      info.textContent = `${year}: ${value.toLocaleString('de-DE')} geschätzte Opfer`
    }
    chart.series[0].points.forEach((point, index) => {
      point.setState(index === currentIndex ? 'hover' : '')
    })
  }

  const play = () => {
    if (isPlaying) return
    isPlaying = true
    document.getElementById('battle-play').textContent = '⏸'
    const tick = () => {
      if (!isPlaying) return
      currentIndex = (currentIndex + 1) % years.length
      slider.value = currentIndex
      updateHighlight()
      window.setTimeout(tick, 900)
    }
    tick()
  }

  const pause = () => {
    isPlaying = false
    document.getElementById('battle-play').textContent = '▶'
  }

  document.getElementById('battle-play').addEventListener('click', () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  })

  document.getElementById('battle-rewind').addEventListener('click', () => {
    currentIndex = 0
    slider.value = currentIndex
    updateHighlight()
    pause()
  })

  slider.addEventListener('input', (event) => {
    currentIndex = Number(event.target.value)
    updateHighlight()
    pause()
  })

  updateHighlight()
}

function renderMilitaryChart() {
  const rows = parseDelimitedCsv(militaryCsv, ';')
  const header = rows[0] || []
  const landIndex = header.findIndex((name) => name.toLowerCase() === 'land')
  const jahrIndex = header.findIndex((name) => name.toLowerCase() === 'jahr')
  const anteilIndex = header.findIndex((name) => name.toLowerCase().includes('anteil'))

  if (landIndex < 0 || jahrIndex < 0 || anteilIndex < 0) return

  const dataByCountry = {}
  rows.slice(1).forEach((row) => {
    const country = row[landIndex]
    const year = Number(row[jahrIndex])
    const value = parseNumber(row[anteilIndex])
    if (!country || !year || value === null) return
    if (!dataByCountry[country]) dataByCountry[country] = {}
    dataByCountry[country][year] = value
  })

  const countries = Object.keys(dataByCountry).filter((country) => ['Deutschland', 'Polen', 'Frankreich', 'Italien', 'Spanien', 'Niederlande', 'Schweden'].includes(country))
  const fallbackCountries = countries.length ? countries : Object.keys(dataByCountry).slice(0, 5)
  const chartContainer = document.getElementById('military-chart')
  if (!chartContainer) return

  let selectedCountries = fallbackCountries.slice(0, 4)
  let militaryChart = null

  const drawChart = (activeCountries) => {
    if (!activeCountries.length) {
      activeCountries = fallbackCountries.slice(0, 1)
    }

    const allYears = Array.from(new Set(activeCountries.flatMap((country) => Object.keys(dataByCountry[country]).map(Number)))).sort((a, b) => a - b)
    const series = activeCountries.map((country, index) => ({
      name: country,
      data: allYears.map((year) => dataByCountry[country][year] ?? null),
      color: chartColors[index % chartColors.length],
      animation: { duration: 800 }
    }))

    if (militaryChart) {
      militaryChart.destroy()
    }

    militaryChart = Highcharts.chart('military-chart', {
        chart: { type: 'line', backgroundColor: 'transparent' },
        title: { text: 'Militärausgaben — Anteil am BIP' },
      credits: { enabled: false },
      xAxis: { categories: allYears, labels: { style: { color: 'var(--muted)' } } },
        yAxis: { title: { text: 'Anteil am BIP (%)' }, labels: { style: { color: 'var(--muted)' } }, gridLineColor: 'rgba(255,255,255,0.08)' },
      legend: { enabled: false },
      series,
      plotOptions: { line: { marker: { enabled: true, radius: 3 } } },
      tooltip: { valueSuffix: '%' }
    })
  }

  const toggleCountry = (country, checked) => {
    const nextSelection = checked
      ? [...selectedCountries, country].filter((item, index, all) => all.indexOf(item) === index)
      : selectedCountries.filter((item) => item !== country)

    selectedCountries = nextSelection.length ? nextSelection : [country]
    buildLegend(fallbackCountries, selectedCountries, toggleCountry)
    drawChart(selectedCountries)
  }

  buildLegend(fallbackCountries, selectedCountries, toggleCountry)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          drawChart(selectedCountries)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.35 }
  )

  observer.observe(chartContainer)
}

function renderGermanyChart() {
  const rows = parseDelimitedCsv(germanyBipCsv, ',')
  const years = []
  const values = []
  rows.slice(1).forEach((row) => {
    const year = row[0]
    const value = parseNumber(row[1])
    if (!year || value === null) return
    years.push(Number(year))
    values.push(value)
  })

  Highcharts.chart('germany-chart', {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: { text: 'Deutschland — BIP-Wachstum' },
    credits: { enabled: false },
    xAxis: { categories: years, labels: { style: { color: 'var(--muted)' } } },
    yAxis: { title: { text: 'Wachstum (%)' }, labels: { style: { color: 'var(--muted)' } }, gridLineColor: 'rgba(255,255,255,0.08)' },
    legend: { enabled: false },
    series: [{ name: 'Deutschland', data: values, color: '#7cd2ff' }],
    plotOptions: { line: { marker: { enabled: false } } }
  })
}

function renderRheinmetallChart() {
  const descriptions = {
    umsatz: {
      title: 'Umsatzentwicklung',
      text: 'Der Umsatz von Rheinmetall stieg seit 2020 deutlich an und zeigt die Expansion in Verteidigungs- und Technologiegeschäftsfelder.'
    },
    aktienkurs: {
      title: 'Aktienkurs und Dividende',
      text: 'Der Aktienkurs reagiert stark auf Prognosen, Auftragslage und das veränderte politische Umfeld rund um Verteidigungsausgaben.'
    },
    mitarbeiter: {
      title: 'Personalentwicklung',
      text: 'Die Beschäftigung wächst, weil neue Programme, Auftragsvolumen und technologische Modernisierung mehr Fachkräfte binden.'
    }
  }

  const datasets = {
    umsatz: { title: 'Umsatz in Mio. Euro', values: parseDelimitedCsv(rheinmetallUmsatzCsv, ';').slice(1).map((row) => ({ year: Number(row[0]), value: parseNumber(row[1]) })) },
    aktienkurs: { title: 'Aktienkurs in EUR', values: parseDelimitedCsv(rheinmetallAktienCsv, ';').slice(1).map((row) => ({ year: Number(row[0]), value: parseNumber(row[1]) })) },
    mitarbeiter: { title: 'Mitarbeiter', values: parseDelimitedCsv(rheinmetallMitarbeiterCsv, ';').slice(1).map((row) => ({ year: Number(row[0]), value: parseNumber(row[1]) })) }
  }

  const chart = Highcharts.chart('rheinmetall-chart', {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: { text: 'Rheinmetall — Kennzahlen' },
    credits: { enabled: false },
    xAxis: { categories: datasets.umsatz.values.map((point) => point.year), labels: { style: { color: 'var(--muted)' } } },
    yAxis: { title: { text: 'Umsatz (Mio. €)' }, labels: { style: { color: 'var(--muted)' } }, gridLineColor: 'rgba(255,255,255,0.08)' },
    legend: { enabled: false },
    series: [{ name: 'Umsatz', data: datasets.umsatz.values.map((point) => point.value), color: '#7cd2ff' }],
    plotOptions: { line: { marker: { enabled: true, radius: 4 } } }
  })

  const info = document.getElementById('rheinmetall-info')
  const buttons = document.querySelectorAll('.metric-btn')
  const units = { umsatz: 'Mio. €', aktienkurs: 'EUR', mitarbeiter: 'Anzahl' }

  const update = (metric) => {
    const dataset = datasets[metric]
    if (!dataset) return
    const years = dataset.values.map((point) => point.year)
    const values = dataset.values.map((point) => point.value)
    chart.update({
      xAxis: { categories: years },
      series: [{ name: descriptions[metric].title, data: values, color: metric === 'umsatz' ? '#7cd2ff' : metric === 'aktienkurs' ? '#ff9a4d' : '#7ef0bf' }],
      yAxis: { title: { text: `${descriptions[metric].title} (${units[metric]})` } }
    })
    if (info) {
      info.innerHTML = `<strong>${descriptions[metric].title}</strong><br>${descriptions[metric].text}`
    }
    buttons.forEach((button) => button.classList.toggle('is-active', button.dataset.metric === metric))
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => update(button.dataset.metric))
  })

  update('umsatz')
}

function renderStartupGrids() {
  const createGrid = (container, count, activeCount) => {
    container.innerHTML = ''
    const cells = []
    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement('div')
      dot.className = 'dot'
      dot.classList.toggle('dot--active', index < activeCount)
      dot.style.transitionDelay = `${index * 100}ms`
      cells.push(dot)
    }
    container.append(...cells)
    requestAnimationFrame(() => {
      cells.forEach((dot) => dot.classList.add('is-visible'))
    })
  }

  const deals = document.getElementById('deals-grid')
  const funding = document.getElementById('funding-grid')
  if (deals) createGrid(deals, 100, 2)
  if (funding) createGrid(funding, 100, 17)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.dot').forEach((dot) => dot.classList.add('is-visible'))
        }
      })
    },
    { threshold: 0.4 }
  )

  document.querySelectorAll('.grid-card').forEach((card) => observer.observe(card))
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle()
  initScrollProgress()
  initParallax()
  initRevealOnScroll()
  renderBattleTimeline()
  renderMilitaryChart()
  renderGermanyChart()
  renderRheinmetallChart()
  renderStartupGrids()
})