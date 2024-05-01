import React, { useState, useEffect } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import ReactDOM from 'react-dom'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import { timeFormatDefaultLocale } from 'd3-time-format'
import { timeFormat as date_format } from 'd3-time-format'

import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import { useIntl, injectIntl, FormattedMessage } from 'react-intl'

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

import { dateLoc } from '../../src/i18n'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  ToolboxComponent,
])

var stateCodes = {
  national: 'national',
  aguascalientes: '1',
  'baja california': '2',
  'baja california sur': '3',
  campeche: '4',
  coahuila: '5',
  colima: '6',
  chiapas: '7',
  chihuahua: '8',
  'ciudad de méxico': '9',
  durango: '10',
  guanajuato: '11',
  guerrero: '12',
  hidalgo: '13',
  jalisco: '14',
  méxico: '15',
  michoacán: '16',
  morelos: '17',
  nayarit: '18',
  'nuevo león': '19',
  oaxaca: '20',
  puebla: '21',
  querétaro: '22',
  'quintana roo': '23',
  'san luis potosí': '24',
  sinaloa: '25',
  sonora: '26',
  tabasco: '27',
  tamaulipas: '28',
  tlaxcala: '29',
  veracruz: '30',
  yucatán: '31',
  zacatecas: '32',
}

const round1 = format('.1f')

function HistoricalChart(props) {
  const preliminary = useStaticQuery(graphql`
    query HistoricalChartQuery {
      site {
        siteMetadata {
          preliminaryINEGI
        }
      }
      site {
        siteMetadata {
          monthsPreliminaryINEGI
        }
      }
    }
  `)

  const [data, setData] = useState(null)
  const [state, setState] = useState(
    stateCodes[
      decodeURIComponent(props.hash.replace(/#historical#/, '').toLowerCase())
    ] === undefined
      ? 'national'
      : stateCodes[
          decodeURIComponent(
            props.hash.replace(/#historical#/, '').toLowerCase()
          )
        ]
  )
  const round1 = format('.1f')
  const comma = format(',')

  useEffect(() => {
    fetch('/elcrimen-json/national_1990.json')
      .then(response => response.json())
      .then(responseJSON => {
        setData(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const formatData = data => {
    // This is needed to show preliminary INEGI data as a dotted line
    let data2

    data2 = [data[state][0], data[state][1]]
    if (preliminary.site.siteMetadata.preliminaryINEGI)
      data2 = [
        data2[0],
        data2[1].slice(
          0,
          data2[1].length - preliminary.site.siteMetadata.monthsPreliminaryINEGI
        ),
        data2[1].slice(
          data2[1].length -
            (preliminary.site.siteMetadata.monthsPreliminaryINEGI + 1),
          data2[1].length
        ),
      ]
    return data2
  }

  const mouseOver = (d, i) => {
    //var date = new Date(d.d)
    //var day = d.d.getDate()
    //var monthIndex = d.d.getMonth()
    var year = d.d.getFullYear()
    //console.log(d)
    const element = (
      <span dangerouslySetInnerHTML={{ __html: year + ' aaaa' }} />
    )
    ReactDOM.render(element, document.getElementById('national-caption'))
  }

  const handleSelect = e => {
    const { value } = e.target
    setState(value)
  }
  const intl = useIntl()
  let l
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null

  let chartOption = {
    animation: true,
    animationDuration: 0,
    toolbox: {
      show: true,
      showTitle: false,
      tooltip: {
        show: true,
        padding: 2,
        formatter: () => intl.formatMessage({ id: 'Save as' }),
      },
      textStyle: {
        fontColor: '#111',
      },
      feature: {
        saveAsImage: {
          show: true,
          type: 'png',
          name: 'datos-historicos-homicidio.png',
          icon:
            'path://M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z',
        },
      },
    },
    title: {
      text: intl.formatMessage({
        id: 'Datos Históricos de Homicidio',
      }),
      top: '3%',
      left: 'center',
      textStyle: {
        fontFamily: 'Trebuchet MS',
        fontSize: 14,
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
        function YYYYmmddToDate15(str) {
          let date = new Date()
          let date_components = str.split('-')
          date.setFullYear(date_components[0])
          // js months start at 0
          date.setMonth(date_components[1] - 1)
          date.setDate(15)
          return date
        }
        let date = YYYYmmddToDate15(item[0].name)
        let datestr = [
          date.toLocaleString(intl.locale, { month: 'long' }),
          date.getFullYear(),
        ].join(' ')
        let tasa = intl.formatMessage({ id: 'rate' })
        let inegi_rate = typeof item[1] === 'undefined' ? '-' : round1(item[1].value)
        let snsp_rate = typeof item[0].value === 'undefined' ? '-' : round1(item[0].value)
        return (
          `${datestr}<br/>${tasa} <span class="inegi">INEGI</span>: <b>${inegi_rate}</b> ` +
          `<br/>${tasa} <span class="snsp">SNSP</span>: <b>${snsp_rate}</b>`
        )
      },
    },
    grid: {
      left: '40',
      right: '2%',
      bottom: '9%',
      top: '25%',
      containLabel: false,
    },
    xAxis: {
      animation: false,
      type: 'category',
      // Second array has the INEGI data which starts earlier than the SNSP (1990 vs 2015)
      data:
        data === null
          ? null
          : [
              ...formatData(data)[1].map(item => item.d),
              ...formatData(data)[0].flatMap((item, i) => {
                if (i <= formatData(data)[1].length - (12 * (2015 - 1990) + 1))
                  return []
                else return item.d
              }),
            ],
      axisLabel: {
        //maxInterval: 11,
        //minInterval: 11,
        interval: function(index, value) {
          var date = new Date(value)
          if ((date.getFullYear() % 10 === 0) & (date.getMonth() % 12 === 0))
            return true
        },
        formatter: function(value, idx) {
          var date = new Date(value)
          return [
            date.toLocaleString(intl.locale, { month: 'short' }),
            date.getFullYear(),
          ].join('\n')
        },
      },
      boundaryGap: false,
      splitNumber: 4,
    },
    yAxis: [
      {
        max:
          data === null
            ? null
            : Math.round(
                Math.max(
                  ...[
                    ...formatData(data)[1].map(item => item.r),
                    ...formatData(data)[0].map(item => item.r),
                  ]
                ) / 10
              ) *
                10 +
              5,
        animation: false,
        name: intl.formatMessage({ id: 'tasa anualizada' }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial' },
        type: 'value',
        scale: false,
        splitNumber: 2,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: ['#b3b2b2', '#b3b2b2', '#b3b2b2', 'transparent'],
            width: 0.4,
          },
        },
        axisLabel: {
          margin: 0,
          padding: [0, 5, 0, 0],
          formatter: (v,i) => i < 3 ? v : "",
          interval: (index, value) => {
            if (value % 10 === 0) return true
          },
        },
      },
    ],
    series: [
      {
        emphasis: { disable: true },
        name: 'SNSP',
        type: 'line',
        data:
          data === null
            ? null
            : data === null
            ? null
            : formatData(data)[0].flatMap((item, i) => {
                if (i === 0) return Array(12 * (2015 - 1990) + 1).fill(null)
                else return item.r
              }),
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
        emphasis: { disable: true },
        name: 'INEGI',
        type: 'line',
        data: data === null ? null : formatData(data)[1].map(item => item.r),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 1.2,
          color: '#b35806',
        },
        showSymbol: false,
      },
      {
        emphasis: { disable: true },
        name: 'INEGI preliminary',
        type: 'line',
        data:
          data === null
            ? null
            : formatData(data).length === 3
            ? [
                ...Array(formatData(data)[1].length).fill(null),
                ...formatData(data)[2].map(item => item.r),
              ]
            : null,
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 1.2,
          color: '#b35806',
          type: 'dashed',
        },
        showSymbol: false,
      },
    ],
  }
  return (
    <div className="columns is-multiline" id="national90">
      <div className="column is-half">
        <div className="select is-pulled-right">
          <select
            className="is-hovered"
            id="state_select"
            onChange={handleSelect}
            aria-label="Select State"
            value={state}
          >
            <option value="national">
              {intl.formatMessage({ id: 'All of Mexico' })}
            </option>
            <option value="1">Aguascalientes</option>
            <option value="2">Baja California</option>
            <option value="3">Baja California Sur</option>
            <option value="4">Campeche</option>
            <option value="5">Coahuila</option>
            <option value="6">Colima</option>
            <option value="7">Chiapas</option>
            <option value="8">Chihuahua</option>
            <option value="9">Ciudad de México</option>
            <option value="10">Durango</option>
            <option value="11">Guanajuato</option>
            <option value="12">Guerrero</option>
            <option value="13">Hidalgo</option>
            <option value="14">Jalisco</option>
            <option value="15">México</option>
            <option value="16">Michoacán</option>
            <option value="17">Morelos</option>
            <option value="18">Nayarit</option>
            <option value="19">Nuevo León</option>
            <option value="20">Oaxaca</option>
            <option value="21">Puebla</option>
            <option value="22">Querétaro</option>
            <option value="23">Quintana Roo</option>
            <option value="24">San Luis Potosí</option>
            <option value="25">Sinaloa</option>
            <option value="26">Sonora</option>
            <option value="27">Tabasco</option>
            <option value="28">Tamaulipas</option>
            <option value="29">Tlaxcala</option>
            <option value="30">Veracruz</option>
            <option value="31">Yucatán</option>
            <option value="32">Zacatecas</option>
          </select>
        </div>
      </div>
      <div className="column is-half">
        <p style={{ lineHeight: '1.2rem' }}>
          <FormattedHTMLMessage id="inegi-legend" />
          <br />
          <FormattedHTMLMessage id="snsp-victims" />
        </p>
      </div>

      <div className="column is-full">
        <a name="historical" id="historical" />
        <div id="national90">
          <figure className="image is-2by1 is-historical">
            <div className="has-ratio">
              {data ? (
                <ReactEChartsCore
                  echarts={echarts}
                  option={chartOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ locale: echarts.registerLocale('ES') }}
                />
              ) : (
                <div />
              )}
            </div>
          </figure>
        </div>

        {preliminary.site.siteMetadata.preliminaryINEGI ? (
          <p>
            <FormattedHTMLMessage id="prelim1" />
            {preliminary.site.siteMetadata.monthsPreliminaryINEGI}
            <FormattedHTMLMessage id="prelim2" />
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default HistoricalChart
