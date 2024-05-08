import React from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import { timeFormat as date_format } from 'd3-time-format'
import { timeFormatDefaultLocale } from 'd3-time-format'
import LazyLoad from 'react-lazyload'

import '../assets/css/trends.css'
import { useIntl } from 'react-intl'
import { dateLoc } from '../../src/i18n'

import { titleCasePlaces } from './utils.js'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
} from 'echarts/components'
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  ToolboxComponent,
])

const round = format('.0f')
const round1 = format('.1f')
const comma = format(',')

function SmallMultiple(props) {
  const {
    min_y = 0,
    col_class = 'col-3',
    height = 170,
    backgroundClass = 'line-chart-brown',
    ...restProps
  } = props
  const intl = useIntl()
  let l, title, titleShortened
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null

  if (props.title.length > 21) {
    let lastComma = props.title.lastIndexOf(',')
    if (lastComma) {
      let before = props.title.substr(0, lastComma).substr(0, 16)
      let after = props.title.substr(lastComma).substr(0, 5)
      title = before + '…' + after
      titleShortened = true
    } else {
      title = props.title.substr(0, lastComma).substr(0, 21)
      titleShortened = true
    }
  } else title = props.title

  title = titleCasePlaces(title)

  let chartOption = {
    animation: true,
    animationDuration: 0,
    title: {
      text: title,
      top: '3%',
      left: 'center',
      textStyle: {
        fontFamily: 'system-ui',
        fontSize: 13.5,
        fontWeight: 'bold',
        color: '#111',
      },
    },
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#111',
        fontFamily: 'Roboto Condensed',
      },
      axisPointer: {
        animation: false,
      },
      formatter: function(item) {
        let d = props.formatData(props.data)
        let date = new Date(item[0].name)
        let datestr = [
          date.toLocaleString(intl.locale, { month: 'long' }),
          date.getFullYear(),
        ].join(' ')

        let rate_snsp =
          typeof item[0].value === 'undefined' ? '-' : round1(item[0].value)

        if (item.length === 2) {
          //(INEGI and SNSP)
          let rate_inegi =
            typeof item[1].value === 'undefined' ? '-' : round1(item[1].value)
          let num_inegi =
            d[1][item[1].dataIndex].count === null
              ? '-'
              : comma(d[1][item[0].dataIndex].count)
          let num_snsp =
            d[0][item[0].dataIndex].count === null
              ? '-'
              : comma(d[0][item[1].dataIndex].count)
          return (
            `${datestr}<br/>` +
            `<b><span class="inegi-adjusted">INEGI</span></b>: ${rate_inegi}` +
            (num_inegi === '-' ? '-<br/>' : `: (${num_inegi})<br/>`) +
            `<b><span class="snsp">SNSP</span></b>: ${rate_snsp}: (${num_snsp})<br/>`
          )
        } else {
          // array (just SNSP)
          let num_snsp =
            d[0][item[0].dataIndex].count === null
              ? '-'
              : comma(d[0][item[0].dataIndex].count)
          return (
            `${datestr}<br/>` +
            `<b><span class="snsp">SNSP</span></b>: ${rate_snsp}: (${num_snsp})<br/>`
          )
        }
      },
    },
    grid: {
      left: '45',
      right: '6%',
      bottom: '16%',
      top: '25%',
      containLabel: false,
    },
    xAxis: {
      animation: false,
      type: 'category',
      data:
        props.data === null
          ? null
          : props.formatData(props.data)[0].map(item => item.date),
      axisLabel: {
        fontFamily: 'Arial',
        fontSize: 11,
        color: '#4d4d4d',
        interval: 35,
        formatter: function(value, idx) {
          var date = new Date(value)
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear() - 2000,
          ].join(' ')
        },
      },
      boundaryGap: false,
      splitNumber: 2,
    },
    yAxis: [
      {
        animation: false,
        //max: props.max_rate,
        //min: 0,
        name: intl.formatMessage({ id: 'tasa anualizada' }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial', fontSize: 11, color: '#222' },
        type: 'value',
        scale: false,
        splitNumber: 2,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: '#b3b2b2',
            width: 0.4,
          },
        },
        axisLabel: {
          fontFamily: 'Arial',
          fontSize: 11,
          color: '#4d4d4d',
          interval: 35,
          margin: 0,
          padding: [0, 2, 0, 0],
          formatter: function(value, index) {
            return round(value)
          },
        },
      },
    ],
    series: [
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'SNSP',
        type: 'line',
        data:
          props.data === null
            ? null
            : props.formatData(props.data)[0].map((item, i) => {
                return item.rate
              }),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 1.2,
          color: '#008085',
        },
        showSymbol: false,
      },
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'INEGI',
        type: 'line',
        data:
          props.data === null
            ? null
            : props.data.length !== 2
            ? null
            : props.formatData(props.data)[1].map((item, i) => {
                return item.rate
              }),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 1.2,
          color: '#E81208',
        },
        showSymbol: false,
      },
    ],
  }

  if (titleShortened) {
    chartOption.toolbox = {
      show: true,
      left: 'right',
      showTitle: false,
      itemSize: 13,
      iconStyle: {
        color: '#ece8d7',
        borderJoin: 'round',
        borderWidth: 1.5,
        borderColor: '#111',
        borderCap: 'round',
      },
      tooltip: {
        show: true,
        position: 'left',
        padding: 2,
        formatter: () => props.title,
      },
      feature: {
        // saveAsImage: {
        //   show: true,
        //   },
        myInfo: {
          show: true,
          title: 'robo',
          icon:
            'path://M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z',
          onclick: function() {
            return null
          },
        },
      },
    }
  }

  if (typeof props.max_rate != 'undefined') {
    chartOption.yAxis[0].max = props.max_rate
    chartOption.yAxis[0].min = 0
    chartOption.yAxis[0].splitLine.lineStyle.color = [
      '#b3b2b2',
      '#b3b2b2',
      '#b3b2b2',
      'transparent',
    ]
  }

  return (
    <div
      style={{ borderRadius: '5px', height: '100%' }}
      className={backgroundClass || 'line-chart-brown'}
    >
      <LazyLoad height={height} once offset={200}>
        <ReactEChartsCore
          echarts={echarts}
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ locale: echarts.registerLocale('ES') }}
        />
      </LazyLoad>
    </div>
  )
}

export default SmallMultiple
