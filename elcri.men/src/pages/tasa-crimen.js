import React from 'react'
import Helmet from 'react-helmet'

import { format as num_format } from 'd3-format'
import Layout from '../components/layout'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import HeroTitle from '../components/HeroTitle'
import { IoIosArrowDroprightCircle } from 'react-icons/io'

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

import social_image from '../assets/images/social/social-crimen-tasas.png'
import social_image_en from '../assets/images/social/social-crimen-tasas_en.png'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  ToolboxComponent,
])

const prevalencia_hogares = [
  { year: 2012, per: 32.4 },
  { year: 2013, per: 33.9 },
  { year: 2014, per: 33.2 },
  { year: 2015, per: 34.0 },
  { year: 2016, per: 34.2 },
  { year: 2017, per: 35.6 },
  { year: 2018, per: 33.9 },
  { year: 2019, per: 29.2 },
  { year: 2020, per: 28.4 },
  { year: 2021, per: 29.0 },
  { year: 2022, per: 27.4 },
]

const prevalencia_personas = [
  { year: 2012, per: 27337 },
  { year: 2013, per: 28224 },
  { year: 2014, per: 28200 },
  { year: 2015, per: 28202 },
  { year: 2016, per: 28788 },
  { year: 2017, per: 29746 },
  { year: 2018, per: 28269 },
  { year: 2019, per: 24849 },
  { year: 2020, per: 23520 },
  { year: 2021, per: 24207 },
  { year: 2022, per: 22587 },
]

function CrimeRate(props) {
  const intl = useIntl()
  const comma = num_format(',.0f')

  const genChartOptions = function(data, yAxis, tooltip) {
    return {
      animation: false,
      title: {
        text: '',
        left: 'center',
        textStyle: {
          fontFamily: 'Roboto Condensed, Ubuntu, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 'bold',
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
            fontFamily: 'Roboto Condensed, Ubuntu, system-ui, sans-serif',
          },
        },
        /* formatter: function (item) {
            let date = YYYYmmddToDate15(item[0].name);
            let datestr = [
              date.toLocaleString(props.lang, { month: "long" }),
              date.getFullYear(),
            ].join(" ");
            let c = CDMXRate[item[0].dataIndex].count;
            return (
              `${datestr}<br/><b>` +
              t("Rate") +
              `</b>:${Math.round(item[0].data * 10) / 10} <i>(${c} ` +
              t("homicides") +
              ")</i>"
            );
          }, */
      },
      grid: {
        left: '13%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        nameTextStyle: {
          fontFamily: 'Roboto Condensed, Ubuntu, system-ui, sans-serif',
          color: '#111',
        },
        data: data.map(function(item) {
          return item.year
        }),
        axisLabel: {
          interval: 2,
        },
        boundaryGap: ['20%', '0%'],
        splitNumber: 6,
      },
      yAxis: [
        {
          name: yAxis,
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            fontFamily: 'Roboto Condensed, Ubuntu, system-ui, sans-serif',
            color: '#111',
          },
          type: 'value',
          scale: false,
          splitNumber: 2,
          splitLine: {
            show: true,
            lineStyle: {
              type: 'solid',
            },
          },
        },
      ],
      series: [
        {
          name: tooltip,
          type: 'bar',
          color: '#542600',
          barWidth: '85%',
          itemStyle: { borderWidth: 10 },
          data: data.map(function(item) {
            return item.per
          }),
        },
      ],
    }
  }

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
        title={intl.formatMessage({ id: 'title_crimen_tasa' })}
        description={intl.formatMessage({ id: 'desc_crimen_tasas' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'http://schema.org/',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: intl.formatMessage({
                  id: 'What is the crime rate in Mexico',
                }),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    intl.formatMessage({
                      id: 'The crime rate in Mexico is',
                    }) +
                    ' ' +
                    comma(
                      prevalencia_personas[prevalencia_personas.length - 1].per
                    ) +
                    ' ' +
                    intl.formatMessage({ id: 'per' }) +
                    '100,000',
                },
              },
            ],
          })}
        </script>
      </Helmet>
      <div className="container is-fullhd">
        <HeroTitle>{intl.formatMessage({ id: 'crime-rate-title' })}</HeroTitle>

        <section>
          <div className="columns is-multiline" id="small-multiples">
            <div className="column is-half">
              <h2 className="title is-4">
                {intl.formatMessage({ id: 'title_hogar' })}
              </h2>
            </div>
            <div className="column is-half">
              <h2 className="title is-4">
                {intl.formatMessage({ id: 'title_100k' })}
              </h2>
            </div>
            <div className="column is-half">
              <ReactEChartsCore
                echarts={echarts}
                option={(() =>
                  genChartOptions(
                    prevalencia_hogares,
                    intl.formatMessage({ id: '% households' }),
                    intl.formatMessage({ id: 'percentage' })
                  ))()}
                style={{ height: 400, width: '100%' }}
              />
            </div>
            <div className="column is-half">
              <ReactEChartsCore
                echarts={echarts}
                option={(() =>
                  genChartOptions(
                    prevalencia_personas,
                    intl.formatMessage({ id: 'tasa por 100,000' }),
                    intl.formatMessage({ id: '# personas' })
                  ))()}
                style={{ height: 400, width: '100%' }}
              />
            </div>
          </div>
        </section>
        <hr />

        <TextColumn>
          <FormattedHTMLMessage id="crime_text" />
        </TextColumn>

        <hr />
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
                            id: 'What is the crime rate in Mexico',
                          })}
                        </h3>
                        <p>
                          {intl.formatMessage({
                            id: 'The crime rate in Mexico is',
                          })}{' '}
                          {comma(
                            prevalencia_personas[
                              prevalencia_personas.length - 1
                            ].per
                          )}{' '}
                          {intl.formatMessage({ id: 'per' })} 100,000 {' '}{intl.formatMessage({
                            id: 'in',
                          })}{' '} {prevalencia_personas[
                              prevalencia_personas.length - 1
                            ].year}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CrimeRate
