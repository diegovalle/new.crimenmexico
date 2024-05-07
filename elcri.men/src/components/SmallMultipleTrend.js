import React from 'react'
import { timeFormatDefaultLocale } from 'd3-time-format'
import { useIntl } from 'react-intl'
import { dateLoc } from '../../src/i18n'
import LazyLoad from 'react-lazyload'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
} from 'echarts/components'
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers'

import '../assets/css/trends.css'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
])

function SmallMultipleTrend(props) {
  const {
    min_y = 0,
    col_class = 'col-3',
    height = 170,
    backgroundClass = 'line-chart-brown',
    ...restProps
  } = props

  const intl = useIntl()
  let l
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null
  let data = props.formatData(props.data)

  let chartOption = {
    animation: false,
    title: {
      text: Object.keys(props.data)[0],
      left: 'center',
      textStyle: {
        fontFamily: 'Trebuchet MS',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        label: {
          backgroundColor: '#ccc',
          borderColor: '#aaa',
          borderWidth: 0.1,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          color: '#111',
          fontFamily: 'Roboto Condensed',
        },
      },
      formatter: function(item) {
        let date = new Date(item[0].name)
        let datestr = [
          date.toLocaleString(intl.locale, { month: 'long' }),
          date.getFullYear(),
        ].join(' ')
        let tasa = intl.formatMessage({ id: 'tasa anualizada' })
        return `${datestr}<br/>${tasa}: <b>${item[0].value}</b>`
      },
    },
    grid: {
      top: '10%',
      left: '15%',
      right: '4%',
      bottom: '26%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: data[0].map(function(item) {
        return item.date
      }),
      axisLabel: {
        interval: 35,
        formatter: function(value, idx) {
          var date = new Date(value)
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear(),
          ].join('\n')
        },
      },
      boundaryGap: false,
      splitNumber: 2,
    },
    yAxis: [
      {
        name: intl.formatMessage({ id: 'tasa anualizada' }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial' },
        type: 'value',
        scale: false,
        splitNumber: 3,
        interval:
          Math.round(Math.round((((props.max_y + 5) / 10) * 10) / 3) / 10) * 10,
        max: Math.round((props.max_y + 5) / 10) * 10,
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', 'transparent'],
            type: 'solid',
          },
        },
        axisLabel: {
          margin: 0,
          padding: [0, 5, 0, 0],
          formatter: (v, i) => (i < 4 ? v : ''),
          interval: (index, value) => {
            if (value % 10 === 0) return true
          },
        },
      },
    ],
    series: [
      {
        name: 'data points',
        emphasis: {
          itemStyle: {
            color: 'black',
            borderColor: 'Black',
            opacity: 1,
          },
        },
        type: 'scatter',
        data: data[1].map(function(item) {
          return item.value
        }),
        itemStyle: {
          color: 'white',
          borderColor: 'Black',
          opacity: .8,
        },
        symbol: 'circle',
        symbolSize: 5,
        //showSymbol: false,
        z: 1000,
      },
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'L',
        type: 'line',
        data: data[0].map(function(item) {
          return item.l
        }),
        lineStyle: {
          opacity: 0,
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'U',
        type: 'line',
        data: data[0].map(function(item) {
          return item.u - item.l
        }),
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: '#777',
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        emphasis: {
          lineStyle: { width: 2.5 },
        },
        name: 'median',
        type: 'line',
        data: data[0].map(function(item) {
          return item.value
        }),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 2.5,
          color:
            props.data.trend[0] === 'positive'
              ? '#ef3b2c'
              : props.data.trend[0] === 'negative'
              ? '#225ea8'
              : '#252525',
        },
        showSymbol: false,
        symbol: 'none',
      },
    ],
  }

  return (
    <LazyLoad height={height} once offset={200}>
      <ReactEChartsCore
        echarts={echarts}
        option={chartOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ locale: echarts.registerLocale('ES') }}
      />
    </LazyLoad>
  )
}

export default SmallMultipleTrend
