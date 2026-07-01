//Import aller Module
import Highcharts from "highcharts"

// Daten aus den CSV Dateien
const deutschlandData = {
  vcFinancing2019: 2000.0, // USD Mio
  vcFinancing2024: 1500.0, // USD Mio
  share2019: 2.9, // Prozent
  share2024: 10.7 // Prozent
}

const verticalFunding2025 = [
  { name: "Fintech", value: 10.6 },
  { name: "Deep Tech", value: 9.9 },
  { name: "Health", value: 8.1 },
  { name: "Enterprise Software", value: 6.3 },
  { name: "Defense security and resilience", value: 4.7 },
  { name: "Energy", value: 4.3 },
  { name: "Transportation", value: 3.2 },
  { name: "Security", value: 2.2 },
  { name: "Defence", value: 1.5 },
  { name: "Marketing", value: 1.4 },
  { name: "Robotics", value: 1.4 },
  { name: "Travel", value: 1.4 },
  { name: "Food", value: 1.2 },
  { name: "Semiconductors", value: 1.2 },
  { name: "Media", value: 0.836 }
]

const verticalGrowth2025 = [
  { name: "Fintech", value: 79 },
  { name: "Deep Tech", value: -9 },
  { name: "Health", value: 5 },
  { name: "Enterprise Software", value: -8 },
  { name: "Defense security and resilience", value: 32 },
  { name: "Energy", value: -32 },
  { name: "Transportation", value: -21 },
  { name: "Security", value: 63 },
  { name: "Defence", value: 132 },
  { name: "Marketing", value: -12 },
  { name: "Robotics", value: -8 },
  { name: "Travel", value: 54 },
  { name: "Food", value: -50 },
  { name: "Semiconductors", value: 44 },
  { name: "Media", value: 1 }
]

