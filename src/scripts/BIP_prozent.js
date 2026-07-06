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

const countryNameTranslations = {
  'United States': 'Vereinigte Staaten',
  'United Kingdom': 'Vereinigtes Königreich',
  'South Korea': 'Südkorea',
  'North Korea': 'Nordkorea',
  'Czechia': 'Tschechien',
  'Czech Republic': 'Tschechien',
  'Russia': 'Russland',
  'Slovakia': 'Slowakei',
  'Bosnia and Herzegovina': 'Bosnien und Herzegowina',
  'Moldova': 'Moldau',
  'Congo': 'Republik Kongo',
  'Democratic Republic of Congo': 'Demokratische Republik Kongo',
  'United Arab Emirates': 'Vereinigte Arabische Emirate',
  'Saudi Arabia': 'Saudi-Arabien',
  'Turkey': 'Türkei',
  'Ukraine': 'Ukraine',
  'Belarus': 'Belarus',
  'Serbia': 'Serbien',
  'Slovenia': 'Slowenien',
  'Croatia': 'Kroatien',
  'Portugal': 'Portugal',
  'Netherlands': 'Niederlande',
  'Sweden': 'Schweden',
  'Norway': 'Norwegen',
  'Finland': 'Finnland',
  'Austria': 'Österreich',
  'Switzerland': 'Schweiz',
  'Denmark': 'Dänemark',
  'Belgium': 'Belgien',
  'Luxembourg': 'Luxemburg',
  'Ireland': 'Irland',
  'Romania': 'Rumänien',
  'Bulgaria': 'Bulgarien',
  'Greece': 'Griechenland',
  'Hungary': 'Ungarn',
  'Cyprus': 'Zypern',
  'Malta': 'Malta',
  'Latvia': 'Lettland',
  'Lithuania': 'Litauen',
  'Estonia': 'Estland',
  'Poland': 'Polen',
  'Spain': 'Spanien',
  'France': 'Frankreich',
  'Germany': 'Deutschland',
  'Italy': 'Italien',
  'Canada': 'Kanada',
  'Mexico': 'Mexiko',
  'Brazil': 'Brasilien',
  'Argentina': 'Argentinien',
  'Chile': 'Chile',
  'Peru': 'Peru',
  'Colombia': 'Kolumbien',
  'Venezuela': 'Venezuela',
  'Ecuador': 'Ecuador',
  'Bolivia': 'Bolivien',
  'Paraguay': 'Paraguay',
  'Uruguay': 'Uruguay',
  'Guyana': 'Guyana',
  'Suriname': 'Suriname',
  'Australia': 'Australien',
  'New Zealand': 'Neuseeland',
  'Papua New Guinea': 'Papua-Neuguinea',
  'Fiji': 'Fidschi',
  'Samoa': 'Samoa',
  'Tonga': 'Tonga',
  'Vanuatu': 'Vanuatu',
  'Solomon Islands': 'Salomonen',
  'Japan': 'Japan',
  'China': 'China',
  'India': 'Indien',
  'Pakistan': 'Pakistan',
  'Bangladesh': 'Bangladesch',
  'Sri Lanka': 'Sri Lanka',
  'Nepal': 'Nepal',
  'Bhutan': 'Bhutan',
  'Afghanistan': 'Afghanistan',
  'Iran': 'Iran',
  'Iraq': 'Irak',
  'Israel': 'Israel',
  'Jordan': 'Jordanien',
  'Syria': 'Syrien',
  'Lebanon': 'Libanon',
  'Indonesia': 'Indonesien',
  'Malaysia': 'Malaysia',
  'Thailand': 'Thailand',
  'Vietnam': 'Vietnam',
  'Philippines': 'Philippinen',
  'Singapore': 'Singapur',
  'Myanmar': 'Myanmar',
  'Cambodia': 'Kambodscha',
  'Laos': 'Laos',
  'Mongolia': 'Mongolei',
  'Kazakhstan': 'Kasachstan',
  'Egypt': 'Ägypten',
  'Morocco': 'Marokko',
  'Tunisia': 'Tunesien',
  'Libya': 'Libyen',
  'Sudan': 'Sudan',
  'South Africa': 'Südafrika',
  'Nigeria': 'Nigeria',
  'Kenya': 'Kenia',
  'Ethiopia': 'Äthiopien',
  'Ghana': 'Ghana',
  'Tanzania': 'Tansania',
  'Uganda': 'Uganda',
  'Angola': 'Angola',
  'Cameroon': 'Kamerun',
  'Senegal': 'Senegal',
  'Côte d’Ivoire': 'Côte d’Ivoire',
  'Cote dIvoire': 'Côte d’Ivoire'
}

function translateCountryName(name) {
  if (name === null || name === undefined) return ''
  const trimmed = String(name).trim()
  return countryNameTranslations[trimmed] || trimmed
}

function getCountryAliases(name) {
  const normalized = String(name).trim()
  const translated = translateCountryName(name)
  return [normalized, translated].filter(Boolean)
}

