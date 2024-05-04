import React, { useState, useEffect, useRef } from 'react'
import { feature } from 'topojson-client'
import { scaleQuantize } from '@vx/scale'
import { schemeYlOrRd } from 'd3-scale-chromatic'
import { format } from 'd3-format'
import { useIntl, FormattedMessage } from 'react-intl'
import { keyBy, find } from 'lodash-es'

const mexico = {
  features: [
    { properties: { state_abbr: 'BCS', state_code: 3 } },
    { properties: { state_abbr: 'BC', state_code: 2 } },
    { properties: { state_abbr: 'SIN', state_code: 25 } },
    { properties: { state_abbr: 'SON', state_code: 26 } },
    { properties: { state_abbr: 'NAY', state_code: 18 } },
    { properties: { state_abbr: 'DGO', state_code: 10 } },
    { properties: { state_abbr: 'GRO', state_code: 12 } },
    { properties: { state_abbr: 'MICH', state_code: 16 } },
    { properties: { state_abbr: 'COL', state_code: 6 } },
    { properties: { state_abbr: 'JAL', state_code: 14 } },
    { properties: { state_abbr: 'ZAC', state_code: 32 } },
    { properties: { state_abbr: 'CHIH', state_code: 8 } },
    { properties: { state_abbr: 'MOR', state_code: 17 } },
    { properties: { state_abbr: 'MEX', state_code: 15 } },
    { properties: { state_abbr: 'GTO', state_code: 11 } },
    { properties: { state_abbr: 'AGS', state_code: 1 } },
    { properties: { state_abbr: 'COAH', state_code: 5 } },
    { properties: { state_abbr: 'OAX', state_code: 20 } },
    { properties: { state_abbr: 'PUE', state_code: 21 } },
    { properties: { state_abbr: 'CDMX', state_code: 9 } },
    { properties: { state_abbr: 'QRO', state_code: 22 } },
    { properties: { state_abbr: 'SLP', state_code: 24 } },
    { properties: { state_abbr: 'NL', state_code: 19 } },
    { properties: { state_abbr: 'CHPS', state_code: 7 } },
    { properties: { state_abbr: 'TLAX', state_code: 29 } },
    { properties: { state_abbr: 'HGO', state_code: 13 } },
    { properties: { state_abbr: 'VER', state_code: 30 } },
    { properties: { state_abbr: 'TAM', state_code: 28 } },
    { properties: { state_abbr: 'TAB', state_code: 27 } },
    { properties: { state_abbr: 'CAMP', state_code: 4 } },
    { properties: { state_abbr: 'QROO', state_code: 23 } },
    { properties: { state_abbr: 'YUC', state_code: 31 } },
  ],
}
var round1 = format('.1f')
var comma = format(',')
const contrast = [
  '#010101',
  '#010101',
  '#010101',
  '#010101',
  '#010101',
  '#010101',
  '#FFFFFF',
  '#FFFFFF',
  '#FFFFFF',
]
const best_contrast = schemeYlOrRd[9].reduce(
  (acc, curr, i) => ((acc[curr] = contrast[i]), acc),
  {}
)
const stateNames = {
  AGS: 'AGUASCALIENTES',
  BC: 'BAJA CALIFORNIA',
  BCS: 'BAJA CALIFORNIA SUR',
  CAMP: 'CAMPECHE',
  CHPS: 'CHIAPAS',
  CHIH: 'CHIHUAHUA',
  COAH: 'COAHUILA',
  COL: 'COLIMA',
  CDMX: 'CIUDAD DE MÉXICO',
  DGO: 'DURANGO',
  GTO: 'GUANAJUATO',
  GRO: 'GUERRERO',
  HGO: 'HIDALGO',
  JAL: 'JALISCO',
  MEX: 'MÉXICO',
  MICH: 'MICHOACÁN',
  MOR: 'MORELOS',
  NAY: 'NAYARIT',
  NL: 'NUEVO LEÓN',
  OAX: 'OAXACA',
  PUE: 'PUEBLA',
  QRO: 'QUERÉTARO',
  QROO: 'QUINTANA ROO',
  SLP: 'SAN LUIS POTOSÍ',
  SIN: 'SINALOA',
  SON: 'SONORA',
  TAB: 'TABASCO',
  TAM: 'TAMAULIPAS',
  TLAX: 'TLAXCALA',
  VER: 'VERACRUZ',
  YUC: 'YUCATÁN',
  ZAC: 'ZACATECAS',
}

