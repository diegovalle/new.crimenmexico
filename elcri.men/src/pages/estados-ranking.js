import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import { titleCasePlaces } from '../components/utils.js'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from 'echarts/components'
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers'

import { IoIosArrowDroprightCircle } from 'react-icons/io'
import Layout from '../components/layout'
import HeroTitle from '../components/HeroTitle'
import SEO from '../components/SEO'
// import AdSense from 'react-adsense'
import { mapValues } from 'lodash-es'
import { useIntl } from 'react-intl'
import { FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import social_image from '../assets/images/social/social-estados-ranking.png'
import social_image_en from '../assets/images/social/social-estados-ranking_en.png'

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
      formatter: (params) => {
        return (
          '<b>' +
          params[0].data.state +
          '<br/></b>' +
          intl.formatMessage({ id: 'rate' }) +
          ': ' +
          '<b>' +
          params[0].value +
          '</b><br/>' +
          intl.formatMessage({ id: 'homicides' }) +
          ': ' +
          '<b>' +
          params[0].data.count_diff +
          '</b>'
        )
      },
    },
    grid: {
      top: 0,
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
      //axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        fontWeight: '500',
        margin: 3,
        overflow: 'break',
        fontFamily: 'Roboto Condensed',
        fontSize: 15,
        lineHeight: 14,
        color: '#111',
        formatter: (params) => {
          return params.replace(' ', '\n')
        },
      },
    },
    series: [
      {
        type: 'bar',
        stack: 'Total',
        barCategoryGap: '5%',
        barMaxWidth: 24,
        barWidth: '100%',
      },
    ],
  }
  const [data, setdata] = useState(null)
  const [states, setStates] = useState(null)
  const [barOptions, setBarOptions] = useState(null)
  const eChartsRef = React.useRef(null)

  useEffect(() => {
    fetch('/elcrimen-json/states_yearly_rates.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        let states = responseJSON.map((s) => titleCasePlaces(s.state))
        mapValues(responseJSON, function (val, key) {
          val.itemStyle = {
            color: '#fc4e2a',
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
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const last_date = useLastMonth()

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet />
      <SEO
        title={intl.formatMessage({ id: 'title_ranking' })}
        description={intl.formatMessage({ id: 'desc_ranking' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div id="estados-ranking">
        <HeroTitle>
          {intl.formatMessage({
            id: 'Most violent states during the last 12 months (',
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
            <FormattedDate value={new Date(last_date.iso_mid)} year="numeric" />
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
                  />{' '}
                </div>
              ) : (
                <div style={{ height: chartHeight + 80 }}>
                  <div className="is-hidden-desktop columns is-mobile is-centered">
                    <div className="box">
                      <div role="status" className="circle-spin-2"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr />
      {states ? (
        <div className="columns is-centered">
          <div className="column is-6-fullhd is-8-widescreen is-10-desktop is-12-tablet">
            <div className="content is-medium">
              <h2 className="title has-text-centered" data-config-id="header">
                {intl.formatMessage({ id: 'Frequently Asked Questions' })}
              </h2>
              <div className="block" data-config-id="faq">
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'What is the most dangerous state in Mexico?',
                          })}
                        </h3>
                        <p>
                          {intl.formatMessage({
                            id: 'The most dangerous state in Mexico is',
                          })}{' '}
                          {states[states.length - 1]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="block" data-config-id="faq">
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'Is Mexico Safe?',
                          })}
                        </h3>
                        <p>
                          {intl.formatMessage({
                            id: 'The safety of Mexico varies significantly depending on the specific location and circumstances. ',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="block" data-config-id="faq">
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'What are the most dangerous states in México?',
                          })}
                        </h3>
                        <p>
                          {intl.formatMessage({
                            id: 'The most dangerous states in Mexico are ',
                          })}{' '}
                          {states[states.length - 1]}
                          {', '}
                          {states[states.length - 2]}
                          {', '}
                          {states[states.length - 3]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="block" data-config-id="faq">
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'What is the safest part of mexico?',
                          })}
                        </h3>
                        <p>
                          {intl.formatMessage({
                            id: 'The safest part of Mexico is ',
                          })}{' '}
                          {states[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  )
}

export default MostViolent
