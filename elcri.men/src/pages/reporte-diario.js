import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'
import { FormattedDate } from 'react-intl'
import SEO from '../components/SEO'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { YYYYmmddToDate15 } from '../components/utils'
import HeroTitle from '../components/HeroTitle'

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

import '../assets/css/trends.css'

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
  const [maxDate, setMaxDate] = useState(null)

  useEffect(() => {
    fetch('https://elcrimen-diario.web.app/informe_diario.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        setData(responseJSON)
        setMaxDate(responseJSON[responseJSON.length - 1][0])
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
      trigger: 'axis',
      textStyle: {
        color: '#111',
        fontFamily: 'Roboto Condensed',
      },
      axisPointer: {
        animation: false,
      },
      //   formatter: function (item) {
      //     let date = new Date(item[0].name)
      //     let datestr = [
      //       date.toLocaleString(intl.locale, { month: 'long' }),
      //       date.getFullYear(),
      //     ].join(' ')
      //     let rate_diff = intl.formatMessage({ id: 'rate_diff' })
      //     let count_diff = intl.formatMessage({ id: 'count_diff' })
      //     let num = data[item[0].dataIndex].diff_count
      //     return (
      //       `${datestr}<br/>` +
      //       `<b>${rate_diff}</b>: ${round1(item[0].value)}<br/>` +
      //       `<b>${count_diff}</b>: ${comma(num)}<br/>`
      //     )
      //   },
    },
    grid: {
      left: '45',
      right: '2%',
      bottom: '15%',
      top: '10%',
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
          lineStyle: { width: 2.2, color: 'black' },
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
        data: data === null ? null : data.map((item) => item[2]),
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

        <div className="container is-fullhd" id="trends">
          <article id="content">
            <p style={{ lineHeight: '1.2rem' }}>
              <FormattedHTMLMessage id="daily_text" />
            </p>
            <p style={{ textAlign: 'left' }} />
            <br />
          </article>
        </div>
      </div>
    </Layout>
  )
}

export default ReporteDiario
