import React, { useState, useEffect } from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import LazyLoad from 'react-lazyload'

import '../assets/css/trends.css'
import { useIntl } from 'react-intl'

import { titleCasePlaces } from './utils.js'
import { groupBy, map, reduce, sortBy, max, maxBy } from 'lodash-es'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
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

function SMDiario(props) {
  const {
    min_y = 0,
    col_class = 'col-3',
    height = 170,
    backgroundClass = 'line-chart-brown',
    ...restProps
  } = props
  const intl = useIntl()
  //const [setcolors] = useState(['#00BFC4', '#F8766D'])
  const [orderedStates, setOrderedStates] = useState(null)
  const [maxCount, setMaxCount] = useState(0)

  const [groupedStates, setGroupedStates] = useState(null)

  // if (props.title.length > 21) {
  //   let lastComma = props.title.lastIndexOf(',')
  //   if (lastComma) {
  //     let before = props.title.substr(0, lastComma).substr(0, 16)
  //     let after = props.title.substr(lastComma).substr(0, 5)
  //     title = before + '…' + after
  //     titleShortened = true
  //   } else {
  //     title = props.title.substr(0, lastComma).substr(0, 21)
  //     titleShortened = true
  //   }
  // } else title = props.title

  useEffect(() => {
    fetch('https://elcrimen-diario.web.app/states.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        let groups = groupBy(responseJSON, function (x) {
          return x[0]
        })
        setGroupedStates(groups)

        let states = []
        let l = responseJSON.length
        for (let i = 0; i < l; i++)
          if (states.indexOf(responseJSON[i][0]) === -1)
            states.push(responseJSON[i][0])

        let max = 0
        for (let i = 0; i < l; i++)
          if (responseJSON[i][2] > max) max = responseJSON[i][2]

        setMaxCount(max)
        setOrderedStates(states)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const getChartOptions = (state) => ({
    animation: true,
    animationDuration: 0,
    title: {
      text: titleCasePlaces(state),
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
      trigger: 'item',
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
      formatter: function (item) {
        let date = new Date(item.name + 'T12:00:00.000-06:00')
        let datestr = [
          date.toLocaleString(intl.locale, {
            month: 'long',
            day: 'numeric',
            timezone: 'America/Mexico_City',
          }),
          date.getFullYear(),
        ].join(' ')
        let tasa = intl.formatMessage({ id: 'number of homicides:' })
        return `${datestr}<br/>${tasa} <b>${item.value}</b>`
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
        groupedStates === null
          ? null
          : groupedStates[state].map((item) => item[3]),
      axisLabel: {
        fontFamily: 'Arial',
        fontSize: 11,
        color: '#4d4d4d',
        interval: 35,
        formatter: function (value, idx) {
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
        max: maxCount,
        min: 0,
        name: intl.formatMessage({ id: 'count' }),
        nameLocation: 'middle',
        // nameGap: 25,
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
        },
      },
    ],
    series: [
      {
        name: 'lowess',
        type: 'line',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[1]
              }),
        // itemStyle: {
        //   color: '#333',
        // },
        lineStyle: {
          width: 3,
          color: '#268bd2',
        },
        showSymbol: false,
      },
      {
        emphasis: {
          itemStyle: {
            color: 'black',
          },
        },
        name: intl.formatMessage({
          id: 'count',
        }),
        type: 'scatter',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[2]
              }),

        itemStyle: {
          color: 'white',
          borderColor: 'Black',
          opacity: 0.8,
        },
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
      },
    ],
  })

  return (
    <div style={{ borderRadius: '5px', height: '100%' }}>
      <div className="columns is-multiline" id="small-multiples">
        {orderedStates && groupedStates && maxCount
          ? orderedStates.map((state, i) => (
              <div className="column is-3-desktop is-half-tablet" key={i}>
                <figure className="image is-16by9" key={i}>
                  <div className=" has-ratio" key={i}>
                    <LazyLoad height={height} once offset={200}>
                      <ReactEChartsCore
                        echarts={echarts}
                        option={(() => getChartOptions(state))()}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ locale: echarts.registerLocale('ES') }}
                      />
                    </LazyLoad>
                  </div>
                </figure>
              </div>
            ))
          : [...Array(32)].map((e, i) => (
              <div className="column is-3-desktop is-half-tablet" key={i}>
                <figure className="image is-16by9" key={i}>
                  <div
                    className="has-background-skeleton has-ratio"
                    key={i}
                  ></div>
                </figure>
              </div>
            ))}
      </div>
    </div>
  )
}

export default SMDiario
