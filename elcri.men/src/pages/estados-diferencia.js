import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
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

import Layout from '../components/layout'
import HeroTitle from '../components/HeroTitle'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
import AdSense from 'react-adsense'
import { mapValues } from 'lodash-es'
import { useIntl, injectIntl, FormattedMessage } from 'react-intl'
import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import social_image from '../assets/images/social/social-estados-diff.png'
import social_image_en from '../assets/images/social/social-estados-diff_en.png'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
])

function MostViolent(props) {
  const chartHeight = 1020
  const intl = useIntl()
  const labelRight = {
    position: 'right',
  }
  var option = {
    autoPlay: true,
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      textStyle: {
        fontFamily: 'Source Sans Pro',
      },
      formatter: params => {
        return (
          '<b>' +
          params[0].data.state +
          '</b><br>' +
          intl.formatMessage({ id: 'rate difference' }) +
          ': <b>' +
          (params[0].value >= 0 ? '+' + params[0].value : params[0].value) +
          '</b><br>' +
          intl.formatMessage({ id: 'count difference' }) +
          ': <b>' +
          (params[0].data.count_diff >= 0
            ? '+' + params[0].data.count_diff
            : params[0].data.count_diff) +
          '</b>'
        )
      },
    },
    grid: {
      top: 20,
      bottom: 30,
      height: chartHeight - 100,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'value',
        position: 'top',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
    ],
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: intl.formatMessage({ id: 'rate difference' }),
        type: 'bar',
        stack: 'Total',
        barCategoryGap: '7%',
        label: {
          fontFamily: 'Roboto Condensed',
          fontWeight: 500,
          show: true,
          formatter: '{b}',
          position: 'left',
          textBorderColor: 'black',
        },
      },
    ],
  }
  const [data, setdata] = useState(null)
  const [states, setStates] = useState(null)
  const [barOptions, setBarOptions] = useState(null)
  const eChartsRef = React.useRef(null)

  useEffect(() => {
    fetch('/elcrimen-json/states_diff.json')
      .then(response => response.json())
      .then(responseJSON => {
        let states = responseJSON.map(s => s.state)
        mapValues(responseJSON, function(val, key) {
          if (val.value >= 0)
            val.itemStyle = {
              color: '#b2182b',
            }
          else {
            val.label = { position: 'right' }
            val.itemStyle = {
              color: '#2166ac',
            }
          }
        })
        const option2 = {
          ...option,
          yAxis: { ...option.yAxis, data: states },
          series: [{ ...option.series[0], data: responseJSON }],
        }
        setBarOptions(option2)
        setStates(states)
        setdata(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const last_date = useLastMonth()
  const last_year2 = new Date(last_date.year - 1, last_date.month6 - 1, 1)
  const last_year1 = new Date(last_date.year6 - 1, last_date.month - 1, 1)

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet
        link={[
          {
            rel: 'preload',
            href:
              '/static/source-sans-pro-v13-latin-regular.subset-6b67f4639bb02f388b7e72e34e180d7f.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        ]}
      />
      <SEO
        title={intl.formatMessage({ id: 'title_state_diff' })}
        description={intl.formatMessage({ id: 'desc_state_diff' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div id="estados-diferencia">
        <HeroTitle>
          {intl.formatMessage({
            id: '12-month change in homicides rates by state (',
          })}
          <i>
            {props.pageContext.locale === 'es'
              ? last_date.month_short_es6
              : last_date.month_short_en6}{' '}
            <FormattedDate
              value={new Date(last_date.iso_mid6)}
              year="numeric"
            />
            {intl.formatMessage({ id: '-' })}
            {props.pageContext.locale === 'es'
              ? last_date.month_short_es
              : last_date.month_short_en}{' '}
            <FormattedDate value={new Date(last_date.iso_mid)} year="numeric" />{' '}
          </i>
          {intl.formatMessage({ id: 'vs' })}
          <i>
            {' '}
            {props.pageContext.locale === 'es'
              ? last_date.month_short_es6
              : last_date.month_short_en6}{' '}
            <FormattedDate value={last_year1} year="numeric" />
            {intl.formatMessage({ id: '-' })}
            {props.pageContext.locale === 'es'
              ? last_date.month_short_es
              : last_date.month_short_en}{' '}
            <FormattedDate value={last_year2} year="numeric" />
          </i>
          {')'}
        </HeroTitle>

        <div className="container is-fullhd">
          <div className="columns is-centered">
            <div className="column is-8-desktop is-full-mobile is-full-tablet">
              {data ? (
                <div style={{ height: chartHeight + 80 }}>
                  <ReactEChartsCore
                    echarts={echarts}
                    option={barOptions}
                    style={{ height: chartHeight, width: '100%' }}
                    notMerge={true}
                    ref={eChartsRef}
                  />
                </div>
              ) : (
                <div
                  className="has-background-skeleton"
                  style={{ height: chartHeight + 80 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MostViolent