function MxHexTileMap(props) {
  const intl = useIntl()
  const [data, setData] = useState(null)
  const [tooltipTable, settooltipTable] = useState(null)
  const [selected_state, setselected_state] = useState(null)
  const [crime, setCrime] = useState('hd')
  const [mapData, setMapData] = useState(null)

  useEffect(() => {
    fetch('/elcrimen-json/states_hexgrid.json')
      .then(response => response.json())
      .then(responseJSON => {
        let mapColors = mexico.features.map(function(f) {
          let colors = {}
          Object.keys(responseJSON).map(function(crime) {
            let index = responseJSON[crime].findIndex(function(e) {
              return e.state_abbrv === f.properties.state_abbr
            })

            let ratecolor = color(
              responseJSON,
              crime
            )(responseJSON[crime][index].rate)
            colors[crime] = ratecolor
          })
          return {
            ...f.properties,
            ...colors,
          }
        })
        setMapData(mapColors)
        setData(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const color = function(data, crime) {
    return scaleQuantize({
      domain: [
        Math.min.apply(
          Math,
          data[crime].map(function(o) {
            return o.rate
          })
        ),
        Math.max.apply(
          Math,
          data[crime].map(function(o) {
            return o.rate
          })
        ),
      ],
      range: schemeYlOrRd[9],
    })
  }

  const handleMouseOver = (event, datum) => {
    const coords = localPoint(event.target.ownerSVGElement, event)
    props.showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    })
  }

  const rectClick = e => {
    props.updateState('0')
    setselected_state('0')
  }

  const handleSelect = e => {
    const { value } = e.target

    props.updateCrime(value)
    setCrime(value)
  }

  const stateClick = e => {
    props.updateState(e.target.attributes.state_code.value)
    setselected_state(e.target.attributes.state.value)
  }

  const [width, setWidth] = useState()
  const [height, setHeight] = useState()

  const findColor = state_abbr => {
    if (mapData) {
      let c = find(mapData, function(item) {
        return item.state_abbr === state_abbr
      })
      return c[crime]
    } else return 'transparent'
  }

  let opacity,
    strokeWidth = 0
  const getStrokeWidth = state => {
    if (selected_state === state) {
      return (strokeWidth = '4px')
    } else {
      return (strokeWidth = 0)
    }
  }
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hideTooltip,
  } = props
  return (
    <React.Fragment>
      <div className="select">
        <select
          id="crimeSelect"
          onChange={handleSelect}
          aria-label="Select Crime"
          className="is-hovered"
        >
          <option value="hd">
            {intl.formatMessage({ id: 'Homicidio Intencional' })}
          </option>
          <option value="sec">{intl.formatMessage({ id: 'Secuestro' })}</option>
          <option value="ext">{intl.formatMessage({ id: 'Extorsión' })}</option>
          <option value="rvcv">
            {intl.formatMessage({
              id: 'Robo de Coches con Violencia',
            })}
          </option>
          <option value="rvsv">
            {intl.formatMessage({
              id: 'Robo de Coches sin Violencia',
            })}
          </option>
        </select>
      </div>
      <React.Fragment>
        <div className="legend">
          <ul className="OrRd list-inline">
            {schemeYlOrRd[9].map((feature, i) => {
              return (
                <li
                  key={i}
                  className="key is-size-6 is-size-6-mobile"
                  style={{ borderTopColor: feature }}
                >
                  {data ? (
                    round1(color(data, crime).invertExtent(feature)[0])
                  ) : (
                    <span style={{ color: 'transparent' }}>1</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
        <figure className="image is-square">
          <div className="has-ratio">
            <div
              id="hexmap"
              style={{ height: '100%', width: '100%', position: 'relative' }}
            >
              <svg
                preserveAspectRatio="xMinYMin"
                viewBox="0 0 631.5 581.5"
                // viewBox={
                //   '0 0 ' +
                //   canvasRef.current.clientWidth +
                //   ' ' +
                //   canvasRef.current.offsetHeight
                // }
                fill="transparent"
                width="100%"
                height="100%"
              >
                <rect
                  x={0}
                  y={0}
                  width="100%"
                  height="100%"
                  rx={14}
                  onClick={rectClick}
                ></rect>
                <g>
                  <path
                    state="BCS"
                    fill={findColor('BCS')}
                    state_code="3"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M49,161.44849558071485L86.5,161.44849558071485L105,194.6698894283065L86.5,227.68321689360846L49,227.68321689360846L30,194.6698894283065Z"
                  ></path>
                  <path
                    state="BC"
                    fill={findColor('BC')}
                    state_code="2"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M86.5,94.23881426017817L105,127.98367732257401L86.5,161.44849558071485L49,161.44849558071485L30,127.98367732257401L49,94.23881426017817Z"
                  ></path>
                  <path
                    state="SIN"
                    fill={findColor('SIN')}
                    state_code="25"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M86.5,161.44849558071485L105,127.98367732257401L142.5,127.98367732257401L161.49999999999977,161.44849558071485L142.5,194.6698894283065L105,194.6698894283065Z"
                  ></path>
                  <path
                    state="SON"
                    fill={findColor('SON')}
                    state_code="26"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M86.5,94.23881426017817L105,60.17580648776794L142.5,60.17580648776794L161.49999999999977,94.23881426017817L142.5,127.98367732257401L105,127.98367732257401Z"
                  ></path>
                  <path
                    state="NAY"
                    fill={findColor('NAY')}
                    state_code="18"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M142.5,194.6698894283065L161.49999999999977,161.44849558071485L198.99999999999977,161.44849558071485L217.5,194.6698894283065L198.99999999999977,227.68321689360846L161.49999999999977,227.68321689360846Z"
                  ></path>
                  <path
                    state="DGO"
                    fill={findColor('DGO')}
                    state_code="10"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M142.5,127.98367732257401L161.49999999999977,94.23881426017817L198.99999999999977,94.23881426017817L217.5,127.98367732257401L198.99999999999977,161.44849558071485L161.49999999999977,161.44849558071485Z"
                  ></path>
                  <path
                    state="GRO"
                    fill={findColor('GRO')}
                    state_code="12"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M217.5,391.2350818517051L254.99999999999977,391.2350818517051L274,423.6956824072873L254.99999999999977,456.17625920403776L217.5,456.17625920403776L198.99999999999977,423.6956824072873Z"
                  ></path>
                  <path
                    state="MICH"
                    fill={findColor('MICH')}
                    state_code="16"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M217.5,326.2475419959468L254.99999999999977,326.2475419959468L274,358.76290475212204L254.99999999999977,391.2350818517051L217.5,391.2350818517051L198.99999999999977,358.76290475212204Z"
                  ></path>
                  <path
                    state="COL"
                    fill={findColor('COL')}
                    state_code="6"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M217.5,260.52277432775475L254.99999999999977,260.52277432775475L274,293.6571739179954L254.99999999999977,326.2475419959468L217.5,326.2475419959468L198.99999999999977,293.6571739179954Z"
                  ></path>
                  <path
                    state="JAL"
                    fill={findColor('JAL')}
                    state_code="14"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M198.99999999999977,227.68321689360846L217.5,194.6698894283065L254.99999999999977,194.6698894283065L274,227.68321689360846L254.99999999999977,260.52277432775475L217.5,260.52277432775475Z"
                  ></path>
                  <path
                    state="ZAC"
                    fill={findColor('ZAC')}
                    state_code="32"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M198.99999999999977,161.44849558071485L217.5,127.98367732257401L254.99999999999977,127.98367732257401L274,161.44849558071485L254.99999999999977,194.6698894283065L217.5,194.6698894283065Z"
                  ></path>
                  <path
                    state="CHIH"
                    fill={findColor('CHIH')}
                    state_code="8"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M198.99999999999977,94.23881426017817L217.5,60.17580648776794L254.99999999999977,60.17580648776794L274,94.23881426017817L254.99999999999977,127.98367732257401L217.5,127.98367732257401Z"
                  ></path>
                  <path
                    state="MOR"
                    fill={findColor('MOR')}
                    state_code="17"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M254.99999999999977,391.2350818517051L274,358.76290475212204L311.5,358.76290475212204L329.9999999999998,391.2350818517051L311.5,423.6956824072873L274,423.6956824072873Z"
                  ></path>
                  <path
                    state="MEX"
                    fill={findColor('MEX')}
                    state_code="15"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M254.99999999999977,326.2475419959468L274,293.6571739179954L311.5,293.6571739179954L329.9999999999998,326.2475419959468L311.5,358.76290475212204L274,358.76290475212204Z"
                  ></path>
                  <path
                    state="GTO"
                    fill={findColor('GTO')}
                    state_code="11"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M254.99999999999977,260.52277432775475L274,227.68321689360846L311.5,227.68321689360846L329.9999999999998,260.52277432775475L311.5,293.6571739179954L274,293.6571739179954Z"
                  ></path>
                  <path
                    state="AGS"
                    fill={findColor('AGS')}
                    state_code="1"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M254.99999999999977,194.6698894283065L274,161.44849558071485L311.5,161.44849558071485L329.9999999999998,194.6698894283065L311.5,227.68321689360846L274,227.68321689360846Z"
                  ></path>
                  <path
                    state="COAH"
                    fill={findColor('COAH')}
                    state_code="5"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M254.99999999999977,127.98367732257401L274,94.23881426017817L311.5,94.23881426017817L329.9999999999998,127.98367732257401L311.5,161.44849558071485L274,161.44849558071485Z"
                  ></path>
                  <path
                    state="OAX"
                    fill={findColor('OAX')}
                    state_code="20"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M329.9999999999998,456.17625920403776L367.4999999999998,456.17625920403776L386.4999999999998,488.7084622547746L367.4999999999998,521.324193512232L329.9999999999998,521.324193512232L311.5,488.7084622547746Z"
                  ></path>
                  <path
                    state="PUE"
                    fill={findColor('PUE')}
                    state_code="21"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M311.5,423.6956824072873L329.9999999999998,391.2350818517051L367.4999999999998,391.2350818517051L386.4999999999998,423.6956824072873L367.4999999999998,456.17625920403776L329.9999999999998,456.17625920403776Z"
                  ></path>
                  <path
                    state="CDMX"
                    fill={findColor('CDMX')}
                    state_code="9"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M311.5,358.76290475212204L329.9999999999998,326.2475419959468L367.4999999999998,326.2475419959468L386.4999999999998,358.76290475212204L367.4999999999998,391.2350818517051L329.9999999999998,391.2350818517051Z"
                  ></path>
                  <path
                    state="QRO"
                    fill={findColor('QRO')}
                    state_code="22"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M311.5,293.6571739179954L329.9999999999998,260.52277432775475L367.4999999999998,260.52277432775475L386.4999999999998,293.6571739179954L367.4999999999998,326.2475419959468L329.9999999999998,326.2475419959468Z"
                  ></path>
                  <path
                    state="SLP"
                    fill={findColor('SLP')}
                    state_code="24"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M311.5,227.68321689360846L329.9999999999998,194.6698894283065L367.4999999999998,194.6698894283065L386.4999999999998,227.68321689360846L367.4999999999998,260.52277432775475L329.9999999999998,260.52277432775475Z"
                  ></path>
                  <path
                    state="NL"
                    fill={findColor('NL')}
                    state_code="19"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M311.5,161.44849558071485L329.9999999999998,127.98367732257401L367.4999999999998,127.98367732257401L386.4999999999998,161.44849558071485L367.4999999999998,194.6698894283065L329.9999999999998,194.6698894283065Z"
                  ></path>
                  <path
                    state="CHPS"
                    fill={findColor('CHPS')}
                    state_code="7"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M367.4999999999998,456.17625920403776L386.4999999999998,423.6956824072873L424,423.6956824072873L442.5,456.17625920403776L424,488.7084622547746L386.4999999999998,488.7084622547746Z"
                  ></path>
                  <path
                    state="TLAX"
                    fill={findColor('TLAX')}
                    state_code="29"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M367.4999999999998,391.2350818517051L386.4999999999998,358.76290475212204L424,358.76290475212204L442.5,391.2350818517051L424,423.6956824072873L386.4999999999998,423.6956824072873Z"
                  ></path>
                  <path
                    state="HGO"
                    fill={findColor('HGO')}
                    state_code="13"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M367.4999999999998,326.2475419959468L386.4999999999998,293.6571739179954L424,293.6571739179954L442.5,326.2475419959468L424,358.76290475212204L386.4999999999998,358.76290475212204Z"
                  ></path>
                  <path
                    state="VER"
                    fill={findColor('VER')}
                    state_code="30"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M367.4999999999998,260.52277432775475L386.4999999999998,227.68321689360846L424,227.68321689360846L442.5,260.52277432775475L424,293.6571739179954L386.4999999999998,293.6571739179954Z"
                  ></path>
                  <path
                    state="TAM"
                    fill={findColor('TAM')}
                    state_code="28"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M367.4999999999998,194.6698894283065L386.4999999999998,161.44849558071485L424,161.44849558071485L442.5,194.6698894283065L424,227.68321689360846L386.4999999999998,227.68321689360846Z"
                  ></path>
                  <path
                    state="TAB"
                    fill={findColor('TAB')}
                    state_code="27"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M424,423.6956824072873L442.5,391.2350818517051L480,391.2350818517051L498.9999999999998,423.6956824072873L480,456.17625920403776L442.5,456.17625920403776Z"
                  ></path>
                  <path
                    state="CAMP"
                    fill={findColor('CAMP')}
                    state_code="4"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M480,391.2350818517051L498.9999999999998,358.76290475212204L536.4999999999998,358.76290475212204L554.9999999999995,391.2350818517051L536.4999999999998,423.6956824072873L498.9999999999998,423.6956824072873Z"
                  ></path>
                  <path
                    state="QROO"
                    fill={findColor('QROO')}
                    state_code="23"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M536.4999999999998,423.6956824072873L554.9999999999995,391.2350818517051L592.4999999999998,391.2350818517051L611.4999999999998,423.6956824072873L592.4999999999998,456.17625920403776L554.9999999999995,456.17625920403776Z"
                  ></path>
                  <path
                    state="YUC"
                    fill={findColor('YUC')}
                    state_code="31"
                    stroke="black"
                    opacity="1"
                    strokeWidth="0.5"
                    d="M536.4999999999998,358.76290475212204L554.9999999999995,326.2475419959468L592.4999999999998,326.2475419959468L611.4999999999998,358.76290475212204L592.4999999999998,391.2350818517051L554.9999999999995,391.2350818517051Z"
                  ></path>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="67.6111111111111"
                    y="199.57741548062216"
                    fill={best_contrast[findColor('BCS')]}
                  >
                    BCS
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="67.61111111111113"
                    y="132.85921296512737"
                    fill={best_contrast[findColor('BC')]}
                  >
                    BC
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="123.88888888888883"
                    y="166.34030695380414"
                    fill={best_contrast[findColor('SIN')]}
                  >
                    SIN
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="123.88888888888881"
                    y="99.09741661128288"
                    fill={best_contrast[findColor('SON')]}
                  >
                    SON
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="180.11111111111106"
                    y="199.57741548062222"
                    fill={best_contrast[findColor('NAY')]}
                  >
                    NAY
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="180.11111111111103"
                    y="132.85921296512737"
                    fill={best_contrast[findColor('DGO')]}
                  >
                    DGO
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.3888888888887"
                    y="428.7045607366951"
                    fill={best_contrast[findColor('GRO')]}
                  >
                    GRO
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.38888888888883"
                    y="363.74371112696997"
                    fill={best_contrast[findColor('MICH')]}
                  >
                    MICH
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.388888888889"
                    y="298.4153821347561"
                    fill={best_contrast[findColor('COL')]}
                  >
                    COL
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.3888888888886"
                    y="232.6059857686502"
                    fill={best_contrast[findColor('JAL')]}
                  >
                    JAL
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.38888888888889"
                    y="166.3403069538042"
                    fill={best_contrast[findColor('ZAC')]}
                  >
                    ZAC
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="236.38888888888877"
                    y="99.09741661128288"
                    fill={best_contrast[findColor('CHIH')]}
                  >
                    CHIH
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="292.6111111111112"
                    y="396.22993672103865"
                    fill={best_contrast[findColor('MOR')]}
                  >
                    MOR
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="292.61111111111103"
                    y="331.21420629737963"
                    fill={best_contrast[findColor('MEX')]}
                  >
                    MEX
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="292.61111111111074"
                    y="265.65381528601864"
                    fill={best_contrast[findColor('GTO')]}
                  >
                    GTO
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="292.61111111111114"
                    y="199.57741548062222"
                    fill={best_contrast[findColor('AGS')]}
                  >
                    AGS
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="292.611111111111"
                    y="132.85921296512734"
                    fill={best_contrast[findColor('COAH')]}
                  >
                    COAH
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.88888888888846"
                    y="493.7455859022052"
                    fill={best_contrast[findColor('OAX')]}
                  >
                    OAX
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.88888888888926"
                    y="428.70456073669607"
                    fill={best_contrast[findColor('PUE')]}
                  >
                    PUE
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.88888888888863"
                    y="363.7437111269699"
                    fill={best_contrast[findColor('CDMX')]}
                  >
                    CDMX
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.8888888888885"
                    y="298.4153821347557"
                    fill={best_contrast[findColor('QRO')]}
                  >
                    QRO
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.8888888888888"
                    y="232.60598576865044"
                    fill={best_contrast[findColor('SLP')]}
                  >
                    SLP
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="348.8888888888887"
                    y="166.34030695380406"
                    fill={best_contrast[findColor('NL')]}
                  >
                    NL
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="405.1111111111112"
                    y="461.19920420580985"
                    fill={best_contrast[findColor('CHPS')]}
                  >
                    CHPS
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="405.1111111111109"
                    y="396.229936721038"
                    fill={best_contrast[findColor('TLAX')]}
                  >
                    TLAX
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="405.11111111111086"
                    y="331.21420629737963"
                    fill={best_contrast[findColor('HGO')]}
                  >
                    HGO
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="405.11111111111126"
                    y="265.65381528601904"
                    fill={best_contrast[findColor('VER')]}
                  >
                    VER
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="405.1111111111105"
                    y="199.577415480622"
                    fill={best_contrast[findColor('TAM')]}
                  >
                    TAM
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="461.3888888888885"
                    y="428.70456073669516"
                    fill={best_contrast[findColor('TAB')]}
                  >
                    TAB
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="517.6111111111109"
                    y="396.22993672103786"
                    fill={best_contrast[findColor('CAMP')]}
                  >
                    CAMP
                  </text>

                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="573.8888888888899"
                    y="428.70456073669635"
                    fill={best_contrast[findColor('QROO')]}
                  >
                    QROO
                  </text>
                  <text
                    textAnchor="middle"
                    className="is-size-6-mobile is-size-5-tablet is-size-5"
                    dominantBaseline="mathemetical"
                    x="573.8888888888886"
                    y="363.74371112697"
                    fill={best_contrast[findColor('YUC')]}
                  >
                    YUC
                  </text>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('BCS')}
                    onClick={stateClick}
                    state="BCS"
                    state_code="3"
                    d="M49,161.44849558071485L86.5,161.44849558071485L105,194.6698894283065L86.5,227.68321689360846L49,227.68321689360846L30,194.6698894283065Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['BCS']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 3).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 3).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 3).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('BC')}
                    onClick={stateClick}
                    state="BC"
                    state_code="2"
                    d="M86.5,94.23881426017817L105,127.98367732257401L86.5,161.44849558071485L49,161.44849558071485L30,127.98367732257401L49,94.23881426017817Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['BC']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 2).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 2).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 2).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('SIN')}
                    onClick={stateClick}
                    state="SIN"
                    state_code="25"
                    d="M86.5,161.44849558071485L105,127.98367732257401L142.5,127.98367732257401L161.49999999999977,161.44849558071485L142.5,194.6698894283065L105,194.6698894283065Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['SIN']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 25).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 25).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 25)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('SON')}
                    onClick={stateClick}
                    state="SON"
                    state_code="26"
                    d="M86.5,94.23881426017817L105,60.17580648776794L142.5,60.17580648776794L161.49999999999977,94.23881426017817L142.5,127.98367732257401L105,127.98367732257401Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['SON']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 26).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 26).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 26)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('NAY')}
                    onClick={stateClick}
                    state="NAY"
                    state_code="18"
                    d="M142.5,194.6698894283065L161.49999999999977,161.44849558071485L198.99999999999977,161.44849558071485L217.5,194.6698894283065L198.99999999999977,227.68321689360846L161.49999999999977,227.68321689360846Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['NAY']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 18).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 18).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 18)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('DGO')}
                    onClick={stateClick}
                    state="DGO"
                    state_code="10"
                    d="M142.5,127.98367732257401L161.49999999999977,94.23881426017817L198.99999999999977,94.23881426017817L217.5,127.98367732257401L198.99999999999977,161.44849558071485L161.49999999999977,161.44849558071485Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['DGO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 10).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 10).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 10)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('GRO')}
                    onClick={stateClick}
                    state="GRO"
                    state_code="12"
                    d="M217.5,391.2350818517051L254.99999999999977,391.2350818517051L274,423.6956824072873L254.99999999999977,456.17625920403776L217.5,456.17625920403776L198.99999999999977,423.6956824072873Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['GRO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 12).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 12).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 12)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('MICH')}
                    onClick={stateClick}
                    state="MICH"
                    state_code="16"
                    d="M217.5,326.2475419959468L254.99999999999977,326.2475419959468L274,358.76290475212204L254.99999999999977,391.2350818517051L217.5,391.2350818517051L198.99999999999977,358.76290475212204Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['MICH']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 16).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 16).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 16)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('COL')}
                    onClick={stateClick}
                    state="COL"
                    state_code="6"
                    d="M217.5,260.52277432775475L254.99999999999977,260.52277432775475L274,293.6571739179954L254.99999999999977,326.2475419959468L217.5,326.2475419959468L198.99999999999977,293.6571739179954Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['COL']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 6).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 6).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 6).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('JAL')}
                    onClick={stateClick}
                    state="JAL"
                    state_code="14"
                    d="M198.99999999999977,227.68321689360846L217.5,194.6698894283065L254.99999999999977,194.6698894283065L274,227.68321689360846L254.99999999999977,260.52277432775475L217.5,260.52277432775475Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['JAL']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 14).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 14).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 14)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('ZAC')}
                    onClick={stateClick}
                    state="ZAC"
                    state_code="32"
                    d="M198.99999999999977,161.44849558071485L217.5,127.98367732257401L254.99999999999977,127.98367732257401L274,161.44849558071485L254.99999999999977,194.6698894283065L217.5,194.6698894283065Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['ZAC']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 32).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 32).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 32)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('CHIH')}
                    onClick={stateClick}
                    state="CHIH"
                    state_code="8"
                    d="M198.99999999999977,94.23881426017817L217.5,60.17580648776794L254.99999999999977,60.17580648776794L274,94.23881426017817L254.99999999999977,127.98367732257401L217.5,127.98367732257401Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['CHIH']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 8).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 8).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 8).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('MOR')}
                    onClick={stateClick}
                    state="MOR"
                    state_code="17"
                    d="M254.99999999999977,391.2350818517051L274,358.76290475212204L311.5,358.76290475212204L329.9999999999998,391.2350818517051L311.5,423.6956824072873L274,423.6956824072873Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['MOR']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 17).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 17).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 17)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('MEX')}
                    onClick={stateClick}
                    state="MEX"
                    state_code="15"
                    d="M254.99999999999977,326.2475419959468L274,293.6571739179954L311.5,293.6571739179954L329.9999999999998,326.2475419959468L311.5,358.76290475212204L274,358.76290475212204Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['MEX']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 15).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 15).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 15)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('GTO')}
                    onClick={stateClick}
                    state="GTO"
                    state_code="11"
                    d="M254.99999999999977,260.52277432775475L274,227.68321689360846L311.5,227.68321689360846L329.9999999999998,260.52277432775475L311.5,293.6571739179954L274,293.6571739179954Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['GTO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 11).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 11).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 11)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('AGS')}
                    onClick={stateClick}
                    state="AGS"
                    state_code="1"
                    d="M254.99999999999977,194.6698894283065L274,161.44849558071485L311.5,161.44849558071485L329.9999999999998,194.6698894283065L311.5,227.68321689360846L274,227.68321689360846Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['AGS']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 1).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 1).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 1).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('COAH')}
                    onClick={stateClick}
                    state="COAH"
                    state_code="5"
                    d="M254.99999999999977,127.98367732257401L274,94.23881426017817L311.5,94.23881426017817L329.9999999999998,127.98367732257401L311.5,161.44849558071485L274,161.44849558071485Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['COAH']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 5).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 5).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 5).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('OAX')}
                    onClick={stateClick}
                    state="OAX"
                    state_code="20"
                    d="M329.9999999999998,456.17625920403776L367.4999999999998,456.17625920403776L386.4999999999998,488.7084622547746L367.4999999999998,521.324193512232L329.9999999999998,521.324193512232L311.5,488.7084622547746Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['OAX']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 20).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 20).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 20)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('PUE')}
                    onClick={stateClick}
                    state="PUE"
                    state_code="21"
                    d="M311.5,423.6956824072873L329.9999999999998,391.2350818517051L367.4999999999998,391.2350818517051L386.4999999999998,423.6956824072873L367.4999999999998,456.17625920403776L329.9999999999998,456.17625920403776Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['PUE']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 21).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 21).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 21)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('CDMX')}
                    onClick={stateClick}
                    state="CDMX"
                    state_code="9"
                    d="M311.5,358.76290475212204L329.9999999999998,326.2475419959468L367.4999999999998,326.2475419959468L386.4999999999998,358.76290475212204L367.4999999999998,391.2350818517051L329.9999999999998,391.2350818517051Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['CDMX']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 9).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 9).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 9).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('QRO')}
                    onClick={stateClick}
                    state="QRO"
                    state_code="22"
                    d="M311.5,293.6571739179954L329.9999999999998,260.52277432775475L367.4999999999998,260.52277432775475L386.4999999999998,293.6571739179954L367.4999999999998,326.2475419959468L329.9999999999998,326.2475419959468Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['QRO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 22).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 22).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 22)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('SLP')}
                    onClick={stateClick}
                    state="SLP"
                    state_code="24"
                    d="M311.5,227.68321689360846L329.9999999999998,194.6698894283065L367.4999999999998,194.6698894283065L386.4999999999998,227.68321689360846L367.4999999999998,260.52277432775475L329.9999999999998,260.52277432775475Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['SLP']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 24).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 24).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 24)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('NL')}
                    onClick={stateClick}
                    state="NL"
                    state_code="19"
                    d="M311.5,161.44849558071485L329.9999999999998,127.98367732257401L367.4999999999998,127.98367732257401L386.4999999999998,161.44849558071485L367.4999999999998,194.6698894283065L329.9999999999998,194.6698894283065Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['NL']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 19).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 19).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 19)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('CHPS')}
                    onClick={stateClick}
                    state="CHPS"
                    state_code="7"
                    d="M367.4999999999998,456.17625920403776L386.4999999999998,423.6956824072873L424,423.6956824072873L442.5,456.17625920403776L424,488.7084622547746L386.4999999999998,488.7084622547746Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['CHPS']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 7).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 7).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 7).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('TLAX')}
                    onClick={stateClick}
                    state="TLAX"
                    state_code="29"
                    d="M367.4999999999998,391.2350818517051L386.4999999999998,358.76290475212204L424,358.76290475212204L442.5,391.2350818517051L424,423.6956824072873L386.4999999999998,423.6956824072873Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['TLAX']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 29).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 29).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 29)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('HGO')}
                    onClick={stateClick}
                    state="HGO"
                    state_code="13"
                    d="M367.4999999999998,326.2475419959468L386.4999999999998,293.6571739179954L424,293.6571739179954L442.5,326.2475419959468L424,358.76290475212204L386.4999999999998,358.76290475212204Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['HGO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 13).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 13).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 13)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('VER')}
                    onClick={stateClick}
                    state="VER"
                    state_code="30"
                    d="M367.4999999999998,260.52277432775475L386.4999999999998,227.68321689360846L424,227.68321689360846L442.5,260.52277432775475L424,293.6571739179954L386.4999999999998,293.6571739179954Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['VER']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 30).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 30).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 30)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('TAM')}
                    onClick={stateClick}
                    state="TAM"
                    state_code="28"
                    d="M367.4999999999998,194.6698894283065L386.4999999999998,161.44849558071485L424,161.44849558071485L442.5,194.6698894283065L424,227.68321689360846L386.4999999999998,227.68321689360846Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['TAM']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 28).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 28).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 28)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('TAB')}
                    onClick={stateClick}
                    state="TAB"
                    state_code="27"
                    d="M424,423.6956824072873L442.5,391.2350818517051L480,391.2350818517051L498.9999999999998,423.6956824072873L480,456.17625920403776L442.5,456.17625920403776Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['TAB']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 27).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 27).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 27)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('CAMP')}
                    onClick={stateClick}
                    state="CAMP"
                    state_code="4"
                    d="M480,391.2350818517051L498.9999999999998,358.76290475212204L536.4999999999998,358.76290475212204L554.9999999999995,391.2350818517051L536.4999999999998,423.6956824072873L498.9999999999998,423.6956824072873Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['CAMP']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 4).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 4).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 4).population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('QROO')}
                    onClick={stateClick}
                    state="QROO"
                    state_code="23"
                    d="M536.4999999999998,423.6956824072873L554.9999999999995,391.2350818517051L592.4999999999998,391.2350818517051L611.4999999999998,423.6956824072873L592.4999999999998,456.17625920403776L554.9999999999995,456.17625920403776Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['QROO']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 23).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 23).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 23)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                  <path
                    //onMouseMove={e =>  handleMouseOver(e, f.properties)}
                    //onMouseOut={hideTooltip}
                    fill="transparent"
                    stroke="black"
                    opacity={1}
                    strokeWidth={getStrokeWidth('YUC')}
                    onClick={stateClick}
                    state="YUC"
                    state_code="31"
                    d="M536.4999999999998,358.76290475212204L554.9999999999995,326.2475419959468L592.4999999999998,326.2475419959468L611.4999999999998,358.76290475212204L592.4999999999998,391.2350818517051L554.9999999999995,391.2350818517051Z"
                  >
                    <title>
                      {data ? (
                        <React.Fragment>
                          {stateNames['YUC']}
                          {'\n'}
                          {intl.formatMessage({
                            id: 'tasa anualizada',
                          })}
                          : {data[crime].find(o => o.state_code === 31).rate}
                          {'\n'}
                          {intl.formatMessage({ id: crime })}:{' '}
                          {data[crime].find(o => o.state_code === 31).count}
                          {'\n'}
                          {intl.formatMessage({ id: 'population' })}:{' '}
                          {comma(
                            data[crime].find(o => o.state_code === 31)
                              .population
                          )}{' '}
                        </React.Fragment>
                      ) : null}
                    </title>
                  </path>
                </g>
              </svg>
            </div>
          </div>
        </figure>
      </React.Fragment>
    </React.Fragment>
  )
}

export default MxHexTileMap
