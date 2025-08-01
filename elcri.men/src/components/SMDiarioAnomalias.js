import React, { useState, useEffect } from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import LazyLoad from 'react-lazyload'

import '../assets/css/trends.css'
import { useIntl } from 'react-intl'

import { titleCasePlaces, pretty } from './utils.js'
import { groupBy, map, reduce, sortBy, max, maxBy } from 'lodash-es'
import { FormattedDate } from 'react-intl'

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

import '../components/TendenciaNacional/diff_es.css'
import '../components/TendenciaNacional/diff_en.css'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  ToolboxComponent,
])

const round1 = format('.1f')

function SMDiarioAnomalias(props) {
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
  const [compare30, setCompare30] = useState(null)
  const [groupedStates, setGroupedStates] = useState(null)
  const [maxDate, setMaxDate] = useState(null)
  const [date30, setDate30] = useState(null)
  const [date30_2, setDate30_2] = useState(null)
  const [date60, setDate60] = useState(null)

  useEffect(() => {
    fetch('https://diario.elcri.men/states_anomalies.json')
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
        let maxDate2 = '1900-01-01'
        for (let i = 0; i < l; i++) {
          if (responseJSON[i][2] > max) max = responseJSON[i][2]
          if (responseJSON[i][3] > maxDate2) maxDate2 = responseJSON[i][3]
        }

        setMaxDate(maxDate2 + ' 00:00:00 GMT-0600')
        setMaxCount(max)
        setOrderedStates(states)
        // setCompare30(comparison30Days(responseJSON, maxDate2))
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
        ].join(' ')
        return (
          datestr +
          '<br/>' +
          intl.formatMessage({ id: 'number of homicides' }) +
          ': <b>' +
          item.value +
          '</b>'
        )
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
        interval: 11,
        formatter: function (value, idx) {
          var date = new Date(value)
          return [
            date.getDate(),
            date.toLocaleString(intl.locale, { month: 'short' }),
          ].join(' ')
        },
      },
      boundaryGap: false,
      splitNumber: 2,
    },
    yAxis: [
      {
        animation: false,
        min: 0,
        name: intl.formatMessage({ id: 'number of homicides' }),
        nameLocation: 'middle',
        // nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial', fontSize: 11, color: '#222' },
        type: 'value',
        scale: false,
        //splitNumber: 3,
        interval:
          pretty([0, maxCount], 2).at(1) - pretty([0, maxCount], 2).at(0),
        max: pretty([0, maxCount], 2).at(-1),
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', 'transparent'],
            type: 'solid',
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
        name: 'number of homicides',
        type: 'scatter',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[2]
              }),
        symbolSize: 6,
        itemStyle: {
          color: 'darkgray',
          opacity: 0.8,
        },
        // lineStyle: {
        //   width: 3,
        //   color:
        //     groupedStates === null
        //       ? null
        //       : groupedStates[state][0][4] === -1
        //       ? '#268bd2' //#268bd2
        //       : groupedStates[state][0][4] === 0
        //       ? '#268bd2'
        //       : '#268bd2', // red
        // },
        showSymbol: false,
      },
      {
        name: 'anomalies',
        type: 'scatter',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                if (item[6] === 1) return item[2]
                else return null
              }),

        symbolSize: 7,
        itemStyle: {
          color: 'red',
          opacity: 0.8,
          borderColor: 'black',
        },
        // lineStyle: {
        //   width: 3,
        //   color:
        //     groupedStates === null
        //       ? null
        //       : groupedStates[state][0][4] === -1
        //       ? '#268bd2' //#268bd2
        //       : groupedStates[state][0][4] === 0
        //       ? '#268bd2'
        //       : '#268bd2', // red
        // },
        showSymbol: false,
      },
      {
        name: 'trend',
        type: 'line',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[5]
              }),
        itemStyle: {
          color: '#111',
        },
        // lineStyle: {
        //   width: 3,
        //   color:
        //     groupedStates === null
        //       ? null
        //       : groupedStates[state][0][4] === -1
        //       ? '#268bd2' //#268bd2
        //       : groupedStates[state][0][4] === 0
        //       ? '#268bd2'
        //       : '#268bd2', // red
        // },
        showSymbol: false,
      },
    ],
  })

  return (
    <div style={{ borderRadius: '5px', height: '100%' }}>
      <div className="columns is-multiline" id="small-multiples-anomaly">
        {orderedStates && groupedStates && maxCount
          ? orderedStates.map((state, i) => (
              <div className="column is-3-desktop is-half-tablet" key={i}>
                <figure className="image is-16by9" key={i}>
                  <div className=" has-ratio" key={i + 'div'}>
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
          : [...Array(8)].map((e, i) => (
              <div className="column is-3-desktop is-half-tablet" key={i}>
                <figure className="image is-16by9" key={i + 'figure'}>
                  <div
                    className="has-background-skeleton has-ratio"
                    key={i + 'div'}
                  ></div>
                </figure>
              </div>
            ))}
      </div>
      <div></div>
    </div>
  )
}

export default SMDiarioAnomalias
