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
  ToolboxComponent,
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
  CanvasRenderer,
  ToolboxComponent,
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
  const [nationalData, setNationalData] = useState(null)
  const [stateData, setStateData] = useState(null)
  const [selectedData, setSelectedData] = useState(null)

  useEffect(() => {
    fetch('/elcrimen-json/states_national.json')
      .then(response => response.json())
      .then(responseJSON => {
        var ans = {
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
        setNationalData(ans)
        setSelectedData({
          hd: ans.national.hd,
          sec: ans.national.sec,
          ext: ans.national.ext,
          rvcv: ans.national.rvcv,
          rvsv: ans.national.rvsv,
        })
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  async function fetchData() {
    try {
      fetch('/elcrimen-json/states2.json', {
        method: 'GET',
      })
        .then(function(response) {
          return response.json()
        })
        .then(function(responseJSON) {
          var ans = {
            ext: zipObject(responseJSON.ext),
            rvcv: zipObject(responseJSON.rvcv),
            rvsv: zipObject(responseJSON.rvsv),
            sec: zipObject(responseJSON.sec),
            hd: [zipObject(responseJSON.hd[0]), zipObject(responseJSON.hd[1])],
          }
          setStateData(ans)
          setSelectedData({
            hd: [
              filter(ans.hd[0], { s: parseInt(props.selected_state) }),
              filter(ans.hd[1], { s: parseInt(props.selected_state) }),
            ],
            sec: filter(ans.sec, {
              s: parseInt(props.selected_state),
            }),
            ext: filter(ans.ext, {
              s: parseInt(props.selected_state),
            }),
            rvcv: filter(ans.rvcv, {
              s: parseInt(props.selected_state),
            }),
            rvsv: filter(ans.rvsv, {
              s: parseInt(props.selected_state),
            }),
          })
        })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (props.mouseOver)
      if (!stateData) {
        fetch('/elcrimen-json/states2.json', {
          method: 'GET',
        })
          .then(function(response) {
            return response.json()
          })
          .then(function(responseJSON) {
            var ans = {
              ext: zipObject(responseJSON.ext),
              rvcv: zipObject(responseJSON.rvcv),
              rvsv: zipObject(responseJSON.rvsv),
              sec: zipObject(responseJSON.sec),
              hd: [
                zipObject(responseJSON.hd[0]),
                zipObject(responseJSON.hd[1]),
              ],
            }
            setStateData(ans)
          })
      }
  }, [props.mouseOver])

  useEffect(() => {
    if (props.selected_state === '0') {
      if (nationalData)
        setSelectedData({
          hd: nationalData.national.hd,
          sec: nationalData.national.sec,
          ext: nationalData.national.ext,
          rvcv: nationalData.national.rvcv,
          rvsv: nationalData.national.rvsv,
        })
    } else {
      if (!stateData) fetchData()
      else
        setSelectedData({
          hd: [
            filter(stateData.hd[0], { s: parseInt(props.selected_state) }),
            filter(stateData.hd[1], { s: parseInt(props.selected_state) }),
          ],
          sec: filter(stateData.sec, {
            s: parseInt(props.selected_state),
          }),
          ext: filter(stateData.ext, {
            s: parseInt(props.selected_state),
          }),
          rvcv: filter(stateData.rvcv, {
            s: parseInt(props.selected_state),
          }),
          rvsv: filter(stateData.rvsv, {
            s: parseInt(props.selected_state),
          }),
        })
    }
  }, [props.selected_state])

  const zipObject = obj => {
    let result = new Array(obj.d.length)
    if ('s' in obj)
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          // p: obj.p[i],
          s: obj.s[i],
        }
      }
    else
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          //  p: obj.p[i],
        }
      }
    return result
  }

  const singleChart = (title, toolboxTip) => {
    if (!selectedData) return <div />
    let dataFormatted
    switch (title) {
      case intl.formatMessage({ id: 'Homicidio Intencional' }):
        dataFormatted = selectedData['hd']
        break
      case intl.formatMessage({ id: 'Secuestro' }):
        dataFormatted = selectedData['sec']
        break
      case intl.formatMessage({ id: 'Extorsión' }):
        dataFormatted = selectedData['ext']
        break
      case intl.formatMessage({ id: 'Robo de Coche c/v' }):
        dataFormatted = selectedData['rvcv']
        break
      case intl.formatMessage({ id: 'Robo de Coche s/v' }):
        dataFormatted = selectedData['rvsv']
        break
      default:
        throw new Error("Unknown crime. Don't know how to filter")
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

    dataFormatted = formatData(dataFormatted)

    title =
      title +
      '\u0020-\u0020' +
      (stateNames[props.selected_state] === 'National'
        ? intl.formatMessage({ id: 'nacional' })
        : stateNames[props.selected_state])

    let chartOption = {
      animation: false,
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
          if (item.length === 2) {
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
              dataFormatted[1][item[0].dataIndex].c === null
                ? '-'
                : comma(dataFormatted[1][item[0].dataIndex].c)
            let num_snsp =
              dataFormatted[0][item[1].dataIndex].c === null
                ? '-'
                : comma(dataFormatted[0][item[1].dataIndex].c)
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
              dataFormatted[item[0].dataIndex].c
            )})`
          }
        },
      },
      grid: {
        left: '45',
        right: '17',
        bottom: '15%',
        top: '25%',
        containLabel: false,
      },
      xAxis: {
        animation: false,
        type: 'category',
        data:
          dataFormatted.length === 2
            ? dataFormatted[0].map(item => item.d)
            : dataFormatted.map(item => item.d),
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
          name: intl.formatMessage({ id: 'tasa anualizada' }),
          nameLocation: 'middle',
          nameGap: 25,
          nameTextStyle: {
            fontFamily: 'Arial',
            fontSize: 11,
            color: '#222',
          },
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
            fontFamily: 'Arial',
            fontSize: 11,
            color: '#4d4d4d',
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
          name: 'snsp',
          type: 'line',
          data: (dataFormatted => {
            if (dataFormatted.length === 2) {
              return dataFormatted[0].map(item => item.r)
            } else {
              return dataFormatted.map(item => item.r)
            }
          })(dataFormatted),
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
          name: 'inegi',
          type: 'line',
          data: (dataFormatted => {
            if (dataFormatted.length === 2) {
              return dataFormatted[1].map(item => item.r)
            } else return null
          })(dataFormatted),
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

    if (toolboxTip)
      chartOption.toolbox = {
        show: true,
        left: 'right',
        showTitle: false,
        itemSize: 13,
        iconStyle: {
          color: '#def3f3',
          borderJoin: 'round',
          borderWidth: 1.5,
          borderColor: '#111',
          borderCap: 'round',
        },
        tooltip: {
          show: true,
          position: 'left',
          padding: 2,
          formatter: () => toolboxTip,
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

  const intl = useIntl()
  let l
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null

  return (
    <React.Fragment>
      <div className="columns">
        <div className="column is-full">
          <figure className="image is-3by1-tablet-only-3by2-mobile-3by2">
            <div
              id="nat_hd"
              style={{ height: '100%' }}
              className={
                props.selected_crime === 'hd'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart(intl.formatMessage({ id: 'Homicidio Intencional' }))}
            </div>
          </figure>
        </div>
      </div>

      <div className="columns is-desktop">
        <div className="column is-half-desktop">
          <figure className="image is-3by2-tablet-only-3by2-mobile-3by1">
            <div
              id="nat_sec"
              style={{ height: '100%' }}
              className={
                props.selected_crime === 'sec'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart(intl.formatMessage({ id: 'Secuestro' }))}
            </div>
          </figure>
        </div>
        <div className="column is-half-desktop">
          <figure className="image is-3by2-tablet-only-3by2-mobile-3by1">
            <div
              id="nat_ext"
              style={{ height: '100%' }}
              className={
                props.selected_crime === 'ext'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart(intl.formatMessage({ id: 'Extorsión' }))}
            </div>
          </figure>
        </div>
      </div>
      <div className="columns is-desktop">
        <div className="column is-half-desktop">
          <figure className="image is-3by2-tablet-only-3by2-mobile-3by1">
            <div
              id="nat_rvcv"
              style={{ height: '100%' }}
              className={
                props.selected_crime === 'rvcv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart(
                intl.formatMessage({ id: 'Robo de Coche c/v' }),
                intl.formatMessage({ id: 'Robo de Coche Con Violencia' })
              )}
            </div>
          </figure>
        </div>
        <div className="column is-half-desktop">
          <figure className="image is-3by2-tablet-only-3by2-mobile-3by1">
            <div
              id="nat_rvsv"
              style={{ height: '100%' }}
              className={
                props.selected_crime === 'rvsv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart(
                intl.formatMessage({ id: 'Robo de Coche s/v' }),
                intl.formatMessage({ id: 'Robo de Coche Sin Violencia' })
              )}
            </div>
          </figure>
        </div>
      </div>
      <div className="columns">
        <div className="column is-full">
          <p>
            <FormattedMessage id="front-caption" />
          </p>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CrimeChart
