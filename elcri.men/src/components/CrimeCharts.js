import React, { useState, useEffect } from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format as num_format } from 'd3-format'
import { timeFormat as date_format } from 'd3-time-format'
import { timeFormatDefaultLocale } from 'd3-time-format'
import SmallMultiple from '../components/SmallMultiple'
import { useIntl, FormattedMessage } from 'react-intl'

import { filter } from 'lodash-es'
import { dateLoc } from '../../src/i18n'
import { format } from 'd3-format'

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

import { YYYYmmddCollectionToDate } from './utils.js'

import '../assets/css/trends.css'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
])

const round1 = format('.1f')
const comma = format(',')

function CrimeChart(props) {
  const stateNames = {
    '0': 'National',
    '1': 'AGS',
    '2': 'BC',
    '3': 'BCS',
    '4': 'CAMP',
    '5': 'COAH',
    '6': 'COL',
    '7': 'CHPS',
    '8': 'CHIH',
    '9': 'CDMX',
    '10': 'DGO',
    '11': 'GTO',
    '12': 'GRO',
    '13': 'HGO',
    '14': 'JAL',
    '15': 'MEX',
    '16': 'MICH',
    '17': 'MOR',
    '18': 'NAY',
    '19': 'NL',
    '20': 'OAX',
    '21': 'PUE',
    '22': 'QTO',
    '23': 'QROO',
    '24': 'SLP',
    '25': 'SIN',
    '26': 'SON',
    '27': 'TAB',
    '28': 'TAM',
    '29': 'TLAX',
    '30': 'VER',
    '31': 'YUC',
    '32': 'ZAC',
  }
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/elcrimen-json/states2.json')
      .then(response => response.json())
      .then(responseJSON => {
        var ans = {
          ext: zipObject(responseJSON.ext),
          rvcv: zipObject(responseJSON.rvcv),
          rvsv: zipObject(responseJSON.rvsv),
          sec: zipObject(responseJSON.sec),
          hd: [zipObject(responseJSON.hd[0]), zipObject(responseJSON.hd[1])],
          national: {
            ext: zipObject(responseJSON.national.ext),
            rvcv: zipObject(responseJSON.national.rvcv),
            rvsv: zipObject(responseJSON.national.rvsv),
            sec: zipObject(responseJSON.national.sec),
            hd: [
              zipObject(responseJSON.national.hd[0]),
              zipObject(responseJSON.national.hd[1]),
            ],
          },
        }
        setData(ans)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const zipObject = obj => {
    let result = new Array(obj.d.length)
    if ('s' in obj)
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          p: obj.p[i],
          s: obj.s[i],
        }
      }
    else
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          p: obj.p[i],
        }
      }
    return result
  }

  const singleChart = title => {
    if (!data) return <div />
    let dataf,
      selected_state = props.selected_state
    switch (title) {
      case intl.formatMessage({ id: 'Homicidio Intencional' }):
        if (selected_state === '0') dataf = data.national.hd
        else
          dataf = [
            filter(data.hd[0], { s: parseInt(selected_state) }),
            filter(data.hd[1], { s: parseInt(selected_state) }),
          ]
        break
      case intl.formatMessage({ id: 'Secuestro' }):
        if (selected_state === '0') dataf = data.national.sec
        else dataf = filter(data.sec, { s: parseInt(selected_state) })
        break
      case intl.formatMessage({ id: 'Extorsión' }):
        if (selected_state === '0') dataf = data.national.ext
        else dataf = filter(data.ext, { s: parseInt(selected_state) })
        break
      case intl.formatMessage({ id: 'Robo de Coche c/v' }):
        if (selected_state === '0') dataf = data.national.rvcv
        else dataf = filter(data.rvcv, { s: parseInt(selected_state) })
        break
      case intl.formatMessage({ id: 'Robo de Coche s/v' }):
        if (selected_state === '0') dataf = data.national.rvsv
        else dataf = filter(data.rvsv, { s: parseInt(selected_state) })
        break
      default:
        throw new Error("Unknown crime. Don't know how to filter")
    }

    dataf = formatData(dataf)
    title =
      title +
      ' - ' +
      (stateNames[props.selected_state] === 'National'
        ? intl.formatMessage({ id: 'nacional' })
        : stateNames[props.selected_state])
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
        text: title,
        top: '3%',
        left: 'center',
        textStyle: {
          fontFamily: 'Trebuchet MS',
          fontSize: 13,
          fontWeight: 'bold',
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
          if (item.length == 2) {
            let date = new Date(item[0].name)
            let datestr = [
              date.toLocaleString(intl.locale, { month: 'long' }),
              date.getFullYear(),
            ].join(' ')
            let tasa = intl.formatMessage({ id: 'rate' })
            let rate_inegi =
              typeof item[1].value === 'undefined' ? '-' : item[1].value
            let rate_snsp =
              typeof item[0].value === 'undefined' ? '-' : item[0].value
            let num_inegi =
              dataf[1][item[0].dataIndex].c === null
                ? '-'
                : comma(dataf[1][item[0].dataIndex].c)
            let num_snsp =
              dataf[0][item[1].dataIndex].c === null
                ? '-'
                : comma(dataf[0][item[1].dataIndex].c)
            return (
              `${datestr}<br/>${tasa} <span class="inegi-adjusted">INEGI</span>: <b>${rate_inegi}</b> (${num_inegi})` +
              `<br/>${tasa} <span class="snsp">SNSP</span>: <b>${rate_snsp}</b> (${num_snsp})`
            )
          } else {
            let date = new Date(item[0].name)
            let datestr = [
              date.toLocaleString(intl.locale, { month: 'long' }),
              date.getFullYear(),
            ].join(' ')
            let tasa = intl.formatMessage({ id: 'rate' })
            return `${datestr}<br/>${tasa}: <b>${item[0].value}</b> (${comma(
              dataf[item[0].dataIndex].c
            )})`
          }
        },
      },
      grid: {
        left: '45',
        right: '2%',
        bottom: '13%',
        top: '25%',
        containLabel: false,
      },
      xAxis: {
        animation: false,
        type: 'category',
        data:
          dataf.length === 2
            ? dataf[0].map(item => item.d)
            : dataf.map(item => item.d),
        axisLabel: {
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
          name: intl.formatMessage({ id: 'tasa anualizada' }),
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
            disabled: true,
          },
          name: 'crime',
          type: 'line',
          data:
            dataf.length === 2
              ? dataf[0].map(item => item.r)
              : dataf.map(item => item.r),
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
            disabled: true,
          },
          name: 'snsp',
          type: 'line',
          data: dataf.length === 2 ? dataf[1].map(item => item.r) : null,
          itemStyle: {
            color: '#333',
          },
          lineStyle: {
            width: 1.2,
            color: '#e81208',
          },
          showSymbol: false,
        },
      ],
    }

    function onChartReady(echarts) {
      echarts.hideLoading()
    }

    return (
      <ReactEChartsCore
        echarts={echarts}
        option={chartOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ locale: echarts.registerLocale('ES') }}
        //showLoading={true}
        //onChartReady={onChartReady}
        //loadingOption={{ text: intl.formatMessage({ id: 'loading' }) }}
      />
    )
  }

  const formatData = crimeData => {
    if (crimeData.length === 2) {
      if (!(crimeData[0][0].d instanceof Date)) {
        crimeData[0] = YYYYmmddCollectionToDate(crimeData[0], 'd')
        crimeData[1] = YYYYmmddCollectionToDate(crimeData[1], 'd')
      }
    } else {
      if (!(crimeData[0].d instanceof Date))
        crimeData = YYYYmmddCollectionToDate(crimeData, 'd')
    }

    return crimeData
  }
  const intl = useIntl()
  let l
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null

  return (
    <React.Fragment>
      <div className="columns">
        <div className="column is-full">
          <figure className="image">
            <div
              id="nat_hd"
              className={
                props.selected_crime === 'hd'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              <div className="is-3by1-tablet-only-6by3-mobile-16by9">
                {singleChart(
                  intl.formatMessage({ id: 'Homicidio Intencional' })
                )}
              </div>
            </div>
          </figure>
        </div>
      </div>

      <div className="columns is-desktop">
        <div className="column is-half-desktop">
          <figure className="image">
            <div
              id="nat_sec"
              className={
                props.selected_crime === 'sec'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              <div className="is-16by9-tablet-only-6by3-mobile-16by9">
                {singleChart(intl.formatMessage({ id: 'Secuestro' }))}
              </div>
            </div>
          </figure>
        </div>
        <div className="column is-half-desktop">
          <figure className="image">
            <div
              id="nat_ext"
              className={
                props.selected_crime === 'ext'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              <div className="is-16by9-tablet-only-6by3-mobile-16by9">
                {singleChart(intl.formatMessage({ id: 'Extorsión' }))}
              </div>
            </div>
          </figure>
        </div>
      </div>
      <div className="columns is-desktop">
        <div className="column is-half-desktop">
          <figure className="image">
            <div
              id="nat_rvcv"
              className={
                props.selected_crime === 'rvcv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              <div className="is-16by9-tablet-only-6by3-mobile-16by9">
                {singleChart(intl.formatMessage({ id: 'Robo de Coche c/v' }))}
              </div>{' '}
            </div>
          </figure>
        </div>
        <div className="column is-half-desktop">
          <figure className="image">
            <div
              id="nat_rvsv"
              className={
                props.selected_crime === 'rvsv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              <div className="is-16by9-tablet-only-6by3-mobile-16by9">
                {singleChart(intl.formatMessage({ id: 'Robo de Coche s/v' }))}
              </div>{' '}
            </div>
          </figure>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CrimeChart
