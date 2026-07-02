import Highcharts from "highcharts"

const regionGroups = {
  top5eu: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Polen'],
  europe: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Portugal', 'Niederlande', 'Belgien', 'Luxemburg', 'Österreich', 'Schweiz', 'Dänemark', 'Schweden', 'Norwegen', 'Finnland', 'Polen', 'Tschechien', 'Slowakei', 'Ungarn', 'Rumänien', 'Bulgarien', 'Griechenland', 'Kroatien', 'Serbien', 'Slowenien', 'Bosnien und Herzegowina', 'Montenegro', 'Nordmazedonien', 'Albanien', 'Irland', 'Vereinigtes Königreich', 'Island', 'Ukraine', 'Belarus', 'Litauen', 'Lettland', 'Estland', 'Moldau', 'Russland'],
  eu: ['Belgien','Bulgarien','Dänemark','Deutschland','Estland','Finnland','Frankreich','Griechenland','Irland','Italien','Kroatien','Lettland','Litauen','Luxemburg','Malta','Niederlande','Österreich','Polen','Portugal','Rumänien','Schweden','Slowakei','Slowenien','Spanien','Tschechien','Ungarn','Zypern'],
  nato: ['Albanien','Belgien','Bulgarien','Dänemark','Deutschland','Estland','Finnland','Frankreich','Griechenland','Island','Italien','Kanada','Lettland','Litauen','Luxemburg','Montenegro','Niederlande','Nordmazedonien','Norwegen','Polen','Portugal','Rumänien','Slowakei','Slowenien','Spanien','Tschechien','Türkei','Ungarn','Vereinigtes Königreich','Vereinigte Staaten'],
  asia: ['China', 'Japan', 'Südkorea', 'Nordkorea', 'Indien', 'Pakistan', 'Bangladesch', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan', 'Iran', 'Irak', 'Türkei', 'Saudi-Arabien', 'Vereinigte Arabische Emirate', 'Katar', 'Kuwait', 'Oman', 'Israel', 'Jordanien', 'Syrien', 'Libanon', 'Indonesien', 'Malaysia', 'Thailand', 'Vietnam', 'Philippinen', 'Singapur', 'Myanmar', 'Kambodscha', 'Laos', 'Mongolei', 'Kasachstan'],
  africa: ['Ägypten', 'Marokko', 'Algerien', 'Tunesien', 'Libyen', 'Sudan', 'Südafrika', 'Nigeria', 'Kenia', 'Äthiopien', 'Ghana', 'Tansania', 'Uganda', 'Angola', 'Kamerun', 'Senegal', 'Côte d’Ivoire', 'Demokratische Republik Kongo', 'Republik Kongo', 'Namibia', 'Botswana', 'Simbabwe'],
  northamerica: ['Kanada', 'USA', 'Mexiko', 'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Kuba', 'Jamaika', 'Haiti', 'Dominikanische Republik'],
  southamerica: ['Brasilien', 'Argentinien', 'Chile', 'Peru', 'Kolumbien', 'Venezuela', 'Ecuador', 'Bolivien', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname'],
  oceania: ['Australien', 'Neuseeland', 'Papua-Neuguinea', 'Fidschi', 'Samoa', 'Tonga', 'Vanuatu', 'Salomonen']
}

let militaryChart = null
let militaryCountries = []

function toNumber(value) {
  if (value === null || value === undefined) return null
  const cleaned = String(value).trim().replace(/\./g, '').replace(',', '.')
  if (cleaned === 'k.A.' || cleaned === 'k.A' || cleaned === '') return null
  const number = Number(cleaned)
  return Number.isNaN(number) ? null : number
}

function normalizeName(name) {
  return String(name)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase()
}

function parseCSV(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  const delimiter = lines[0].includes(';') ? ';' : ','
  const header = lines[0].split(delimiter).map(h => h.trim())
  const rows = []

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(delimiter).map(part => part.trim())
    rows.push(parts)
  }

  return { header, rows }
}


async function loadCSV(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`CSV konnte nicht geladen werden: ${path}`)
  }
  const text = await response.text()
  return parseCSV(text)
}

function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
  const bar = document.getElementById('scroll-progress')
  if (bar) {
    bar.style.width = `${progress}%`
  }
}

function initializeThemeToggle() {
  const button = document.getElementById('theme-toggle')
  const storedTheme = localStorage.getItem('theme')

  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark')
  }

  if (!button) return
  button.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  })
}

function getRegionCountries(region) {
  if (region === 'all') return [...militaryCountries]

  const group = regionGroups[region] || []
  const normalizedGroup = group.map(normalizeName)
  return militaryCountries.filter(country => normalizedGroup.includes(normalizeName(country)))
}

function updateSeriesVisibilityForCountries(countries) {
  if (!militaryChart) return
  militaryChart.series.forEach(series => {
    const shouldShow = countries.includes(series.name)
    series.update({ visible: shouldShow, showInLegend: shouldShow }, false)
  })
  militaryChart.redraw()
  renderMilitaryLegend(currentRegion)
}

