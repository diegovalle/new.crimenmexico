import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import { format as num_format } from 'd3-format'
import Layout from '../components/layout'
import { FormattedDate } from 'react-intl'
import SEO from '../components/SEO'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { YYYYmmddToDate15 } from '../components/utils'
import HeroTitle from '../components/HeroTitle'
import TextColumn from '../components/TextColumn'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
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
])

function ReporteDiario(props) {
  const intl = useIntl()
  const [data, setData] = useState(null)
  const [table, setTable] = useState(null)
  const [maxDate, setMaxDate] = useState(null)
  const [snspData, setSNSPData] = useState(null)

  const comma = num_format(',.0f')
  const round1 = num_format('.1f')

  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
  }

  useEffect(() => {
    fetch('https://elcrimen-diario.web.app/informe_diario.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        responseJSON = responseJSON.filter((item) => item[0] > '2023-01-01')
        setData(responseJSON)
        setMaxDate(responseJSON[responseJSON.length - 1][0])
      })
      .catch((error) => {
        console.error(error)
      })
    fetch('https://elcrimen-diario.web.app/por_dia.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        setTable(responseJSON)
      })
      .catch((error) => {
        console.error(error)
      })
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
          `<b>${rollmean}</b>: ${data[item.dataIndex][3]}<br/>`
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
        interval: 368,
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
          borderColor: '#777',
          opacity: 0.8,
        },
      },
      {
        type: 'line',
        emphasis: {
          lineStyle: { color: 'blue' },
        },
        name: intl.formatMessage({
          id: '30 day average',
        }),
        data: data === null ? null : data.map((item) => item[3]),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 3,
          color: '#156cff',
        },
        showSymbol: false,
        symbol: 'none',
      },
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
        id: 'Number of homicides per day',
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
          id: 'number of homicides per day',
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
          id: 'preliminary',
        }),
        data: table === null ? null : table.map((item) => item[2]),
        itemStyle: {
          color: '#4daf4a',
        },
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
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
                if (i === table.length - 2) return item[3]
                if (item[3] === null)
                  return (
                    Math.round((((item[2] + 11.73) * item[1]) / item[1]) * 10) /
                    10
                  )
                else return null
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
    return data.map(function (item, index) {
      return (
        <tr key={index}>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '1'}
          >
            <FormattedDate
              value={new Date(YYYYmmddToDate15(item[0]))}
              month="long"
              year="numeric"
              timeZone="America/Mexico_City"
            />
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '2'}
            style={{ textAlign: 'right', fontFamily: 'monospace' }}
          >
            {Math.round(item[2] * 10) / 10} (
            {comma(Math.round(item[2] * item[1]))})
          </td>
          <td
            className={locale === 'es' ? 'es_diario' : 'en_diario'}
            key={index + '3'}
            style={{
              textAlign: 'right',
              fontFamily: 'monospace',
              backgroundColor: item[3] ? '' : '#f8766d',
            }}
          >
            {item[3]
              ? Math.round(item[3] * 10) / 10 +
                ' (' +
                comma(Math.round(item[3] * item[1])) +
                ')'
              : Math.round((((item[2] + 11.73) * item[1]) / item[1]) * 10) /
                  10 +
                ' (' +
                comma(Math.round((item[2] + 11.73) * item[1])) +
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
      <HeroTitle>
        {intl.formatMessage({ id: 'Daily Homicides in Mexico' })}{' '}
        {maxDate !== null ? (
          <i>
            <FormattedDate
              value={new Date(maxDate + 'T00:00:00.000-06:00')}
              day="2-digit"
              month="long"
              year="numeric"
              timeZone="America/Mexico_City"
            />
          </i>
        ) : (
          '⠀⠀ ⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⠀⠀'
        )}
      </HeroTitle>
      <div className="container is-fullhd" id="trends">
        <article id="content">
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
        </article>

        <h3 className="title is-3">
          <FormattedHTMLMessage id="daily_in_red_title" />
        </h3>
        <TextColumn>
          <FormattedHTMLMessage id="daily_in_red" />
        </TextColumn>

        <article id="content_chart2">
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
                        id: 'Preliminary',
                      })}
                    </th>
                    <th>
                      {intl.formatMessage({
                        id: 'SNSP (oficial data)',
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
        <TextColumn>
          <FormattedHTMLMessage id="daily_text" />
        </TextColumn>
      </div>
    </Layout>
  )
}

export default ReporteDiario
