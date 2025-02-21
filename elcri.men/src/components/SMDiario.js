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

const mexicanStates = {
  aguascalientes: 1434635,
  'baja california': 3769020,
  'baja california sur': 798447,
  campeche: 928363,
  chiapas: 5543828,
  chihuahua: 3741869,
  coahuila: 3146771,
  colima: 731391,
  'ciudad de mexico': 9209944,
  durango: 1832650,
  guanajuato: 6166934,
  guerrero: 3540685,
  hidalgo: 3082841,
  jalisco: 8348151,
  mexico: 16992418,
  michoacan: 4748846,
  morelos: 1971520,
  nayarit: 1235456,
  'nuevo leon': 5784442,
  oaxaca: 4132148,
  puebla: 6583278,
  queretaro: 2368467,
  'quintana roo': 1857985,
  'san luis potosi': 2822255,
  sinaloa: 3026943,
  sonora: 2944840,
  tabasco: 2402598,
  tamaulipas: 3527735,
  tlaxcala: 1342977,
  veracruz: 8062579,
  yucatan: 2320898,
  zacatecas: 1622138,
}

function areProportionsDifferent(x1, n1, x2, n2, alpha = 0.05) {
  // Validate inputs
  if (n1 === 0 || n2 === 0) {
    throw new Error('Sample sizes n1 and n2 must be greater than 0.')
  }
  if (x1 < 0 || x2 < 0) {
    throw new Error('Number of successes cannot be negative.')
  }
  if (x1 > n1 || x2 > n2) {
    throw new Error('Number of successes cannot exceed sample size.')
  }

  // Calculate proportions
  const p1 = x1 / n1
  const p2 = x2 / n2

  // Pooled proportion
  const pooledP = (x1 + x2) / (n1 + n2)

  // Standard error
  const SE = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2))

  // Handle case where there's no variation (both proportions are 0 or 1)
  if (SE === 0) {
    return false // Proportions are identical
  }

  // Z-score
  const z = (p1 - p2) / SE

  // Calculate p-value for two-tailed test
  const pValue = 2 * (1 - normCDF(Math.abs(z)))

  // Check statistical significance
  return pValue < alpha
}

function normCDF(z) {
  // Implements the Zelen & Severo approximation for the standard normal CDF
  const absZ = Math.abs(z)
  const a1 = 0.31938153
  const a2 = -0.356563782
  const a3 = 1.781477937
  const a4 = -1.821255978
  const a5 = 1.330274429
  const p = 0.2316419

  const t = 1 / (1 + p * absZ)
  const tTerm = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))))
  const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI)
  let cdf = 1 - pdf * tTerm

  // Adjust if z is negative
  if (z < 0) {
    cdf = 1 - cdf
  }

  return cdf
}

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
    fetch('https://diario.elcri.men/prediccion_mensual.json')
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
      formatter: function (item) {
        let date = new Date(item[0].name + 'T12:00:00.000-06:00')
        let datestr = [
          date.toLocaleString(intl.locale, {
            month: 'long',
            timezone: 'America/Mexico_City',
          }),
          date.getFullYear(),
        ].join(' ')
        let snsp_text = intl.formatMessage({ id: 'snsp (oficial)' })
        let dr_text = intl.formatMessage({ id: 'daily report' })
        let pred_text = intl.formatMessage({ id: 'prediction' })
        let snsp_num =
          typeof item[0].value === 'undefined' ? '-' : item[0].value
        let dr_num = typeof item[1].value === 'undefined' ? '-' : item[1].value
        let pred_num =
          typeof item[2].value === 'undefined'
            ? '-'
            : item[2].value !== item[0].value
            ? round1(item[2].value)
            : '-'
        return (
          `${datestr}<br/><span style="color:#377eb8">${snsp_text}:</span> <b >${snsp_num}</b>` +
          `<br/><span style="color:#4daf4a">${dr_text}:</span> <b>${dr_num}</b>` +
          `<br/><span style="color:#e41a1c">${pred_text}:</span> <b>${pred_num}</b>`
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
        min: 0,
        name: intl.formatMessage({ id: 'daily average' }),
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
        name: 'snsp',
        type: 'line',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[1]
              }),
        itemStyle: {
          color: '#377eb8',
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
        emphasis: {
          itemStyle: {
            color: 'black',
          },
        },
        name: intl.formatMessage({
          id: 'count',
        }),
        type: 'line',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[2]
              }),

        itemStyle: {
          color: '#4daf4a',
          borderColor: 'Black',
          opacity: 0.8,
        },
        symbol: 'circle',
        symbolSize: 5,
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
        type: 'line',
        data:
          groupedStates === null
            ? null
            : groupedStates[state].map((item, i) => {
                return item[4]
              }),

        itemStyle: {
          color: '#e41a1c',
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
          : [...Array(32)].map((e, i) => (
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
      <div>
        {/* <hr />
        <div className="box">
          <h3 className="title is-3">
            {' '}
            {intl.formatMessage({
              id: 'difference_20',
            })}
          </h3>

          {intl.formatMessage({
            id: 'states_significant',
          })}
        </div> */}
        <hr />
        {/*  <div className="columns is-centered">
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
                          <tr
                            key={index}
                            style={{
                              backgroundColor: areProportionsDifferent(
                                el.qty30,
                                mexicanStates[el.state],
                                el.qty60,
                                mexicanStates[el.state],
                                0.05 / 32
                              )
                                ? '#FFB89E'
                                : 'transparent',
                            }}
                          >
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
                              <span
                                style={{
                                  fontWeight: areProportionsDifferent(
                                    el.qty30,
                                    mexicanStates[el.state],
                                    el.qty60,
                                    mexicanStates[el.state],
                                    0.05 / 32
                                  )
                                    ? 'bold'
                                    : 'normal',
                                }}
                              >
                                {el.diff > 0 ? '+' + el.diff : el.diff}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    : null}
                </tbody>
              </table> 
            </div>
          </div>
        </div>*/}
      </div>
    </div>
  )
}

export default SMDiario