function renderMilitaryLegend(region = currentRegion) {
  const container = document.getElementById('military-legend')
  if (!container || !militaryChart) return

  const selectedCountries = getRegionCountries(region)
  container.innerHTML = ''

  const legendList = document.createElement('div')
  legendList.className = 'legend-items'

  selectedCountries.forEach(country => {
    const series = militaryChart.series.find(item => item.name === country)
    if (!series) return

    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'legend-item'
    if (!series.visible) item.classList.add('disabled')
    item.innerHTML = `
      <span class="legend-swatch" style="background: ${series.color || 'var(--accent)'}"></span>
      <span class="legend-label">${country}</span>
    `

    item.addEventListener('click', () => {
      const visible = !series.visible
      series.update({ visible, showInLegend: visible }, false)
      militaryChart.redraw()
      item.classList.toggle('disabled', !visible)
    })

    legendList.appendChild(item)
  })

  if (selectedCountries.length === 0) {
    container.textContent = 'Keine Daten für diese Kategorie verfügbar.'
  } else {
    container.appendChild(legendList)
  }
}

let currentRegion = 'top5eu'

function buildCountryLegend(region = currentRegion) {
  currentRegion = region
  const filterSelect = document.getElementById('region-filter')
  if (filterSelect) filterSelect.value = region
  renderMilitaryLegend(region)
}

function initializeRegionFilter() {
  const filterSelect = document.getElementById('region-filter')
  if (!filterSelect) return
  filterSelect.addEventListener('change', event => {
    const region = event.target.value
    currentRegion = region
    updateSeriesVisibilityForCountries(getRegionCountries(region))
  })
}

function createMilitaryChart(data) {
  const yearIndex = data.header.findIndex(column => normalizeName(column) === normalizeName('Jahr'))
  const countryIndex = data.header.findIndex(column => normalizeName(column) === normalizeName('Land'))
  const valueIndex = data.header.findIndex(column => normalizeName(column).includes(normalizeName('Anteil_BIP_Prozent')))

  const yearSet = new Set()
  const countryMap = new Map()

  data.rows.forEach(row => {
    const country = row[countryIndex]
    const year = row[yearIndex]
    const value = toNumber(row[valueIndex])
    if (!country || !year || value === null) return

    yearSet.add(year)
    if (!countryMap.has(country)) {
      countryMap.set(country, new Map())
    }
    countryMap.get(country).set(year, value)
  })

  const categories = [...yearSet].sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
  militaryCountries = [...countryMap.keys()].sort((a, b) => normalizeName(a).localeCompare(normalizeName(b)))

  const series = militaryCountries.map(country => {
    const countryYears = countryMap.get(country)
    return {
      name: country,
      data: categories.map(year => countryYears.has(year) ? countryYears.get(year) : null),
      visible: getRegionCountries(currentRegion).includes(country),
      marker: { enabled: false }
    }
  })

  militaryChart = Highcharts.chart('military-chart', {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      animation: { duration: 1200 },
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'Militärausgaben als Anteil des BIP',
      style: { color: 'var(--accent)', fontSize: '1rem', fontWeight: '700' }
    },
    xAxis: {
      categories,
      title: { text: null },
      labels: { style: { color: 'var(--muted)' } },
      lineColor: 'rgba(107, 114, 128, 0.24)',
      tickmarkPlacement: 'on'
    },
    yAxis: {
      title: { text: '% des BIP', style: { color: 'var(--muted)' } },
      labels: { style: { color: 'var(--muted)' } },
      gridLineColor: 'rgba(107, 114, 128, 0.18)' 
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        animation: { duration: 1000 },
        turboThreshold: 500,
        states: {
          inactive: {
            opacity: 0.25
          }
        }
      }
    },
    series,
    credits: { enabled: false },
    tooltip: {
      valueSuffix: ' %',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      style: { color: '#fff' }
    }
  })

  // Use Highcharts legend; show only current region series
  updateSeriesVisibilityForCountries(getRegionCountries(currentRegion))
}

function createBipChart(data) {
  const years = data.rows.map(row => row[0])
  const values = data.rows.map(row => toNumber(row[1]))

  Highcharts.chart('bip-chart', {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'BIP-Wachstum Deutschland 1992–2025',
      style: { color: 'var(--accent)', fontSize: '1rem', fontWeight: '700' }
    },
    xAxis: {
      categories: years,
      title: { text: null },
      labels: { style: { color: 'var(--muted)' } },
      lineColor: 'rgba(107, 114, 128, 0.24)'
    },
    yAxis: {
      title: { text: 'Wachstum (%)', style: { color: 'var(--muted)' } },
      labels: { style: { color: 'var(--muted)' } },
      gridLineColor: 'rgba(107, 114, 128, 0.18)' 
    },
    series: [{
      name: 'Wachstum',
      data: values,
      color: 'var(--accent)',
      marker: { enabled: false }
    }],
    credits: { enabled: false },
    tooltip: {
      valueSuffix: ' %',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      style: { color: '#fff' }
    }
  })
}

function observeSections() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const target = entry.target
        target.classList.add('is-visible')

        if (target.classList.contains('section-militaer')) {
          loadMilitarySection()
          obs.unobserve(target)
        }

        if (target.classList.contains('section-bip')) {
          loadBipSection()
          obs.unobserve(target)
        }
      })
    },
    { threshold: 0.2 }
  )

  document.querySelectorAll('.reveal-on-scroll').forEach(section => observer.observe(section))
}

async function loadMilitarySection() {
  if (militaryChart) return
  const data = await loadCSV("data_raw/Militaerausgaben/sipri_militaerausgaben_alle_laender_2015_2024_DE-1.csv")
  createMilitaryChart(data)
}

async function loadBipSection() {
  const data = await loadCSV("data_raw/BIP_Deutschland/BIP_Wachstum_92_25.csv")
  createBipChart(data)
}

document.addEventListener('DOMContentLoaded', () => {
  initializeThemeToggle()
  initializeRegionFilter()
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress)
  observeSections()
})
