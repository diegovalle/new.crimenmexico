import React from 'react'
import Helmet from 'react-helmet'

import { curveLinear as linear } from 'd3-shape'
import { format as num_format } from 'd3-format'
import Layout from '../components/layout'
import SmallMultiple from '../components/SmallMultiple'
import HeroTitlewithLegend from '../components/HeroTitlewithLegend'
import LegendLine from '../components/LegendLine'
import { flatten, maxBy } from 'lodash-es'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
import { useIntl, FormattedHTMLMessage } from 'react-intl'

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

import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'

import social_image from '../assets/images/social/social-envipe.png'
import social_image_en from '../assets/images/social/social-envipe_en.png'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  ToolboxComponent,
])

var lesiones_data = [
  [
    { date: 2015, value: 1072610, sup: 1169170, inf: 976050 },
    { date: 2016, value: 968451, sup: 1073862, inf: 863040 },
    { date: 2017, value: 1004432, sup: 1004432 + 53448, inf: 1004432 - 53448 },
    {
      date: 2018,
      value: 1032059,
      sup: 1032059 + 78700.1618011502,
      inf: 1032059 - 78700.1618011502,
    },
    {
      date: 2019,
      value: 1102457,
      sup: 1102457 + 112375.118767821,
      inf: 1102457 - 112375.118767821,
    },
    {
      date: 2020,
      value: 928471,
      sup: 928471 + 52192.4166909969,
      inf: 928471 - 52192.4166909969,
    },
    {
      date: 2021,
      value: 1005025,
      sup: 1005025 + 59030.4508951442,
      inf: 1005025 - 59030.4508951442,
    },
    {
      date: 2022,
      value: 1017768,
      sup: 1017768 + 58608.0764495694,
      inf: 1017768 - 58608.0764495694,
    },
  ],
  [
    { date: 2015, value: 153458 },
    { date: 2016, value: 149961 },
    { date: 2017, value: 167680 },
    { date: 2018, value: 170572 },
    { date: 2019, value: 181936 },
    { date: 2020, value: 161071 },
    { date: 2021, value: 170460 },
    { date: 2022, value: 180683 },
  ],
]
var secuestro_data = [
  [
    { date: 2015, value: 62636, sup: 77530, inf: 47742 },
    { date: 2016, value: 66842, sup: 81522, inf: 52162 },
    { date: 2017, value: 80319, sup: 80319 * 1.21, inf: 80319 * 0.79 },
    { date: 2018, value: 79315, sup: 92998, inf: 65632 },
    { date: 2019, value: 105189, sup: 129706, inf: 80672 },
    { date: 2020, value: 74393, sup: 89015, inf: 59771 },
    { date: 2021, value: 56994, inf: 46533, sup: 67455 },
    { date: 2022, value: 69829, inf: 57430, sup: 82228 },
  ],
  [
    { date: 2015, value: 1312 },
    { date: 2016, value: 1381 },
    { date: 2017, value: 1390 },
    { date: 2018, value: 1560 },
    { date: 2019, value: 1630 },
    { date: 2020, value: 1047 },
    { date: 2021, value: 815 },
    { date: 2022, value: 724 },
  ],
]
var extorsion_data = [
  [
    { date: 2015, value: 7100878, sup: 7377798, inf: 6823958 },
    { date: 2016, value: 7503477, sup: 7787836, inf: 7219118 },
    {
      date: 2017,
      value: 6590728,
      sup: 6590728 + 182555,
      inf: 6590728 - 182555,
    },
    {
      date: 2018,
      value: 5716346,
      sup: 5716346 + 155019,
      inf: 5716346 - 155019,
    },
    {
      date: 2019,
      value: 4617275,
      sup: 4617275 + 189696.522637496,
      inf: 4617275 - 189696.522637496,
    },
    {
      date: 2020,
      value: 4660898,
      sup: 4660898 + 136221.422399905,
      inf: 4660898 - 136221.422399905,
    },
    {
      date: 2021,
      value: 4910206,
      sup: 4910206 + 137417.969098067,
      inf: 4910206 - 137417.969098067,
    },
    {
      date: 2022,
      value: 4726724,
      sup: 4726724 + 142299.702778443,
      inf: 4726724 - 142299.702778443,
    },
  ],
  [
    { date: 2015, value: 6223 },
    { date: 2016, value: 5854 },
    { date: 2017, value: 6278 },
    { date: 2018, value: 6895 },
    { date: 2019, value: 9003 },
    { date: 2020, value: 8380 },
    { date: 2021, value: 9408 },
    { date: 2022, value: 11039 },
  ],
]
// ENVIPE: Robo total de vehículo (automóvil, camioneta, camión).
// Amis: https://www.amisprensa.org/wp-content/uploads/2021/02/Robo-de-autos-enero-a-diciembre-2020-V6.pdf
// https://amisprensa.org/public/documentos/conferencia-robo-de-autos-corte-a-diciembre-2022-25.pdf
// SNSP: Robo de coche de 4 ruedas (Unidades)
var robocoche_data = [
  // ENVIPE
  [
    { date: 2015, value: 452001, sup: 486110, inf: 417893 },
    { date: 2016, value: 493727, sup: 527885, inf: 459570 },
    { date: 2017, value: 626088, sup: 626088 + 23985, inf: 626088 - 23985 },
    {
      date: 2018,
      value: 605817,
      sup: 605817 + 23245.2550962169,
      inf: 605817 - 23245.2550962169,
    },
    {
      date: 2019,
      value: 645618,
      sup: 645618 + 26159.9756948209,
      inf: 645618 - 26159.9756948209,
    },
    {
      date: 2020,
      value: 473640,
      sup: 473640 + 20815.1807250605,
      inf: 473640 - 20815.1807250605,
    },
    {
      date: 2021,
      value: 469082,
      sup: 469082 + 20881.7139124846,
      inf: 469082 - 20881.7139124846,
    },
    {
      date: 2022,
      value: 446905,
      sup: 446905 + 20684.1464980831,
      inf: 446905 - 20684.1464980831,
    },
  ],
  // SNSP
  [
    { date: 2015, value: 145796 + 15949 - 15949 },
    { date: 2016, value: 153418 + 22246 - 22246 },
    { date: 2017, value: 179721 + 31938 - 31938 },
    { date: 2018, value: 178935 + 36004 - 36004 },
    { date: 2019, value: 152544 + 35797 - 35797 },
    { date: 2020, value: 115325 + 30804 - 30804 },
    { date: 2021, value: 108680 + 32568 - 32568 },
    { date: 2022, value: 101809 + 36901 - 36901 },
  ],
  // AMIS
  [
    { date: 2015, value: 60700 },
    { date: 2016, value: 69200 },
    { date: 2017, value: 88888 },
    { date: 2018, value: 94159 },
    { date: 2019, value: 85301 },
    { date: 2020, value: 68254 },
    { date: 2021, value: 62142 },
    { date: 2022, value: 60523 },
  ],
]

