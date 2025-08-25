import React from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'
import HeroTitle from '../components/HeroTitle'
import SEO from '../components/SEO'
import {
  useIntl,
  FormattedHTMLMessage,
  FormattedDate,
  FormattedMessage,
} from 'react-intl'
import useLastMonth from '../components/LastMonth'
import TextColumn from '../components/TextColumn'

import social_image from '../assets/images/social/social-mapa.png'
import social_image_en from '../assets/images/social/social-mapa_en.png'

import MapGL, {
  Source,
  Layer,
  FullscreenControl,
  NavigationControl,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../components/ClusterMap/ClusterMap.css'

import { countBy, filter, maxBy } from 'lodash-es'
import { format as num_format } from 'd3-format'

import dark_matter from '../components/DotMap/dot_map_style_gray'
import { YYYYmmddToDate15 } from '../components/utils.js'

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

import TooltipSlider from '../components/TooltipSlider'
import 'rc-slider/assets/index.css'

import LegendNumber from '../components/TourismMap/LegendNumber'
import LegendRate from '../components/TourismMap/LegendRate'
import { scalePower, scaleLinear } from '@vx/scale'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
])

let chartOption = {
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
    show: false,
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
  },
  grid: {
    left: '0%',
    right: '0%',
    bottom: '0%',
    top: '0%',
    containLabel: false,
  },
  xAxis: {
    show: false,
    name: 'homicide rate',
    type: 'category',
    nameLocation: 'middle',
    nameTextStyle: {
      fontFamily: 'Roboto Condensed, Ubuntu, system-ui, sans-serif',
      color: '#111',
    },
    // data: data.map(function(item) {
    //   return item.year
    // }),
    axisLabel: {
      interval: 2,
    },
    boundaryGap: ['20%', '0%'],
    splitNumber: 6,
  },
  yAxis: [
    {
      show: false,
      name: 'municipio count',
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
      name: 'Homicide Histogram',
      type: 'bar',
      color: '#5C4033',
      barWidth: '95%',
      itemStyle: { borderWidth: 10 },
      // data: data.map(function(item) {
      //   return item.per
      // }),
    },
  ],
}

const dataLayer = {
  id: 'data',
  //popup: layer => `<div>${layer.properties.name}</div>`,
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3,
      ['sqrt', ['*', 0.25, ['number', ['get', 'count'], 0]]],
      5,
      ['sqrt', ['*', 0.75, ['number', ['get', 'count'], 0]]],
      8,
      ['+', ['sqrt', ['*', 3.5, ['number', ['get', 'count'], 0]]], 2],
      11,
      ['+', ['sqrt', ['*', 6, ['number', ['get', 'count'], 0]]], 3],
    ],
    'circle-stroke-color': '#111',
    'circle-stroke-width': {
      property: 'rate',
      type: 'interval',
      stops: [
        [0, 1],
        [493, 1],
        [10000000, 0],
      ],
    },
    'circle-opacity': {
      property: 'rate',
      type: 'interval',
      stops: [
        [0, 0.8],
        [493, 0.8],
        [10000000, 0],
      ],
    },
    'circle-color': {
      property: 'rate',
      type: 'interval',
      stops: [
        [0, '#ffffcc'],
        [12.5, '#ffeda0'],
        [25, '#fed976'],
        [37.5, '#feb24c'],
        [50, '#fd8d3c'],
        [62.5, '#fc4e2a'],
        [75, '#e31a1c'],
        [87.55, '#bd0026'],
        [100, '#800026'],
      ],
    },
  },
}