function toNumber(value) {
  if (value === null || value === undefined) return null

  const cleaned = String(value).trim()
  if (cleaned === 'k.A.' || cleaned === 'k.A' || cleaned === '') return null

  const normalized = cleaned.replace(/\s/g, '')
  if (normalized.includes(',') && normalized.includes('.')) {
    const lastComma = normalized.lastIndexOf(',')
    const lastDot = normalized.lastIndexOf('.')
    return Number(lastComma > lastDot
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, ''))
  }

  if (normalized.includes(',')) {
    return Number(normalized.replace(',', '.'))
  }

  const number = Number(normalized)
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
  const iconSun = button?.querySelector('.icon-sun')
  const iconMoon = button?.querySelector('.icon-moon')
  const storedTheme = localStorage.getItem('theme')

  const applyTheme = (theme) => {
    const isDark = theme === 'dark'
    document.body.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    if (iconSun && iconMoon) {
      iconSun.style.display = isDark ? 'none' : 'block'
      iconMoon.style.display = isDark ? 'block' : 'none'
    }
  }

  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    applyTheme('dark')
  } else {
    applyTheme('light')
  }

  if (!button) return
  button.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark'
    applyTheme(nextTheme)
  })
}

function getRegionCountries(region) {
  if (region === 'all') return [...militaryCountries]

  const group = regionGroups[region] || []
  const normalizedGroup = group.map(normalizeName)
  return militaryCountries.filter(country => {
    const aliases = getCountryAliases(country)
    return aliases.some(alias => normalizedGroup.includes(normalizeName(alias)))
  })
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

function formatPercentValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return Highcharts.numberFormat(value, 2, ',', '.')
}

function createMilitaryChart(data) {
  const yearIndex = data.header.findIndex(column => normalizeName(column) === normalizeName('Year'))
  const countryIndex = data.header.findIndex(column => normalizeName(column) === normalizeName('Entity'))
  const valueIndex = data.header.findIndex(column => normalizeName(column).includes(normalizeName('Military expenditure')) && normalizeName(column).includes(normalizeName('GDP')))

  const yearSet = new Set()
  const countryMap = new Map()

  data.rows.forEach(row => {
    const rawCountry = row[countryIndex]
    const country = translateCountryName(rawCountry)
    const year = Number(row[yearIndex])
    const value = toNumber(row[valueIndex])
    if (!country || !Number.isFinite(year) || value === null || year < 2015 || year > 2025) return

    yearSet.add(String(year))
    if (!countryMap.has(country)) {
      countryMap.set(country, new Map())
    }
    countryMap.get(country).set(String(year), value)
  })

  const categories = [...yearSet].sort((a, b) => Number(a) - Number(b))
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
      labels: {
        style: { color: 'var(--muted)' },
        formatter: function () {
          return formatPercentValue(this.value)
        }
      },
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
      valueDecimals: 2,
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:,.2f}</b> %<br/>',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      style: { color: '#fff' }
    }
  })

  updateSeriesVisibilityForCountries(getRegionCountries(currentRegion))
}

function createBipChart(bipData, militaryData = null) {
  const filteredRows = bipData.rows.filter(row => Number(row[0]) >= 2015)
  const years = filteredRows.map(row => row[0])
  const values = filteredRows.map(row => toNumber(row[1]))

  let militaryValues = []
  if (militaryData) {
    const militaryYearIndex = militaryData.header.findIndex(column => normalizeName(column) === normalizeName('Year'))
    const militaryCountryIndex = militaryData.header.findIndex(column => normalizeName(column) === normalizeName('Entity'))
    const militaryValueIndex = militaryData.header.findIndex(column => normalizeName(column).includes(normalizeName('Military expenditure')) && normalizeName(column).includes(normalizeName('GDP')))

    const germanyMilitaryMap = new Map()
    militaryData.rows.forEach(row => {
      const country = translateCountryName(row[militaryCountryIndex])
      if (country !== 'Deutschland') return

      const year = Number(row[militaryYearIndex])
      const value = toNumber(row[militaryValueIndex])
      if (Number.isFinite(year) && value !== null) {
        germanyMilitaryMap.set(String(year), value)
      }
    })

    militaryValues = years.map(year => germanyMilitaryMap.has(String(year)) ? germanyMilitaryMap.get(String(year)) : null)
  }

  Highcharts.chart('bip-chart', {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'BIP-Wachstum und deutsche Militärausgaben 2015–2025',
      style: { color: 'var(--accent)', fontSize: '1rem', fontWeight: '700' }
    },
    xAxis: {
      categories: years,
      title: { text: null },
      labels: { style: { color: 'var(--muted)' } },
      lineColor: 'rgba(107, 114, 128, 0.24)'
    },
    yAxis: {
      title: { text: '%', style: { color: 'var(--muted)' } },
      labels: {
        style: { color: 'var(--muted)' },
        formatter: function () {
          return formatPercentValue(this.value)
        }
      },
      gridLineColor: 'rgba(107, 114, 128, 0.18)'
    },
    series: [{
      name: 'BIP-Wachstum',
      data: values,
      color: 'var(--accent)',
      marker: { enabled: false }
    }, {
      name: 'Militärausgaben Deutschland',
      data: militaryValues,
      color: '#d97706',
      marker: { enabled: false }
    }],
    credits: { enabled: false },
    tooltip: {
      shared: true,
      valueDecimals: 2,
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:,.2f}</b> %<br/>',
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
  const data = await loadCSV("data_raw/military-spending/military-spending.csv")
  createMilitaryChart(data)
}

async function loadBipSection() {
  const [bipData, militaryData] = await Promise.all([
    loadCSV("data_raw/BIP_Deutschland/BIP_Wachstum_92_25.csv"),
    loadCSV("data_raw/military-spending/military-spending.csv")
  ])
  createBipChart(bipData, militaryData)
}

document.addEventListener('DOMContentLoaded', () => {
  initializeThemeToggle()
  initializeRegionFilter()
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress)
  observeSections()
})