function Envipe(props) {
  const intl = useIntl()
  const comma = num_format(',.0f')

  const genChartOptions = function(data, title) {
    return {
      animation: false,
      title: {
        padding: [8, 0, 0, 0],
        text: intl.formatMessage({ id: title }),
        left: 'center',
        textStyle: {
          fontFamily: 'Trebuchet MS',
          fontSize: 14,
          fontWeight: 'bold',
          color: "#111"
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
          return `${item[0].name}<br/>` +
            `<b><span class="envipe">ENVIPE</span></b>: ${comma(
              item[0].value
            )}<br/>` +
            `<b><span class="snsp">SNSP</span></b>: ${comma(
              item[3].value
            )}<br/>` +
            (typeof item[4] ===
            'undefined'
            ? ''
            : `<b><span class="amis">AMIS</span></b>: ${comma(item[4].value)}`)
        },
      },
      grid: {
        top: '15%',
        left: '86',
        right: '4%',
        bottom: '8%',
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: data[0].map(function(item) {
          return item.date
        }),
        boundaryGap: false,
        nameTextStyle: { color: '#111' },
        axisLabel: {
          interval: 2,
        },
        splitNumber: 4,
      },
      yAxis: [
        {
          name: intl.formatMessage({ id: 'crimes' }),
          nameLocation: 'middle',
          nameGap: 60,
          nameTextStyle: { fontFamily: 'Arial' },
          type: 'value',
          scale: false,
          splitNumber: 3,
          // interval:
          //   Math.round(Math.round((((props.max_y + 5) / 10) * 10) / 3) / 10) *
          //   10,
          // max: Math.round((props.max_y + 5) / 10) * 10,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#b3b2b2',
              type: 'solid',
              width: 0.4,
            },
          },
          axisLabel: {
            margin: 0,
            padding: [0, 5, 0, 0],
            /*  formatter: (v, i) => (i < 4 ? v : ''),
            interval: (index, value) => {
              if (value % 10 === 0) return true
            }, */
          },
        },
      ],
      series: [
        {
          name: 'ENVIPE',
          type: 'line',
          data: data[0].map(function(item) {
            return item.value
          }),
          itemStyle: {
            color: '#c51b7d',
            opacity: 0.7,
          },
          z: 1000,
          showSymbol: false,
        },
        {
          name: 'ENVIPE Lower',
          type: 'line',
          data: data[0].map(function(item) {
            return item.inf
          }),
          lineStyle: {
            opacity: 0,
          },
          stack: 'confidence-band',
          symbol: 'none',
        },
        {
          name: 'ENVIPE Upper',
          type: 'line',
          data: data[0].map(function(item) {
            return item.sup - item.inf
          }),
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            color: '#777',
          },
          stack: 'confidence-band',
          symbol: 'none',
        },
        {
          name: 'SESNSP',
          type: 'line',
          data: data[1].map(function(item) {
            return item.value
          }),
          itemStyle: {
            color: '#008085',
          },
          lineStyle: {
            width: 2.5,
          },
          showSymbol: false,
        },
        {
          name: 'AMIS',
          type: 'line',
          data:
            typeof data[2] === 'undefined'
              ? null
              : data[2].map(function(item) {
                  return item.value
                }),
          itemStyle: {
            color: '#c05502',
          },
          lineStyle: {
            width: 2.5,
          },
          showSymbol: false,
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
        title={intl.formatMessage({ id: 'title_envipe' })}
        description={intl.formatMessage({ id: 'desc_envipe' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">
        <HeroTitlewithLegend
          legend1={<LegendLine class={'envipe'}>ENVIPE</LegendLine>}
          legend2={
            <LegendLine class={'snsp'}>
              {intl.formatMessage({ id: 'SESNSP victims/cars' })}
            </LegendLine>
          }
          legend3={
            <LegendLine class={'amis'}>
              {intl.formatMessage({ id: 'AMIS insured cars' })}
            </LegendLine>
          }
        >
          {intl.formatMessage({ id: 'Underreporting crime' })}
        </HeroTitlewithLegend>

        <section>
          <div className="columns is-multiline" id="small-multiples">
            <div className="column is-half">
              <div className="line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <ReactEChartsCore
                      echarts={echarts}
                      option={(() =>
                        genChartOptions(robocoche_data, 'Car Robbery'))()}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ locale: echarts.registerLocale('ES') }}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <ReactEChartsCore
                      echarts={echarts}
                      option={(() =>
                        genChartOptions(lesiones_data, 'Lesiones'))()}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ locale: echarts.registerLocale('ES') }}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <ReactEChartsCore
                      echarts={echarts}
                      option={(() =>
                        genChartOptions(extorsion_data, 'Extorsión'))()}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ locale: echarts.registerLocale('ES') }}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <ReactEChartsCore
                      echarts={echarts}
                      option={(() =>
                        genChartOptions(secuestro_data, 'Secuestro'))()}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ locale: echarts.registerLocale('ES') }}
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </section>
        <hr />
        <TextColumn>
          <FormattedHTMLMessage id="envipe_text" />
        </TextColumn>
      </div>
    </Layout>
  )
}

export default Envipe