class DotMapGL extends React.Component {
  constructor() {
    super()

    this.state = {
      chartOptions: { ...chartOption },
      lightboxIsOpen: false,
      currentImage: 0,
      data: null,
      // domain: {x: [0, 30], y: [0, 100]},
      geojson: null,
      hoveredFeature: null,
      histogram: null,
      paint: dataLayer.paint,
      dataLayer: dataLayer,
      dark_matter: dark_matter,
      sparkLine: null,
      map: null,
      values: null,
      lower: null,
      upper: null,
      maxCount: null,
      sValues: null,
      mounted: false,
      viewport: {
        width: '100%',
        height: '600px',
        latitude: 23.5,
        longitude: -102.1,
        zoom: 4,
        maxZoom: 10,
        minZoom: 3,
      },
    }
    this._onViewportChange = this._onViewportChange.bind(this)
    this._onHover = this._onHover.bind(this)
    this.onBrush = this.onBrush.bind(this)
    this.changeExtent = this.changeExtent.bind(this)
    this.setValue = this.setValue.bind(this)
    this.updateValue = this.updateValue.bind(this)
  }

  PitComponents({ style, children }) {
    return (
      <div
        style={{
          ...style,
          background: '#a2a2a2',
          width: 1,
          height: children % 100 === 0 ? 12 : 8,
          top: 20,
        }}
      />
    )
  }

  _onHover = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event
    const hoveredFeature =
      features && features.find((f) => f.layer.id === 'data')

    this.setState({ hoveredFeature, x: offsetX, y: offsetY })
  }

  _renderTooltip() {
    const { hoveredFeature, x, y } = this.state

    return (
      hoveredFeature &&
      hoveredFeature.properties.rate <= this.state.upper &&
      hoveredFeature.properties.rate >= this.state.lower && (
        <div
          className="tooltip is-size-6"
          style={{
            left: x,
            top: y,
            backgroundColor: '#111',
            lineHeight: '1.1rem',
          }}
        >
          <div>
            <b>{hoveredFeature.properties.name}</b>
            <br />
            <FormattedMessage id="rate" />: {hoveredFeature.properties.rate}
            <br />
            <FormattedMessage id="map_count" />:{' '}
            {hoveredFeature.properties.count}
            <br />
            <FormattedMessage id="population" />:{' '}
            {num_format(',')(hoveredFeature.properties.population)}
          </div>
        </div>
      )
    )
  }

  componentDidMount() {
    this.setState({ mounted: true })
    fetch('/elcrimen-json/municipios-centroids.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        responseJSON.features = responseJSON.features.map((d) => {
          d.properties.rate = parseFloat(d.properties.rate)
          d.properties.count = parseInt(d.properties.count)
          return d
        })
        let hist = countBy(responseJSON.features, function (x) {
          return Math.floor(x.properties.rate)
        })
        let histogram = []
        Object.keys(hist).forEach(function (key) {
          histogram.push({
            name: parseInt(key),
            count: hist[key] !== 0 ? Math.log(hist[key]) : 0,
          })
        })
        let values = responseJSON.features.map((x) => {
          return { value: x.properties.rate }
        })
        let counts = responseJSON.features.map((x) => {
          return { value: x.properties.count }
        })
        let chartOption = { ...this.state.chartOptions }
        let max = Math.ceil(
          maxBy(values, function (o) {
            return o.value
          }).value
        )
        let maxCount = Math.ceil(
          maxBy(counts, function (o) {
            return o.value
          }).value
        )
        this.props.maxMapRate(max)
        this.props.maxMapCount(maxCount)
        let sparkLine = Array(max + 1).fill(0)
        for (let i = 0; i <= max; i++)
          if (histogram.hasOwnProperty(i))
            sparkLine[i] = Math.round(histogram[i].count)

        chartOption.xAxis['data'] = [...Array(max).keys()]
        chartOption.series[0]['data'] = sparkLine

        const dark_matter_copy = { ...this.state.dark_matter }
        dark_matter_copy['sources'] = { ...dark_matter_copy['sources'] }
        dark_matter_copy['sources']['openmaptiles2'] = {
          ...dark_matter_copy['sources']['openmaptiles2'],
        }
        dark_matter_copy['sources']['openmaptiles2']['tiles'] = [
          `${this.props.tilesURL}`,
        ]
        dark_matter_copy['sprite'] = `${this.props.osmSpriteUrl}`
        dark_matter_copy['glyphs'] = `${this.props.osmGlyphsUrl}`
        if (
          JSON.stringify(this.state.dark_matter) !==
          JSON.stringify(dark_matter_copy)
        ) {
          this.setState({ dark_matter: dark_matter_copy })
        }

        this.setState({
          data: responseJSON,
          sparkLine: sparkLine,
          histogram: histogram,
          chartOptions: { ...chartOption },
          values: values,
          lower: 0,
          sValues: [0, max],
          upper: max,
          maxCount: maxCount,
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  setValue(v) {
    this.setState({ sValues: v })
  }

  updateValue(sliderState) {
    console.log(sliderState)
    this.setState({
      sValues: sliderState.values,
    })
  }

  onBrush(d) {
    let hist = this.state.histogram
    let filtered = filter(this.state.data.features, function (o) {
      return o.properties.rate > parseInt(hist[d.startIndex].name)
    })
    let geojson = this.state.data
    geojson.features = filtered
    let opacity = this.state.dataLayer.paint
    opacity['circle-opacity'].stops = [
      [0, 1],
      [parseInt(hist[d.startIndex].name), 0.8],
      [parseInt(hist[d.endIndex].name), 0],
      [10000000, 0],
    ]
    opacity['circle-stroke-width'].stops = [
      [0, 0],
      [parseInt(hist[d.startIndex].name), 1],
      [parseInt(hist[d.endIndex].name), 0],
      [10000000, 0],
    ]
    //opacity.paint['circle-opacity'].type = "error"
    this._map.setPaintProperty(
      'data',
      'circle-opacity',
      opacity['circle-opacity']
    )
    this._map.setPaintProperty(
      'data',
      'circle-stroke-width',
      opacity['circle-stroke-width']
    )
    this.setState({ paint: opacity })
  }

  _onViewportChange(viewport) {
    // -121.2843, 9.664643, -85.49087, 32.72067
    let top = 32.72067,
      bottom = 9.664643 + 5,
      left = -121.2843 + 5,
      right = -85.49087 + 5
    if (viewport.longitude < left) {
      viewport.longitude = left
    } else if (viewport.longitude > right) {
      viewport.longitude = right
    } else if (viewport.latitude < bottom) {
      viewport.latitude = bottom
    } else if (viewport.latitude > top) {
      viewport.latitude = top
    }

    if (this.state.mounted) {
      this.setState({
        viewport,
      })
    }
  }

  changeExtent(e) {
    let opacity = this.state.dataLayer.paint
    opacity['circle-opacity'].stops = [
      [0, 0],
      [e[0], 0.8],
      [e[1], 0],
      [10000000, 0],
    ]
    opacity['circle-opacity'].stops =
      e[0] === 0
        ? opacity['circle-opacity'].stops.slice(1)
        : opacity['circle-opacity'].stops
    opacity['circle-stroke-width'].stops = [
      [0, 0],
      [e[0], 1],
      [e[1], 0],
      [10000000, 0],
    ]
    opacity['circle-stroke-width'].stops =
      e[0] === 0
        ? opacity['circle-stroke-width'].stops.slice(1)
        : opacity['circle-stroke-width'].stops
    //opacity.paint['circle-opacity'].type = "error"
    this._map.setPaintProperty(
      'data',
      'circle-opacity',
      opacity['circle-opacity']
    )
    this._map.setPaintProperty(
      'data',
      'circle-stroke-width',
      opacity['circle-stroke-width']
    )

    this.setState({
      //lower: e[0],
      //upper: e[1],
      sValues: e,
    })
  }

  render() {
    const colorScale = (max) =>
      scaleLinear({
        range: [
          '#ffffcc',
          '#ffeda0',
          '#fed976',
          '#feb24c',
          '#fd8d3c',
          '#fc4e2a',
          '#e31a1c',
          '#bd0026',
          '#800026',
        ],
        domain: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, max >= 100 ? 100 : max],
      })
    const options = {
      //data: geojson,
      type: 'slicer',
      idField: 'id',
      tooltip: 'n',
      popup: (layer) => `<div>${layer.properties.NAME}</div>`,
      style: {
        weight: 0.1,
        opacity: 0.8,
        color: '#ccc',
        fillColor: '#390870',
        fillOpacity: 0.6,
        fill: true,
        stroke: true,
      },
      hoverStyle: {
        fillColor: '#390870',
        fillOpacity: 1,
      },
      activeStyle: {
        fillColor: '#390870',
        fillOpacity: 1,
      },
      zIndex: 401,
    }

    if (typeof window !== 'undefined') {
      return (
        <div id="mapaDelincuencia">
          <MapGL
            {...this.state.viewport}
            onViewportChange={this._onViewportChange}
            onResize={(v) => {
              //console.log (v);
            }}
            onHover={this._onHover}
            mapStyle={this.state.dark_matter}
            mapOptions={{
              customAttribution:
                '© MapTiler <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
            }}
            ref={(ref) => {
              if (ref && ref.getMap()) {
                this._map = ref.getMap()
              }
            }}
          >
            <Source type="geojson" data={this.state.data} id="data">
              <Layer {...this.state.dataLayer} paint={this.state.paint} />
            </Source>

            <div className="mapboxgl-ctrl-top-left" id="fullscreenButton">
              <FullscreenControl container={document.querySelector('map')} />
            </div>

            <div className="mapboxgl-ctrl-top-right">
              <NavigationControl showCompass={false} />
            </div>
            {this._renderTooltip()}
          </MapGL>

          <hr style={{ opacity: 0 }} />
          <div className="columns">
            <div className="column is-6">
              <div className="columns is-centered">
                <div className="column is-6">
                  {this.state.maxCount ? (
                    <LegendNumber
                      scale={scalePower({
                        rangeRound: [192 / 200, 569 / 27],
                        domain: [0, this.state.maxCount],
                        exponent: 0.5,
                      })}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="columns is-centered">
                <div className="column is-6">
                  {this.state.upper ? (
                    <LegendRate scale={colorScale(this.state.upper)} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <hr style={{ opacity: 0 }} />

          <div className="container" style={{ paddingTop: '10px' }}>
            <h2 className="title is-6 has-text-centered">
              <FormattedMessage id="homicide_hist" />
            </h2>
          </div>
          <div className="columns is-centered" style={{ marginBottom: 0 }}>
            <div className="column is-half is-offset-1-mobile is-9-mobile">
              {this.state.histogram !== null ? (
                <ReactEChartsCore
                  echarts={echarts}
                  option={this.state.chartOptions}
                  style={{ height: 200, width: '100%' }}
                />
              ) : (
                <div
                  className="has-background-skeleton has-ratio"
                  style={{ height: 200 }}
                ></div>
              )}
            </div>
          </div>

          <div className="columns is-centered">
            <div
              className="column is-half is-offset-1-mobile is-9-mobile"
              style={{ paddingTop: 0 }}
            >
              {this.state.sValues &&
              this.state.lower !== null &&
              this.state.upper ? (
                <div>
                  <div style={{ height: '25px' }}>
                    <TooltipSlider
                      range
                      trackStyle={{ backgroundColor: '#619cff', height: 20 }}
                      railStyle={{ backgroundColor: '#ccc', height: 20 }}
                      handleStyle={{
                        borderColor: '#000',
                        borderWidth: '1px',
                        borderRadius: '40%',
                        height: 20,
                        width: 25,
                        marginLeft: 0,
                        marginTop: 0,
                        backgroundColor: '#222',
                        opacity: '90%',
                      }}
                      onChangeComplete={this.changeExtent}
                      min={0}
                      max={this.state.upper + 1}
                      defaultValue={[0, this.state.upper + 1]}
                    />
                  </div>
                  <div className="columns is-mobile pt-0">
                    <div
                      className="column has-text-centered is-full"
                      style={{ fontFamily: 'Roboto Condensed, sans-serif' }}
                    >
                      <FormattedMessage id="tasa de homicidios seleccionada" />:{' '}
                      <div className="is-hidden-tablet">
                        <br />
                      </div>
                      <b>
                        <span>{this.state.sValues[0]}</span> -{' '}
                        <span>{this.state.sValues[1]}</span>{' '}
                      </b>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )
    }
    return null
  }
}

function HomicideMapPage(props) {
  // const URLs = useStaticQuery(graphql`
  //   query HistoricalChartQuery {
  //     site {
  //       siteMetadata {
  //         osmTilesUrl
  //         osmSpriteUrl
  //         osmGlyphsUrl
  //       }
  //     }
  //   }
  // `)
  const osmSpriteUrl = 'https://elcri.men/tiles/sprites/sprite'
  const osmGlyphsUrl = 'https://elcri.men/tiles/font/{fontstack}/{range}.pbf'
  const osmTilesUrl =
    'https://tilesmexico.netlify.app/mexico-tiles/{z}/{x}/{y}.pbf'
  const URLs = {
    site: {
      siteMetadata: {
        osmSpriteUrl: `${osmSpriteUrl}`,
        osmGlyphsUrl: `${osmGlyphsUrl}`,
        osmTilesUrl: `${osmTilesUrl}`,
      },
    },
  }
  const intl = useIntl()
  const last_date = useLastMonth()
  const colorScale = (max) =>
    scaleLinear({
      range: [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#bd0026',
        '#800026',
      ],
      domain: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, max >= 100 ? 100 : max],
    })

  const [maxRate, setMaxRate] = React.useState(null)
  const [maxCount, setMaxCount] = React.useState(null)
  return (
    <Layout
      locale={props.pageContext.locale}
      path={props.location.pathname}
      wide={true}
    >
      <SEO
        title={intl.formatMessage({ id: 'title_mapa' })}
        description={intl.formatMessage({ id: 'desc_mapa' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <Helmet
        bodyAttributes={{
          class: 'homepage',
        }}
      >
        <link
          href="https://tilesmexico.netlify.app"
          rel="preconnect"
          crossOrigin
        />
      </Helmet>

      <HeroTitle>
        {intl.formatMessage({ id: 'Map of homicides in Mexico from' })}{' '}
        {props.pageContext.locale === 'es'
          ? last_date.month_long_es6
          : last_date.month_long_en6}{' '}
        <FormattedDate
          value={YYYYmmddToDate15(last_date.iso_mid6)}
          year="numeric"
        />{' '}
        {intl.formatMessage({ id: 'to' })}{' '}
        {props.pageContext.locale === 'es'
          ? last_date.month_long_es
          : last_date.month_long_en}{' '}
        <FormattedDate
          value={YYYYmmddToDate15(last_date.iso_mid)}
          year="numeric"
        />
      </HeroTitle>

      <section id="map_container">
        <div className="container is-fluid">
          {/* <AdSense.Google
              client="ca-pub-2949275046149330"
              slot="8649980552"
              style={{display: 'block'}}
              format="auto"
              responsive="true"
            /> */}
          <div style={{ height: '1290px', overflow: 'hidden' }}>
            <DotMapGL
              tilesURL={URLs.site.siteMetadata.osmTilesUrl}
              osmSpriteUrl={URLs.site.siteMetadata.osmSpriteUrl}
              osmGlyphsUrl={URLs.site.siteMetadata.osmGlyphsUrl}
              maxMapCount={setMaxCount}
              maxMapRate={setMaxRate}
            />
          </div>

          {/* <AdSense.Google
              client="ca-pub-2949275046149330"
              slot="8649980552"
              style={{display: 'block'}}
              format="auto"
              responsive="true"
            /> */}
        </div>
      </section>

      <hr />
      <TextColumn>
        <div className="card has-background-light">
          <div className="card-content">
            {intl.formatMessage({ id: 'map_txt' })}
          </div>
        </div>
      </TextColumn>
      <hr />
      <TextColumn>
        <FormattedHTMLMessage id="map_extra_text" />
      </TextColumn>
      {/*  <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{display: 'block'}}
          format="auto"
          responsive="true"
        /> */}
    </Layout>
  )
}

export default HomicideMapPage
