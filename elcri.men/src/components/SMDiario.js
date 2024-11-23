import React, { useState, useEffect } from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import LazyLoad from 'react-lazyload'

import '../assets/css/trends.css'
import { useIntl } from 'react-intl'

import { titleCasePlaces } from './utils.js'
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
  const [compare30, setCompare30] = useState(null)
  const [groupedStates, setGroupedStates] = useState(null)
  const [maxDate, setMaxDate] = useState(null)
  const [date30, setDate30] = useState(null)
  const [date30_2, setDate30_2] = useState(null)
  const [date60, setDate60] = useState(null)

  const comparison30Days = function (arr, maxDate) {
    maxDate = maxDate + ' 00:00:00 GMT-0600'
    const offset = new Date(maxDate).getTimezoneOffset()
    let maxMinus30Days = new Date(
      new Date().setTime(
        new Date(maxDate).getTime() -
          30 * 24 * 60 * 60 * 1000 -
          offset * 60 * 1000
      )
    ).toISOString()
    let d = new Date(maxMinus30Days)
    d.setDate(d.getDate() + 1)
    setDate30(d)
    setDate30_2(maxMinus30Days)
    let maxMinus60Days = new Date(
      new Date().setTime(
        new Date(maxDate).getTime() -
          60 * 24 * 60 * 60 * 1000 -
          offset * 60 * 1000
      )
    ).toISOString()
    let d2 = new Date(maxMinus60Days)
    d2.setDate(d2.getDate() + 1)
    setDate60(d2)
    let result30 = [],
      result60 = []
    arr.reduce(function (res, value, idx) {
      if (value[3] <= maxMinus30Days) {
        return res
      }
      if (!res[value[0]]) {
        res[value[0]] = { state: value[0], qty30: 0 }
        result30.push(res[value[0]])
      }

      res[value[0]].qty30 += value[2]
      return res
    }, {})

    arr.reduce(function (res, value, idx) {
      if (value[3] <= maxMinus60Days || value[3] > maxMinus30Days) {
        return res
      }
      if (!res[value[0]]) {
        res[value[0]] = { state: value[0], qty60: 0 }
        result60.push(res[value[0]])
      }

      res[value[0]].qty60 += value[2]
      return res
    }, {})

    let arrRes = result30.map((item, i) => Object.assign({}, item, result60[i]))
    arrRes.map((item) => (item.diff = item.qty30 - item.qty60))
    return arrRes.sort((a, b) => (a.diff < b.diff ? 1 : -1))
  }

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
        let maxDate2 = '1900-01-01'
        for (let i = 0; i < l; i++) {
          if (responseJSON[i][2] > max) max = responseJSON[i][2]
          if (responseJSON[i][3] > maxDate2) maxDate2 = responseJSON[i][3]
        }

        setMaxDate(maxDate2 + ' 00:00:00 GMT-0600')
        setMaxCount(max)
        setOrderedStates(states)
        setCompare30(comparison30Days(responseJSON, maxDate2))
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
                  <div className=" has-ratio" key={i+'div'}>
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
                <figure className="image is-16by9" key={i+'figure'}>
                  <div
                    className="has-background-skeleton has-ratio"
                    key={ i + 'div'}
                  ></div>
                </figure>
              </div>
            ))}
      </div>
      <div>
        <hr />
        <div className="box">
          <h3 className="title is-3">
            {' '}
            {intl.formatMessage({
              id: 'difference_20',
            })}
          </h3>
        </div>
        <hr />
        <div className="columns is-centered">
          <div className="column is-6">
            <div className="table-container">
              <table
                id="diff"
                className="table is-striped  is-fullwidth"
                style={{ border: '0px solid #cbcbcb' }}
              >
                <thead>
                  <tr>
                    <th>
                      {intl.formatMessage({
                        id: 'Estado',
                      })}
                    </th>
                    <th align="right">
                      <FormattedDate
                        value={new Date(date30)}
                        year="numeric"
                        month="long"
                        day="numeric"
                        timeZone="UTC"
                      />{' '}
                      {intl.formatMessage({
                        id: 'to2',
                      })}{' '}
                      <FormattedDate
                        value={new Date(maxDate)}
                        year="numeric"
                        month="long"
                        day="numeric"
                        timeZone="UTC"
                      />
                    </th>
                    <th align="right">
                      <FormattedDate
                        value={new Date(date60)}
                        year="numeric"
                        month="long"
                        day="numeric"
                        timeZone="UTC"
                      />{' '}
                      {intl.formatMessage({
                        id: 'to2',
                      })}{' '}
                      <FormattedDate
                        value={new Date(date30_2)}
                        year="numeric"
                        month="long"
                        day="numeric"
                        timeZone="UTC"
                      />
                    </th>
                    <th align="right">
                      {intl.formatMessage({
                        id: 'Difference',
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compare30
                    ? compare30.map((el, index) => {
                        return (
                          <tr key={index}>
                            <td
                              className={
                                intl.locale === 'es' ? 'es_diff' : 'en_diff'
                              }
                              key={index + '1'}
                              style={{ textTransform: 'capitalize' }}
                            >
                              {el.state}
                            </td>
                            <td
                              align="right"
                              className={
                                intl.locale === 'es' ? 'es_diff' : 'en_diff'
                              }
                              key={index + '2'}
                            >
                              {el.qty30}
                            </td>
                            <td
                              align="right"
                              className={
                                intl.locale === 'es' ? 'es_diff' : 'en_diff'
                              }
                              key={index + '3'}
                            >
                              {el.qty60}
                            </td>
                            <td
                              align="right"
                              className={
                                intl.locale === 'es' ? 'es_diff' : 'en_diff'
                              }
                              key={index + '4 '}
                            >
                              {el.diff > 0 ? '+' + el.diff : el.diff}
                            </td>
                          </tr>
                        )
                      })
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMDiario
