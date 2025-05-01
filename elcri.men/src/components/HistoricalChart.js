import React, { useState, useEffect } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import ReactDOM from 'react-dom'
import { curveLinear as linear } from 'd3-shape'
import { format } from 'd3-format'
import { timeFormatDefaultLocale } from 'd3-time-format'
import { merge } from 'lodash-es'

import { FormattedHTMLMessage } from 'react-intl'
import { useIntl } from 'react-intl'

import './IndexTable/index_table_en.css'
import './IndexTable/index_table_es.css'

import ReactEChartsCore from 'echarts-for-react/lib/core'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
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

import { dateLoc } from '../../src/i18n'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
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
  const [homicideTable, setHomicideTable] = useState(null)
  const [homRateInegi, setHomRateInegi] = useState(null)
  const [homRateSnsp, setHomRateSnsp] = useState(null)
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
    const aggYear = (responseJSON, i) => {
      responseJSON.national[i].forEach(
        (x, i) => (x['year'] = x.d.substring(0, 4))
      )
      let yearly = Object.values(
        responseJSON.national[i].reduce((agg, value, i) => {
          if (agg[value.year] === undefined)
            agg[value.year] = { year: value.year, c: 0, num_months: 0 }
          agg[value.year].c += +value.c
          agg[value.year].num_months = i + 1
          return agg
        }, {})
      )
      yearly = yearly.filter((year) => !(year.num_months % 12))
      for (let j = 0; j < yearly.length; j++) {
        yearly[j].population =
          responseJSON.national[i][yearly[j].num_months - 6].p
      }
      return yearly
    }
    fetch('/elcrimen-json/national_1990.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        setData(responseJSON)
        let yearlySNSP = aggYear(responseJSON, 0)
        let yearlyINEGI = aggYear(responseJSON, 1)
        let maxYear = yearlySNSP[yearlySNSP.length - 1].year
        yearlySNSP = yearlySNSP.filter((item) => item.year >= maxYear - 5)
        yearlyINEGI = yearlyINEGI.filter((item) => item.year >= maxYear - 5)
        yearlyINEGI.forEach((item) => (item.inegi = item.c))
        yearlySNSP.forEach((item) => (item.snsp = item.c))
        setHomRateInegi(
          (yearlyINEGI[yearlyINEGI.length - 1].inegi /
            yearlyINEGI[yearlyINEGI.length - 1].population) *
            1e5
        )
        setHomRateSnsp(
          (yearlySNSP[yearlySNSP.length - 1].snsp /
            yearlySNSP[yearlySNSP.length - 1].population) *
            1e5
        )
        setHomicideTable(merge(yearlyINEGI, yearlySNSP))
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const formatData = (data) => {
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

  const handleSelect = (e) => {
    const { value } = e.target
    setState(value)
  }
  const intl = useIntl()
  let l
  intl.locale === 'es' ? (l = timeFormatDefaultLocale(dateLoc.es_MX)) : null

  let chartOption = {
    animation: false,
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
      iconsize: 10,
      feature: {
        saveAsImage: {
          show: true,
          type: 'png',
          name: 'datos-historicos-homicidio.png',
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
        let inegi_rate =
          typeof item[1] === 'undefined' ? '-' : round1(item[1].value)
        let snsp_rate =
          typeof item[0].value === 'undefined' ? '-' : round1(item[0].value)
        return (
          `${datestr}<br/>${tasa} <span className="inegi">INEGI</span>: <b>${inegi_rate}</b> ` +
          `<br/>${tasa} <span className="snsp">SNSP</span>: <b>${snsp_rate}</b>`
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
              ...formatData(data)[1].map((item) => item.d),
              ...formatData(data)[0].flatMap((item, i) => {
                if (i <= formatData(data)[1].length - (12 * (2015 - 1990) + 1))
                  return []
                else return item.d
              }),
            ],
      axisLabel: {
        fontFamily: 'Arial',
        fontSize: 11,
        color: '#4d4d4d',
        interval: function (index, value) {
          var date = new Date(value)
          if ((date.getFullYear() % 10 === 0) & (date.getMonth() % 12 === 0))
            return true
        },
        formatter: function (value, idx) {
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
                    ...formatData(data)[1].map((item) => item.r),
                    ...formatData(data)[0].map((item) => item.r),
                  ]
                ) / 10
              ) *
                10 +
              5,
        animation: false,
        name: intl.formatMessage({ id: 'tasa anualizada' }),
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontFamily: 'Arial', fontSize: 11, color: '#222' },
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
          fontFamily: 'Arial',
          fontSize: 11,
          color: '#4d4d4d',
          margin: 0,
          padding: [0, 5, 0, 0],
          formatter: (v, i) => (i < 3 ? v : ''),
          interval: (index, value) => {
            if (value % 10 === 0) return true
          },
        },
      },
    ],
    series: [
      {
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'SNSP',
        type: 'line',
        data:
          data === null
            ? null
            : formatData(data)[0].flatMap((item, i) => {
                // Dont forget to add Array[0] (=Jan 2015)
                if (i === 0)
                  return [...Array(12 * (2015 - 1990)).fill(null), item.r]
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
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'INEGI',
        type: 'line',
        data:
          data === null
            ? null
            : formatData(data)[1].map((item) => (item.r === null ? 0 : item.r)),
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
        emphasis: {
          lineStyle: { width: 1.2 },
        },
        name: 'INEGI preliminary',
        type: 'line',
        data:
          data === null
            ? null
            : formatData(data).length === 3
            ? [
                ...Array(formatData(data)[1].length - 1).fill(null),
                ...formatData(data)[2].map((item) => item.r),
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

  const rows = homicideTable
    ? homicideTable.map((element) => (
        <tr key={element.year}>
          <td className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}>
            {element.year}
          </td>
          <td
            align="right"
            className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}
          >
            {element.hasOwnProperty('inegi') ? comma(element.inegi) : 'NA'}
          </td>
          <td
            align="right"
            className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}
          >
            {comma(element.snsp)}
          </td>
          <td
            align="right"
            className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}
          >
            {comma(element.population)}
          </td>

          <td
            align="right"
            className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}
          >
            {element.hasOwnProperty('inegi')
              ? round1((element.inegi / element.population) * 100000)
              : 'NA'}
          </td>
          <td
            align="right"
            className={intl.locale === 'es' ? 'es_hom' : 'en_hom'}
          >
            {round1((element.snsp / element.population) * 100000)}
          </td>
        </tr>
      ))
    : null

  return (
    <React.Fragment>
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
            <figure className="image is-2by1">
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

      <div className="columns is-centered">
        <div className="column is-full">
          {homicideTable ? (
            <h4 className="has-text-centered title is-4">
              {intl.formatMessage({
                id: 'La tasa de homicido en México fue de',
              })}{' '}
              {round1(homRateSnsp)} {intl.formatMessage({ id: 'en el' })}{' '}
              {homicideTable[homicideTable.length - 1].year}{' '}
              {intl.formatMessage({ id: 'según el SNSP' })}
            </h4>
          ) : (
            <h4 className="title is-4">⠀⠀⠀</h4>
          )}

          <div className="columns">
            <div className="column is-offset-3 is-half-desktop is-two-third-fullhd">
              <div className="content is-medium">
                <FormattedHTMLMessage id="homicide_rate" />
              </div>
            </div>
          </div>

          {/* <h4 className="title is-4">{intl.formatMessage({ id: 'crime_rate' })}</h4> */}

          <div className="columns is-centered">
            <div className="column is-8 ">
              <div className="table-container">
                <table
                  className="table is-striped is-fullwidth"
                  style={{ border: '0px solid #cbcbcb' }}
                >
                  <thead>
                    <tr
                      className="is-primary is-white"
                      style={{ 'border-bottom': '3px #555 solid' }}
                    >
                      <th> {intl.formatMessage({ id: 'Year' })}</th>
                      <th align="right">
                        {' '}
                        {intl.formatMessage({ id: 'INEGI Homicides' })}
                      </th>
                      <th align="right">
                        {' '}
                        {intl.formatMessage({ id: 'SNSP Homicides' })}
                      </th>
                      <th align="right">
                        {' '}
                        {intl.formatMessage({ id: 'Population' })}
                      </th>
                      <th align="right">
                        {' '}
                        {intl.formatMessage({ id: 'INEGI Rate' })}
                      </th>
                      <th align="right">
                        {' '}
                        {intl.formatMessage({ id: 'SNSP Rate' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default HistoricalChart