document.addEventListener('DOMContentLoaded', function () {
  // 1. Deutschland VC Finanzierung 2019 vs 2024
  Highcharts.chart('deutschland-funding', {
    chart: {
      type: 'column',
      backgroundColor: 'rgba(0,0,0,0)',
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'VC DefTech Finanzierung',
      style: { color: '#8bd7ff', fontSize: '16px', fontWeight: 600 }
    },
    xAxis: {
      categories: ['2019', '2024'],
      labels: { style: { color: '#b9c6da' } },
      lineColor: 'rgba(255,255,255,0.16)'
    },
    yAxis: {
      title: { text: 'USD Millionen', style: { color: '#b9c6da' } },
      labels: { style: { color: '#b9c6da' } },
      gridLineColor: 'rgba(255,255,255,0.16)'
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}',
          style: { color: '#f2f7ff', fontWeight: 'bold' }
        }
      }
    },
    series: [{
      name: 'Finanzierung',
      data: [deutschlandData.vcFinancing2019, deutschlandData.vcFinancing2024],
      color: '#8bd7ff'
    }],
    legend: { enabled: false },
    credits: { enabled: false }
  })

  // 2. Deutschland Anteil an nationaler Finanzierung 2019 vs 2024
  Highcharts.chart('deutschland-share', {
    chart: {
      type: 'column',
      backgroundColor: 'rgba(0,0,0,0)',
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'Anteil nationale Finanzierung',
      style: { color: '#8bd7ff', fontSize: '16px', fontWeight: 600 }
    },
    xAxis: {
      categories: ['2019', '2024'],
      labels: { style: { color: '#b9c6da' } },
      lineColor: 'rgba(255,255,255,0.16)'
    },
    yAxis: {
      title: { text: 'Prozent (%)', style: { color: '#b9c6da' } },
      labels: { style: { color: '#b9c6da' } },
      gridLineColor: 'rgba(255,255,255,0.16)'
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}%',
          style: { color: '#f2f7ff', fontWeight: 'bold' }
        }
      }
    },
    series: [{
      name: 'Anteil',
      data: [deutschlandData.share2019, deutschlandData.share2024],
      color: '#ffc56f'
    }],
    legend: { enabled: false },
    credits: { enabled: false }
  })

  // 3. 2025 VC Funding Horizontal Bar Chart - mit Animation von links
  const fundingData = verticalFunding2025.map(item => item.value)
  const fundingCategories = verticalFunding2025.map(item => item.name)
  
  Highcharts.chart('funding-chart', {
    chart: {
      type: 'column',
      backgroundColor: 'rgba(0,0,0,0)',
      style: { fontFamily: 'inherit' },
      inverted: true,
      marginLeft: 250
    },
    title: {
      text: '2025 VC Funding (USD Billion)',
      style: { color: '#8bd7ff', fontSize: '16px', fontWeight: 600 }
    },
    xAxis: {
      categories: fundingCategories,
      title: { text: null },
      labels: { 
        style: { color: '#b9c6da', fontSize: '12px' },
        align: 'right'
      },
      lineColor: 'rgba(255,255,255,0.16)'
    },
    yAxis: {
      title: { text: 'USD Billion', style: { color: '#b9c6da' } },
      labels: { style: { color: '#b9c6da', fontSize: '11px' } },
      gridLineColor: 'rgba(255,255,255,0.16)',
      tickInterval: 2
    },
    plotOptions: {
      column: {
        pointPadding: 0.1,
        borderWidth: 0,
        animation: {
          duration: 1500,
          easing: 'easeOutQuad'
        },
        dataLabels: {
          enabled: true,
          format: '{point.y:.2f}B',
          style: { color: '#f2f7ff', fontSize: '11px' }
        }
      }
    },
    series: [{
      name: '2025 Funding',
      data: fundingData,
      color: {
        linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
        stops: [
          [0, '#8bd7ff'],
          [1, '#4a9fd8']
        ]
      }
    }],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      formatter: function() {
        return this.series.name + ': <b>$' + this.y.toFixed(2) + 'B</b>'
      }
    }
  })

  // 4. Projected Growth 2025 vs 2024 Horizontal Bar Chart - mit positiven und negativen Werten
  const growthData = verticalGrowth2025.map(item => item.value)
  const growthCategories = verticalGrowth2025.map(item => item.name)
  
  Highcharts.chart('growth-chart', {
    chart: {
      type: 'column',
      backgroundColor: 'rgba(0,0,0,0)',
      style: { fontFamily: 'inherit' },
      inverted: true,
      marginLeft: 0
    },
    title: {
      text: 'Projected Growth 2025 vs 2024 (%)',
      style: { color: '#8bd7ff', fontSize: '16px', fontWeight: 600 }
    },
    xAxis: {
      categories: growthCategories,
      title: { text: null },
      labels: { enabled: false },
      lineColor: 'rgba(255,255,255,0.16)'
    },
    yAxis: {
      title: { text: 'Wachstum (%)', style: { color: '#b9c6da' } },
      labels: { style: { color: '#b9c6da', fontSize: '11px' } },
      gridLineColor: 'rgba(255,255,255,0.16)',
      plotLines: [{
        color: 'rgba(255,255,255,0.3)',
        width: 1,
        value: 0
      }],
      tickInterval: 20
    },
    plotOptions: {
      column: {
        pointPadding: 0.1,
        borderWidth: 0,
        animation: {
          duration: 1500,
          easing: 'easeOutQuad'
        },
        dataLabels: {
          enabled: true,
          format: '{point.y}%',
          style: { color: '#f2f7ff', fontSize: '11px' }
        },
        colorByPoint: true
      }
    },
    series: [{
      name: 'Wachstum',
      data: growthData,
      colors: growthData.map(value => 
        value >= 0 ? '#9df6ca' : '#ff667f'
      )
    }],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      formatter: function() {
        const prefix = this.y >= 0 ? '+' : ''
        return this.series.name + ': <b>' + prefix + this.y + '%</b>'
      }
    }
  })
})
