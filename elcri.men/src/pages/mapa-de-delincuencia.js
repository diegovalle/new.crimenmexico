// import {
//   BarChart,
//   Bar,
//   Brush,
//   ReferenceLine,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from 'recharts';
import React from 'react';
import Helmet from 'react-helmet';
import AdSense from 'react-adsense';

import Layout from '../components/layout';
import Footer from '../components/Footer';
import HeroTitle from '../components/HeroTitle';
import SEO from '../components/SEO';
import {
  useIntl,
  FormattedHTMLMessage,
  FormattedDate,
  FormattedMessage,
} from 'react-intl';
import useLastMonth from '../components/LastMonth';
import TextColumn from '../components/TextColumn';

import social_image from '../assets/images/social/social-mapa.png';
import social_image_en from '../assets/images/social/social-mapa_en.png';

import 'react-dates/initialize';
import 'rheostat/css/rheostat.css';
import 'react-dates/lib/css/_datepicker.css';
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';
import cssInterface from 'react-with-styles-interface-css';
import RheostatDefaultTheme from 'rheostat/lib/themes/DefaultTheme';
import ReactDatesDefaultTheme from 'react-dates/lib/theme/DefaultTheme';

ThemedStyleSheet.registerInterface (cssInterface);
ThemedStyleSheet.registerTheme ({
  ...RheostatDefaultTheme,
  ...ReactDatesDefaultTheme,
});
import Rheostat from 'rheostat';

import MetricsGraphics from 'react-metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';

import MapGL, {
  Source,
  Layer,
  FullscreenControl,
  NavigationControl,
  Marker,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../components/ClusterMap/ClusterMap.css';

import {findIndex, countBy, filter, maxBy} from 'lodash-es';
import {format as num_format} from 'd3-format';

import dark_matter from '../components/DotMap/dot_map_style_gray';

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
      stops: [[0, 1], [493, 1], [10000000, 0]],
    },
    'circle-opacity': {
      property: 'rate',
      type: 'interval',
      stops: [[0, 0.8], [493, 0.8], [10000000, 0]],
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
};

class DotMapGL extends React.Component {
  constructor () {
    super ();

    this.state = {
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
      map: null,
      values: null,
      lower: null,
      upper: null,
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
    };
    this._onViewportChange = this._onViewportChange.bind (this);
    this._onHover = this._onHover.bind (this);
    this.onBrush = this.onBrush.bind (this);
    this.changeExtent = this.changeExtent.bind (this);
    this.setValue = this.setValue.bind (this);
    this.updateValue = this.updateValue.bind (this);
  }

  PitComponents({style, children}) {
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
    );
  }

  _onHover = event => {
    const {features, srcEvent: {offsetX, offsetY}} = event;
    const hoveredFeature =
      features && features.find (f => f.layer.id === 'data');

    this.setState ({hoveredFeature, x: offsetX, y: offsetY});
  };

  _renderTooltip () {
    const {hoveredFeature, x, y} = this.state;

    return (
      hoveredFeature &&
      (hoveredFeature.properties.rate <= this.state.upper &&
        hoveredFeature.properties.rate >= this.state.lower) &&
      <div
        className="tooltip is-size-6"
        style={{left: x, top: y, backgroundColor: '#111', lineHeight: '1.1rem'}}
      >
        <div>
          <b>{hoveredFeature.properties.name}</b>
          <br />
          <FormattedMessage id="rate" />
          :
          {' '}
          {hoveredFeature.properties.rate}
          <br />
          <FormattedMessage id="map_count" />: {hoveredFeature.properties.count}
          <br />
          <FormattedMessage id="population" />
          :
          {' '}
          {num_format (',') (hoveredFeature.properties.population)}
        </div>
      </div>
    );
  }

  componentDidMount () {
    this.setState ({mounted: true});
    fetch ('/elcrimen-json/municipios-centroids.json')
      .then (response => response.json ())
      .then (responseJSON => {
        responseJSON.features = responseJSON.features.map (d => {
          d.properties.rate = parseFloat (d.properties.rate);
          d.properties.count = parseInt (d.properties.count);
          return d;
        });
        let hist = countBy (responseJSON.features, function (x) {
          return Math.floor (x.properties.rate);
        });
        let histogram = [];
        Object.keys (hist).forEach (function (key) {
          histogram.push ({
            name: parseInt (key),
            count: hist[key] !== 0
              ? Math.log (hist[key])
              : Math.log (hist[key]),
          });
        });
        let values = responseJSON.features.map (x => {
          return {value: x.properties.rate};
        });
        this.setState ({
          data: responseJSON,
          histogram: histogram,
          values: values,
          lower: 0,
          sValues: [
            0,
            maxBy (values, function (o) {
              return o.value;
            }).value,
          ],
          upper: maxBy (values, function (o) {
            return o.value;
          }).value,
        });
      })
      .catch (error => {
        console.error (error);
      });
  }

  setValue (v) {
    this.setState ({sValues: v});
  }

  onBrush (d) {
    let hist = this.state.histogram;
    let filtered = filter (this.state.data.features, function (o) {
      return o.properties.rate > parseInt (hist[d.startIndex].name);
    });
    let geojson = this.state.data;
    geojson.features = filtered;
    let opacity = this.state.dataLayer.paint;
    opacity['circle-opacity'].stops = [
      [0, 1],
      [parseInt (hist[d.startIndex].name), 0.8],
      [parseInt (hist[d.endIndex].name), 0],
      [10000000, 0],
    ];
    opacity['circle-stroke-width'].stops = [
      [0, 0],
      [parseInt (hist[d.startIndex].name), 1],
      [parseInt (hist[d.endIndex].name), 0],
      [10000000, 0],
    ];
    //opacity.paint['circle-opacity'].type = "error"
    this._map.setPaintProperty (
      'data',
      'circle-opacity',
      opacity['circle-opacity']
    );
    this._map.setPaintProperty (
      'data',
      'circle-stroke-width',
      opacity['circle-stroke-width']
    );
    this.setState ({paint: opacity});
  }

  _onViewportChange (viewport) {
    // -121.2843, 9.664643, -85.49087, 32.72067
    let top = 32.72067,
      bottom = 9.664643 + 5,
      left = -121.2843 + 5,
      right = -85.49087 + 5;
    if (viewport.longitude < left) {
      viewport.longitude = left;
    } else if (viewport.longitude > right) {
      viewport.longitude = right;
    } else if (viewport.latitude < bottom) {
      viewport.latitude = bottom;
    } else if (viewport.latitude > top) {
      viewport.latitude = top;
    }

    if (this.state.mounted) {
      this.setState ({
        viewport,
      });
    }
  }

  changeExtent (e) {
    let opacity = this.state.dataLayer.paint;
    opacity['circle-opacity'].stops = [
      [0, 0],
      [e.values[0], 0.8],
      [e.values[1], 0],
      [10000000, 0],
    ];
    opacity['circle-opacity'].stops = e.values[0] === 0
      ? opacity['circle-opacity'].stops.slice (1)
      : opacity['circle-opacity'].stops;
    opacity['circle-stroke-width'].stops = [
      [0, 0],
      [e.values[0], 1],
      [e.values[1], 0],
      [10000000, 0],
    ];
    opacity['circle-stroke-width'].stops = e.values[0] === 0
      ? opacity['circle-stroke-width'].stops.slice (1)
      : opacity['circle-stroke-width'].stops;
    //opacity.paint['circle-opacity'].type = "error"
    this._map.setPaintProperty (
      'data',
      'circle-opacity',
      opacity['circle-opacity']
    );
    this._map.setPaintProperty (
      'data',
      'circle-stroke-width',
      opacity['circle-stroke-width']
    );

    this.setState ({
      //lower: e.values[0],
      //upper: e.values[1],
      sValues: e.values,
    });
  }

  updateValue (sliderState) {
    this.setState ({
      sValues: sliderState.values,
    });
  }

  render () {
    //const VectorGrid = withLeaflet (VectorGridDefault);
    //const engine = new Styletron ();
    const options = {
      //data: geojson,
      type: 'slicer',
      idField: 'id',
      tooltip: 'n',
      popup: layer => `<div>${layer.properties.NAME}</div>`,
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
    };
    if (typeof window !== 'undefined') {
      return (
        <div id="mapaDelincuencia">

          <MapGL
            {...this.state.viewport}
            onViewportChange={this._onViewportChange}
            onResize={v => {
              //console.log (v);
            }}
            onHover={this._onHover}
            mapStyle={this.state.dark_matter}
            mapOptions={{
              customAttribution: '© MapTiler <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
            }}
            ref={ref => {
              if (ref && ref.getMap ()) {
                this._map = ref.getMap ();
              }
            }}
          >
            <Source type="geojson" data={this.state.data} id="data">
              <Layer {...this.state.dataLayer} paint={this.state.paint} />
            </Source>

            <div className="mapboxgl-ctrl-top-left" id="fullscreenButton">
              <FullscreenControl container={document.querySelector ('map')} />
            </div>

            <div className="mapboxgl-ctrl-top-right">
              <NavigationControl showCompass={false} />
            </div>
            {this._renderTooltip ()}

          </MapGL>
          <div className="columns is-centered">
            <div className="column is-half is-offset-1-mobile is-9-mobile">
              {this.state.histogram !== null
                ? <MetricsGraphics
                    title={''}
                    // description="This graphic shows a time-series of downloads."
                    data={this.state.histogram}
                    height={100}
                    // colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}

                    //full_width={true}
                    width={600}
                    //interpolate={linear}
                    chart_type="histogram"
                    binned={true}
                    bar_margin={0}
                    //xax_format={date_format ('%b')}
                    //yax_format={num_format ('.0f')}
                    //max_y={this.props.max_rate}
                    //min_y={this.props.min_y}
                    x_accessor="name"
                    y_accessor="count"
                    x_axis={false}
                    y_axis={false}
                    left={0}
                    buffer={0}
                    top={0}
                    bottom={0}
                    color="gray"
                  />
                : null}
            </div>
          </div>
          <div className="columns is-centered">
            <div className="column is-half is-offset-1-mobile is-9-mobile">
              {this.state.sValues !== null
                ? <div>
                    <Rheostat
                      min={this.state.lower}
                      max={this.state.upper}
                      onValuesUpdated={this.updateValue}
                      // snap={true}
                      // snapPoints={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                      values={this.state.sValues}
                      onChange={this.changeExtent}
                      pitComponent={this.PitComponents}
                      pitPoints={Array.apply (
                        undefined,
                        Array (Math.floor (this.state.upper / 50))
                      ).map (function (x, y) {
                        return y * 50 + 50;
                      })}
                    />
                    <div className="columns is-mobile">
                      <div className="column is-half">
                        <span className="has-text-left">
                          {this.state.sValues[0]}
                        </span>
                      </div>
                      <div className="column is-half has-text-right">
                        <span className="">
                          {this.state.sValues[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                : null}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

function HomicideMapPage (props) {
  const intl = useIntl ();
  const last_date = useLastMonth ();
  return (
    <Layout
      locale={props.pageContext.locale}
      path={props.location.pathname}
      wide={true}
    >
      <SEO
        title={intl.formatMessage ({id: 'title_mapa'})}
        description={intl.formatMessage ({id: 'desc_mapa'})}
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
          crossorigin
        />
      </Helmet>


      <HeroTitle>
        {intl.formatMessage ({id: 'Map of homicides in Mexico from'})}
        {' '}
        {props.pageContext.locale === 'es'
          ? last_date.month_long_es6
          : last_date.month_long_en6}
        {' '}
        <FormattedDate value={new Date (last_date.iso_mid6)} year="numeric" />
        {' '}
        {intl.formatMessage ({id: 'to'})}
        {' '}
        {props.pageContext.locale === 'es'
          ? last_date.month_long_es
          : last_date.month_long_en}
        {' '}
        <FormattedDate value={new Date (last_date.iso_mid)} year="numeric" />
      </HeroTitle>

      <section id="map_container">
        <div className="container is-fluid">
            <AdSense.Google
              client="ca-pub-2949275046149330"
              slot="8649980552"
              style={{display: 'block'}}
              format="auto"
              responsive="true"
            />
          <div style={{height: '900px', overflow: 'hidden'}}>
            <DotMapGL />
          </div>

            <AdSense.Google
              client="ca-pub-2949275046149330"
              slot="8649980552"
              style={{display: 'block'}}
              format="auto"
              responsive="true"
            />
        </div>
      </section>

      <hr />
      <TextColumn>
        {intl.formatMessage ({id: 'map_txt'})}
      </TextColumn>

        <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{display: 'block'}}
          format="auto"
          responsive="true"
        />
    </Layout>
  );
}

export default HomicideMapPage;
