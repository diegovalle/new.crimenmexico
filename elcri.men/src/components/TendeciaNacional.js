import React, { useState, useEffect } from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format as num_format } from 'd3-format'
import {
  timeFormat as date_format,
  timeFormatDefaultLocale,
} from 'd3-time-format'

import {
  YYYYmmddCollectionToDate,
  YYYYmmddToDate15,
} from '../components/utils.js'

import { cloneDeepWith } from 'lodash-es'

import '../assets/css/trends.css'
import './TendenciaNacional/tendencia_es.css'
import './TendenciaNacional/tendencia_en.css'
import { useIntl } from 'react-intl'
import { dateLoc } from '../../src/i18n'

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

function TendenciaNacional(props) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/elcrimen-json/national_diff.json')
      .then(response => response.json())
      .then(responseJSON => {
        setData(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const formatData = data => {
    if (typeof data[0].date !== 'object')
      data = YYYYmmddCollectionToDate(data, 'date')
    let diffs = cloneDeepWith(data)
    let gam = cloneDeepWith(data)
    let zero = cloneDeepWith(data)
    diffs.forEach(function(d) {
      d['value'] = d['diff']
    })
    gam.forEach(function(d) {
      d['value'] = d['gam']
    })
    zero.forEach(function(d) {
      d['value'] = 0
    })
    return [diffs, gam, zero]
  }

  const trbody = (data, l) => {
    let df = date_format(`%b\u00A0%Y`)
    let a = Object.keys(data).map(function(key, index) {
      let date = YYYYmmddToDate15(data[key].date)
      return (
        <tr key={index}>
          <td
            className={l}
            key={index + '1'}
            style={{
              fontFamily: 'monospace',
            }}
          >
            {df(date) +
              `\u00A0-\u00A0` +
              date_format(`%b\u00A0`)(date) +
              (parseInt(date_format('%Y')(date)) - 1)}
          </td>
          <td className={l} key={index + '2'} style={{ textAlign: 'right' }}>
            {Math.round(data[key].diff * 10) / 10}
          </td>
          <td className={l} key={index + '3'} style={{ textAlign: 'right' }}>
            {data[key].diff_count}
          </td>
        </tr>
      )
    })
    return a
  }
  const intl = useIntl()
  let l
  const comma = num_format(',.0f')
  const round1 = num_format('.1f')
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null
  // intl.locale === 'es'
  //   ? require('./TendenciaNacional/tendencia_es.css')
  //   : require('./TendenciaNacional/tendencia_en.css')
  //   console.log(intl.locale)

  let chartOption = {
    animation: true,
    animationDuration: 0,
    // toolbox: {
    //   show: true,
    //   feature: {
    //     saveAsImage: { show: true },
    //   },
    // },
    title: {
      text: intl.formatMessage({
        id: 'nacional',
      }),
      top: '3%',
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
      textStyle: {
        color: '#111',
        fontFamily: 'Roboto Condensed',
      },
      axisPointer: {
        animation: false,
      },
      formatter: function(item) {
        let date = new Date(item[0].name)
        let datestr = [
          date.toLocaleString(intl.locale, { month: 'long' }),
          date.getFullYear(),
        ].join(' ')
        let rate_diff = intl.formatMessage({ id: 'rate_diff' })
        let count_diff = intl.formatMessage({ id: 'count_diff' })
        let num = data[item[0].dataIndex].diff_count
        return (
          `${datestr}<br/>` +
          `<b>${rate_diff}</b>: ${round1(item[0].value)}<br/>` +
          `<b>${count_diff}</b>: ${comma(num)}<br/>`
        )
      },
    },
    grid: {
      left: '45',
      right: '2%',
      bottom: '15%',
      top: '25%',
      containLabel: false,
    },
    xAxis: {
      animation: false,
      type: 'category',
      boundaryGap: true,
      data: data === null ? null : formatData(data)[0].map(item => item.date),
      axisLabel: {
        interval: 35,
        formatter: function(value, idx) {
          var date = new Date(value)
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear(),
          ].join(' ')
        },
      },
      axisLine: { lineStyle: { color: '#111', width: 2 } },
      splitNumber: 2,
    },
    yAxis: [
      {
        animation: false,
        name: intl.formatMessage({
          id: 'diferencia en tasa',
        }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial' },
        type: 'value',
        scale: false,
        splitNumber: 2,
        // interval:
        //   Math.round(Math.round((((props.max_y + 5) / 10) * 10) / 3) / 10) *
        //   10,
        // max: Math.round((props.max_y + 5) / 10) * 10,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: '#b3b2b2',
            width: 0.4,
          },
        },
        axisLabel: {
          margin: 0,
          padding: [0, 2, 0, 0],
        },
      },
    ],
    series: [
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'crime',
        type: 'line',
        data:
          data === null ? null : formatData(data)[0].map(item => item.value),
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
        tooltip: {
          show: false,
        },
        name: 'GAM',
        type: 'line',
        data:
          data === null ? null : formatData(data)[1].map(item => item.value),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 1.2,
          color: 'green',
        },
        showSymbol: false,
        symbol: 'none',
      },
    ],
  }

  return (
    <div className="columns">
      <div className="column is-full">
        <figure className="image is-5by3">
          {data ? (
            <div className=" has-ratio" id="tendencias">
              <ReactEChartsCore
                echarts={echarts}
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ locale: echarts.registerLocale('ES') }}
              />
            </div>
          ) : (
            <div
              className="has-background-skeleton has-ratio"
              id="tendencias"
            />
          )}
        </figure>
        <hr style={{ backgroundColor: '#fff' }} />
        <div className="columns is-centered">
          <div className="column is-6">
            <div className="table-container">
              <table className="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>
                      {intl.formatMessage({
                        id: 'Date',
                      })}
                    </th>
                    <th>
                      {intl.formatMessage({
                        id: 'trate',
                      })}
                    </th>
                    <th>
                      {intl.formatMessage({
                        id: 'tcount',
                      })}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data
                    ? trbody([...data].reverse(), intl.locale)
                    : [...Array(5)].map((e, index) => (
                        <tr key={index}>
                          <td
                            className={intl.locale}
                            key={index + '1'}
                            style={{
                              color: 'transparent',
                              fontFamily: 'monospace',
                            }}
                          >
                            <span className="has-background-grey-light">
                              \u00A0\u00A0
                            </span>
                          </td>
                          <td
                            className={intl.locale}
                            key={index + '2'}
                            style={{ textAlign: 'right', color: 'transparent' }}
                          >
                            <span className="has-background-grey-light">
                              ---
                            </span>
                          </td>
                          <td
                            className={intl.locale}
                            key={index + '3'}
                            style={{ textAlign: 'right', color: 'transparent' }}
                          >
                            <span className="has-background-grey-light">
                              ----
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TendenciaNacional
