import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import LazyLoad from 'react-lazyload'
import { format as num_format } from 'd3-format'
import Layout from '../components/layout'
import { FormattedDate } from 'react-intl'
import SEO from '../components/SEO'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { YYYYmmddToDate15 } from '../components/utils'
import HeroTitle from '../components/HeroTitle'
import TextColumn from '../components/TextColumn'
import SMDiario from '../components/SMDiario'
import SMDiarioAnomalias from '../components/SMDiarioAnomalias'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  MarkLineComponent,
} from 'echarts/components'
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers'

//import '../assets/css/trends.css'

import '../components/TendenciaNacional/diario_es.css'
import '../components/TendenciaNacional/diario_en.css'

import social_image from '../assets/images/social/social-daily-report.png'
import social_image_en from '../assets/images/social/social-daily-report_en.png'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  MarkLineComponent,
])

const reg = (x1, x2) => {
  let ALPHA = -14.168110931182667
  let BETA1 = 1.3821427096274106
  // let BETA2 = -0.03147
  // let BETA3 = -0.01984
  let value = ALPHA + BETA1 * x1 // + BETA2 * x2 + BETA3 * x1 * x2
  return Math.round(value * 10) / 10
}

function ReporteDiario(props) {
  const intl = useIntl()
  const [data, setData] = useState(null)
  const [table, setTable] = useState(null)
  const [maxDate, setMaxDate] = useState(null)
  const [snspData, setSNSPData] = useState(null)
  const [maxSNSPDate, setMaxSNSPDate] = useState('2023-01-01')

  const comma = num_format(',.0f')
  const round1 = num_format('.1f')

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  const DAYS_TO_FILTER = 10

  useEffect(() => {
    const informeDiario = fetch(
      'https://diario.elcri.men/informe_diario.json'
    ).then((response) => response.json())
    const statesNational = fetch('/elcrimen-json/states_national.json').then(
      (response) => response.json()
    )
    const porDia = fetch('https://diario.elcri.men/por_dia2.json').then(
      (response) => response.json()
    )
    Promise.all([informeDiario, statesNational, porDia])
      .then((values) => {
        values[0] = values[0].filter((item) => item[0] > '2023-01-01')
        setData(values[0])
        setMaxDate(values[0][values[0].length - 1][0])

        let j = {
          date: values[1]['national']['hd'][0]['d'],
          count: values[1]['national']['hd'][0]['c'],
        }
        let snsp = {}
        for (let i = 0; i < j.date.length; i++) {
          if (j.date[i] >= '2023-01-01') {
            snsp[j.date[i]] = j.count[i]
          }
        }
        setSNSPData(snsp)
        let lastDateSNSP =
          values[1].national.hd[0].d[values[1].national.hd[0].d.length - 1]
        setMaxSNSPDate(
          lastDateSNSP.substring(0, 8) +
            daysInMonth(
              lastDateSNSP.substring(0, 4),
              lastDateSNSP.substring(5, 7)
            )
        )

        for (let i = 0; i < values[2].length; i++) {
          values[2][i][3] =
            snsp[values[2][i][0]] /
            daysInMonth(
              values[2][i][0].slice(0, 4),
              values[2][i][0].slice(5, 7)
            )
        }
        if (values[2][values[2].length - 1][1] < DAYS_TO_FILTER) values[2].pop()
        setTable(values[2])
      })
      .catch((error) => {
        console.error(error)
      })

    /*  .then((response) => response.json())
      .then((responseJSON) => {
        let j = {
          date: responseJSON['national']['hd'][0]['d'],
          count: responseJSON['national']['hd'][0]['c'],
        }
        let snsp = {}
        for (let i = 1; i < j.date.length; i++) {
          if (j.date[i] >= '2023-01-01') snsp[j.date[i]] = j.count[i]
        }
        setSNSPData(snsp)
      })
      .catch((error) => {
        console.error(error)
      }) */
  }, [])

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
        id: 'Number of homicides and 30 day rolling mean',
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
      trigger: 'item',
      textStyle: {
        color: '#111',
        fontFamily: 'Roboto Condensed',
      },
      axisPointer: {
        animation: false,
      },
      formatter: function (item) {
        let date = new Date(item.name + 'T00:00:00.000-06:00')
        let datestr = [
          date.toLocaleString(intl.locale, {
            month: 'long',
            day: 'numeric',
            timezone: 'America/Mexico_City',
          }),
          date.getFullYear(),
        ].join(' ')
        let numHom = intl.formatMessage({ id: 'number of homicides' })
        let rollmean = intl.formatMessage({ id: '30 day average' })
        let num = item.value
        return (
          `${datestr}<br/>` +
          `<b>${numHom}</b>: ${item.value}<br/>` +
          `<b>${rollmean}</b>: ${data[item.dataIndex][2]}<br/>`
        )
      },
    },
    grid: {
      left: '45',
      right: '3%',
      bottom: '15%',
      top: '19%',
      containLabel: false,
    },
    xAxis: {
      animation: false,
      type: 'category',
      boundaryGap: true,
      data: data === null ? null : data.map((item) => item[0]),
      axisLabel: {
        interval: 185,
        formatter: function (value, idx) {
          var date = new Date(YYYYmmddToDate15(value))
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear(),
          ].join(' ')
        },
      },
      axisLine: { lineStyle: { color: '#4d4d4d', width: 2 } },
      splitLine: {
        interval: (index, value) => {
          if (
            parseInt(value.slice(8, 10)) ===
            daysInMonth(value.slice(0, 4), value.slice(5, 7))
          )
            return true
        },
        show: true,
        lineStyle: {
          type: 'solid',
          color: '#ddd',
          width: 0.4,
        },
      },
    },
    yAxis: [
      {
        animation: false,
        name: intl.formatMessage({
          id: 'number of homicides',
        }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial', fontSize: 11, color: '#222' },
        type: 'value',
        scale: false,
        splitNumber: 4,
        // interval:
        //   Math.round(Math.round((((props.max_y + 5) / 10) * 10) / 3) / 10) *
        //   10,
        // max: Math.round((props.max_y + 5) / 10) * 10,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: '#333',
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
        type: 'scatter',
        emphasis: {
          symbolSize: 10,
          itemStyle: { width: 4.2, color: 'red' },
        },
        name: intl.formatMessage({
          id: 'number of homicides',
        }),
        data: data === null ? null : data.map((item) => item[1]),

        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        itemStyle: {
          color: 'white',
          borderColor: '#333',
          opacity: 0.8,
        },
      },
      {
        type: 'line',
        emphasis: {
          lineStyle: { color: '#357933' },
        },
        name: intl.formatMessage({
          id: '30 day average',
        }),
        data: data === null ? null : data.map((item) => item[2]),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 3,
          color: '#4daf4a',
        },
        showSymbol: false,
        symbol: 'none',
        markLine: {
          animation: false,
          silent: true,
          symbolSize: 0,
          lineStyle: { color: '#555', width: 1, type: 'dashed' },
          data: [{ xAxis: '2024-10-01' }],
          label: {
            show: true,
            position: 'insideStartBottom',
            formatter: (item) => {
              let date = new Date(item.value + 'T00:00:00.000-06:00')
              let dateStr = [
                date.toLocaleString(intl.locale, {
                  month: 'short',
                  day: 'numeric',
                  timezone: 'America/Mexico_City',
                }),
                date.getFullYear(),
              ].join(' ')
              return dateStr
            },
          },
        },
      },
      /* {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'L',
        type: 'line',
        data: data === null ? null : data.map((item) => item[3]),
        lineStyle: {
          opacity: 0,
        },
        stack: 'confidence-band',
        symbol: 'none',
        z: 0,
      },
      {
        emphasis: {
          areaStyle: {
            color: '#E5E4E2',
          },
        },
        name: 'U',
        type: 'line',
        data: data === null ? null : data.map((item) => item[4] - item[3]),
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: '#E5E4E2',
        },
        stack: 'confidence-band',
        symbol: 'none',
        z: 0,
      }, */
    ],
  }

  let monthlyChartOption = {
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
        id: 'Number of homicides per month',
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
      formatter: function (item) {
        let date = new Date(YYYYmmddToDate15(item[0].name))
        let datestr = [
          date.toLocaleString(intl.locale, {
            month: 'long',
            timezone: 'America/Mexico_City',
          }),
          date.getFullYear(),
        ].join(' ')
        let numHom = intl.formatMessage({ id: 'number of homicides' })
        let rollmean = intl.formatMessage({ id: '30 day average' })
        let num = item[2].value
        return (
          `${datestr}<br/>` +
          `<b style="color:#377eb8">SNSP</b>: ${
            isNaN(round1(item[0].value)) ? '-' : round1(item[0].value)
          }<br/>` +
          `<b style="color:#4daf4a">${intl.formatMessage({
            id: 'Preliminary',
          })}</b>: ${round1(item[1].value)}<br/>` +
          `<b style="color:#e41a1c">${intl.formatMessage({
            id: 'Predicted',
          })}</b>: ${
            typeof item[2].value !== 'undefined'
              ? item[2].value !== item[0].value
                ? round1(item[2].value)
                : '-'
              : '-'
          }<br/>`
        )
      },
    },
    grid: {
      left: '45',
      right: '3%',
      bottom: '15%',
      top: '19%',
      containLabel: false,
    },
    xAxis: {
      animation: false,
      type: 'category',
      boundaryGap: true,
      data: table === null ? null : table.map((item) => item[0]),
      axisLabel: {
        interval: 11,
        formatter: function (value, idx) {
          var date = new Date(YYYYmmddToDate15(value))
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear(),
          ].join(' ')
        },
      },
      axisLine: { lineStyle: { color: '#4d4d4d', width: 2 } },
      splitNumber: 2,
    },
    yAxis: [
      {
        animation: false,
        name: intl.formatMessage({
          id: 'number of homicides per month',
        }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial', fontSize: 11, color: '#222' },
        type: 'value',
        scale: false,
        splitNumber: 4,
        // interval:
        //   Math.round(Math.round((((props.max_y + 5) / 10) * 10) / 3) / 10) *
        //   10,
        // max: Math.round((props.max_y + 5) / 10) * 10,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: '#333',
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
        type: 'line',
        name: intl.formatMessage({
          id: 'SNSP',
        }),
        data: table === null ? null : table.map((item) => item[3]),
        itemStyle: {
          color: '#377eb8',
        },
        showSymbol: false,
        emphasis: {
          lineStyle: {
            width: 2,
            color: '#377eb8', //red
          },
        },
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#377eb8', //red
        },
      },
      {
        type: 'line',
        name: intl.formatMessage({
          id: 'snsp',
        }),
        data: table === null ? null : table.map((item) => item[2]),
        itemStyle: {
          color: '#4daf4a',
        },
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        emphasis: {
          lineStyle: {
            color: '#4daf4a',
            width: 2,
          },
        },
        lineStyle: {
          color: '#4daf4a',
          width: 2,
        },
      },
      {
        type: 'line',

        name: intl.formatMessage({
          id: 'prediction',
        }),
        data:
          table === null
            ? null
            : table.map((item, i) => {
                if (!item[3]) return item[4]
                if (i < table.length - 1 && isNaN(table[i + 1][3])) {
                  return item[3]
                } else return null
              }),

        symbol: 'circle',
        itemStyle: {
          color: '#e41a1c',
        },
        symbolSize: 4,
        showSymbol: false,
        lineStyle: {
          color: '#e41a1c',
          type: 'dashed',
          width: 2,
        },
      },
    ],
  }

  const trbody = (data, locale) => {
    return data.reverse().map(function (item, index) {
      return (
        <tr key={index}>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '1'}
          >
            <FormattedDate
              value={new Date(YYYYmmddToDate15(item[0]))}
              month="long"
              timeZone="America/Mexico_City"
            />
            {`\u00A0`}
            <FormattedDate
              value={new Date(YYYYmmddToDate15(item[0]))}
              year="numeric"
              timeZone="America/Mexico_City"
            />
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '2'}
            style={{ textAlign: 'right', fontFamily: 'monospace' }}
          >
            {Math.round(item[2] * 10) / 10}
            {(round1(Math.round(item[2] * 10) / 10) + '').split('.')[1] !== '0'
              ? ''
              : '  '}
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '4'}
            style={{
              textAlign: 'right',
              fontFamily: 'monospace',
            }}
          >
            {item[3] ? Math.round(item[3] * 10) / 10 : '–'}
            {(round1(Math.round(item[3] * 10) / 10) + '').split('.')[1] !== '0'
              ? ''
              : '  '}
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '3'}
            style={{ textAlign: 'right', fontFamily: 'monospace' }}
          >
            {comma(
              Math.round(
                item[2] * daysInMonth(item[0].slice(0, 4), item[0].slice(5, 7))
              )
            )}
            <span className="is-hidden-desktop">  </span>
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '5'}
            style={{
              textAlign: 'right',
              fontFamily: 'monospace',
            }}
          >
            {item[3] ? comma(Math.round(item[3] * item[1])) : '–'}
            <span className="is-hidden-desktop">  </span>
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '6'}
            style={{
              textAlign: 'right',
              fontFamily: 'monospace',
            }}
          >
            {item[3]
              ? '–'
              : round1(item[4]) +
                ' (' +
                comma(
                  Math.round(
                    item[4] *
                      daysInMonth(item[0].slice(0, 4), item[0].slice(5, 7))
                  )
                ) +
                ')'}
          </td>
        </tr>
      )
    })
  }

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet />
      <SEO
        title={intl.formatMessage({ id: 'title_daily' })}
        description={intl.formatMessage({ id: 'desc_daily' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />

      <div className="container is-fullhd" id="trends">
        <div id="daily-trends">
          <article>
            <div id="daily-trends-chart">
              <HeroTitle>
                {intl.formatMessage({ id: 'Daily Homicides in Mexico' })}{' '}
                {maxDate !== null ? (
                  <i>
                    <time datetime={maxDate}>
                      {' '}
                      <FormattedDate
                        value={new Date(maxDate + 'T00:00:00.000-06:00')}
                        day="2-digit"
                        month="long"
                        year="numeric"
                        timeZone="America/Mexico_City"
                      />
                    </time>
                  </i>
                ) : (
                  '⠀⠀ ⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⠀⠀'
                )}
              </HeroTitle>
              <div className="columns">
                <div className="column is-10 is-offset-1">
                  <figure className="image is-2by1">
                    <div className=" has-ratio">
                      <ReactEChartsCore
                        echarts={echarts}
                        option={chartOption}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ locale: echarts.registerLocale('ES') }}
                      />
                    </div>
                  </figure>
                </div>
              </div>
            </div>
            <section className="section">
              <TextColumn>
                <FormattedHTMLMessage id="datos_diarios_intro" />
              </TextColumn>
            </section>
            <section className="section">
              <TextColumn>
                <FormattedHTMLMessage id="gam_description" />
              </TextColumn>
            </section>
          </article>
        </div>

        <div id="homicide_prediction">
          <h3 className="title is-3">
            <FormattedHTMLMessage id="daily_in_red_title" />
          </h3>
          <div className="columns">
            <div className="column is-half is-offset-5">
              <p style={{ lineHeight: '1.2rem' }}>
                <FormattedHTMLMessage id="snsp-victims" />
                <br />
                <FormattedHTMLMessage id="preliminary_homicides" />
                <br />
                <FormattedHTMLMessage id="prediction_homicides" />
              </p>
            </div>
          </div>
          <article>
            <div className="columns">
              <div className="column is-10 is-offset-1">
                <figure className="image is-2by1">
                  <div className=" has-ratio">
                    <ReactEChartsCore
                      echarts={echarts}
                      option={monthlyChartOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ locale: echarts.registerLocale('ES') }}
                    />
                  </div>
                </figure>
              </div>
            </div>
          </article>
        </div>
        <hr style={{ backgroundColor: '#fff' }} />
        <div className="columns is-centered">
          <div className="column is-8">
            <section className="section">
              <div className="content is-large">
                <FormattedHTMLMessage id="daily_in_red" />
              </div>
            </section>
            <div
              className="table-container"
              style={{ overflow: 'auto', height: '400px' }}
            >
              <table
                className="table is-striped is-fullwidth"
                style={{
                  border: '0px solid #cbcbcb',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'Date',
                      })}
                    </th>
                    <th
                      align="right"
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'Preliminary (per day)',
                      })}
                    </th>
                    <th
                      align="right"
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'SNSP (oficial data, per day)',
                      })}
                    </th>
                    <th
                      align="right"
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'Preliminary (monthly)',
                      })}
                    </th>
                    <th
                      align="right"
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'SNSP (monthly)',
                      })}
                    </th>
                    <th
                      align="right"
                      style={{ textTransform: 'capitalize' }}
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: '1',
                        background: 'white',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'prediction_snsp',
                      })}
                    </th>
                  </tr>
                </thead>

                <tbody>{table ? trbody(table, intl.locale) : null}</tbody>
              </table>
            </div>
          </div>
        </div>

        <hr style={{ backgroundColor: '#fff' }} />
        <div id="daily-states-month">
          <hr />

          <div id="daily-anomalies">
            <a name="anomalias_diarias" />
            <h3 className="title is-3">
              {' '}
              <FormattedHTMLMessage id="anomalias_diarias" />
            </h3>
            <div className="column is-half is-offset-5">
              <p style={{ lineHeight: '1.2rem' }}>
                <span style={{ color: 'red', fontWeight: 'bold' }}>●</span>{' '}
                <FormattedHTMLMessage id="baja_o_incremento" />
                <br />
                <span style={{ color: 'darkgray' }}>●︎</span>{' '}
                <FormattedHTMLMessage id="Number of homicides" />
                <br />
                <FormattedHTMLMessage id="tendencia_anomalias" />
              </p>
            </div>
            <LazyLoad once offset={700}>
              <SMDiarioAnomalias />
            </LazyLoad>
          </div>
          <hr />
          <div id="daily-states">
            <h3 className="title is-3">
              <FormattedHTMLMessage id="states_daily_report" />
            </h3>
            {/* {intl.formatMessage({
              id: 'trend_significant',
            })} */}

            <a name="smstates" />
            <div className="columns">
              <div className="column is-half is-offset-5">
                <p style={{ lineHeight: '1.2rem' }}>
                  <FormattedHTMLMessage id="snsp-victims" />
                  <br />
                  <FormattedHTMLMessage id="preliminary_homicides" />
                  <br />
                  <FormattedHTMLMessage id="prediction_homicides" />
                </p>
              </div>
            </div>

            <LazyLoad once offset={700}>
              <SMDiario />
            </LazyLoad>
          </div>
        </div>

        <hr style={{ backgroundColor: '#fff' }} />
      </div>
    </Layout>
  )
}

export default ReporteDiario
