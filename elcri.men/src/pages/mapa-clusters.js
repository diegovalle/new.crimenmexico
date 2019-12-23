import React from 'react';
import Helmet from 'react-helmet';

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

import social_image from '../assets/images/social/social-clusters.png';
import social_image_en from '../assets/images/social/social-clusters_en.png';

//import {Map, TileLayer, withLeaflet, GeoJSON} from 'react-leaflet';
//import VectorGrid from 'react-leaflet-vectorgrid';
//import VectorGridDefault from 'react-leaflet-vectorgrid';
import MapGL, {
  Source,
  Layer,
  FullscreenControl,
  NavigationControl,
  Marker,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../components/ClusterMap/ClusterMap.css';

import {findIndex, zip} from 'lodash-es';
import {format as num_format} from 'd3-format';

import {feature} from 'topojson-client';
//import 'react-leaflet-fullscreen/dist/styles.css'
//import FullscreenControl from 'react-leaflet-fullscreen';

//import geojson from '../../elcrimen-json/static/mexico_topojson';
import MAP_STYLE from '../components/ClusterMap/cluster_map_style';

const mapStyle = {
  ...MAP_STYLE,
};

//const mexmuns = feature (geojson, geojson.objects.mexico_geojson);
const MAPBOX_TOKEN =
  'pk.eyJ1IjoiZGllZ292YWxsZXkiLCJhIjoiY2l5ZGI2NjRjMDBtMDJxbXhocml3MjdnbyJ9.aWk3BvZsieIOIWRrinTXqQ';
const cities = [
  {name: 'Cancún', coords: [21.161, -86.825]},
  {name: 'Acapulco', coords: [16.862, -99.887]},
  //{"name": "Los Cabos", "coords": [23.062, -109.695]},
  {name: 'Manzanillo', coords: [19.053, -104.316]},
  {name: 'Tijuana', coords: [32.532, -117.019]},
  {name: 'Guadalupe y Calvo', coords: [26.095, -106.964]},
  //{"name": "Victoria", "coords": [23.731, -99.151]},
  {name: 'Miguel Aleman', coords: [26.401, -99.026]},
  //{"name": "Coatzacoalcos", "coords": [18.138, -94.453]},
  //{"name": "Poza Rica", "coords": [20.534, -97.444]},
  {name: 'Zihuatanejo', coords: [17.650, -101.548]},
  //{"name": "Tepic", "coords": [21.507, -104.894]},
  {name: 'Zacatecas', coords: [22.776, -102.572]},
  {name: 'Apatzingán', coords: [19.087, -102.355]},
  {name: 'Guaymas', coords: [27.923, -110.889]},
  {name: 'Jojutla', coords: [18.617, -99.181]},
  {name: 'Zamora', coords: [19.984, -102.286]},
  {name: 'Guadalajara', coords: [20.676, -103.342]},
  // {name: 'Ciudad Obregón', coords: [27.496, -109.933]},
  {name: 'Culiacán', coords: [24.809, -107.394]},
  //{"name": "Salvatierra", "coords": [20.216, -100.881]},
  {name: 'Salamanca', coords: [20.569, -101.200]},
  {name: 'Juárez', coords: [31.746, -106.485]},
  {name: 'Tecamachalco', coords: [18.885, -97.728]},
  {name: 'Benemérito de las Américas', coords: [16.516, -90.653]},
  {name: 'Ciudad Hidalgo', coords: [14.679, -92.151]},
];

class ClusterMap extends React.Component {
  constructor () {
    super ();

    this.state = {
      lightboxIsOpen: false,
      currentImage: 0,
      data: null,
      geojson: null,
      mapStyle: null,
      hoveredFeature: null,
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
  }

  _onHover = event => {
    const {features, srcEvent: {offsetX, offsetY}} = event;
    const hoveredFeature =
      features && features.find (f => f.layer.id === 'mexico-geojson (1)');

    this.setState ({hoveredFeature, x: offsetX, y: offsetY});
  };

  _renderTooltip () {
    let index;
    const {hoveredFeature, x, y} = this.state;
    if (hoveredFeature)
      index = findIndex (this.state.data['mun.map.id'], function (d) {
        return d === hoveredFeature.properties.CVEGEO;
      });
    return (
      hoveredFeature &&
      <div
        className="tooltip is-size-6"
        style={{left: x, top: y, backgroundColor: '#666', lineHeight: '1.1rem'}}
      >
        <div>
          <b>
            {this.state.data['mun.map.municipio'][index]}
            ,
            {' '}
            {this.state.data['mun.map.state'][index]}{' '}
          </b>
          <br />
          <FormattedMessage id="modeled rate" />
          :
          {' '}
          {this.state.data['smooth.rate'][index]}
          <br />
          <FormattedMessage id="population" />
          :
          {' '}
          {num_format (',') (this.state.data['population'][index])}
        </div>
      </div>
    );
  }

  componentDidMount () {
    this.setState ({mounted: true});
    fetch ('/elcrimen-json/lisa.json')
      .then (response => response.json ())
      .then (responseJSON => {
        let values = responseJSON[1];
        let index;
        console.time ('features');
        let colors = zip (
          responseJSON[1]['mun.map.id'],
          responseJSON[1]['color']
        );
        // mexmuns.features.forEach (function (e) {
        //   index = findIndex (values['mun.map.id'], function (d) {
        //     return d === e.properties.id;
        //   });
        //   e.properties['color'] = values['color'][index];
        //   if (typeof values['mun.map.municipio'][index] !== 'undefined') {
        //     e.properties['municipio'] = values['mun.map.municipio'][index];
        //     e.properties['state'] = values['mun.map.state'][index];
        //     e.properties['rate'] = values['smooth.rate'][index];
        //     e.properties['pop'] = num_format (',') (
        //       values['population'][index]
        //     );
        //   } else e.properties['name'] = 'NA';
        // });
        // console.timeEnd ('features');
        mapStyle.layers.push ({
          id: 'mexico-geojson (1)',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'mexico_geojson',
          layout: {},
          paint: {
            'fill-color': {
              property: 'CVEGEO',
              type: 'categorical',
              stops: colors,
            },
            'fill-opacity': 0.85,
          },
        });
        this.setState ({mapStyle: mapStyle, data: responseJSON[1]});
      })
      .catch (error => {
        console.error (error);
      });
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

  render () {
    if (typeof window !== 'undefined') {
      return (
        <MapGL
          style={{width: '100%', height: '600px'}}
          {...this.state.viewport}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          //mapStyle={"https://tile.thunderforest.com/thunderforest.transport-v1.json?apikey=b0ba23bd00dd483fa3e5e6c6c2afe6d2"}
          //mapStyle="https://api.maptiler.com/maps/topo/style.json?key=1BrlyjfV5ry5lknBp5S6"
          //mapStyle="mapbox://styles/mapbox/streets-v11"
          //mapStyle="http://localhost:8000/elcrimen-json/style_bw.json"
          mapStyle={this.state.mapStyle}
          //mapStyle="https://tileserver-902ec.firebaseapp.com/municipio-tiles/style_bw.json"
          //mapStyle="https://tileserver-902ec.firebaseapp.com/inegi-municipios/style.json"
          mapboxApiAccessToken={process.env.GATSBY_MAPBOX_TOKEN}
          mapOptions={{
            customAttribution: '© MapTiler <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
          }}
        >
          {/* <Source type="geojson" data={this.state.data} id="municipios">
                <Layer {...dataLayer} source="municipios" />
              </Source> */}

          <div style={{position: 'absolute', right: 0}}>
            <div className="mapboxgl-ctrl-top-right">
              <NavigationControl showCompass={false} position="top-left" />
            </div>
          </div>
          <div className="mapboxgl-ctrl-top-left">
            <FullscreenControl
              position="top-right"
              container={document.querySelector ('map')}
            />
          </div>
          {this._renderTooltip ()}
          {/* {cities.map ((d, i) => {
                return (
                <Marker latitude={d.coords[0]} longitude={d.coords[1]}>
                  <div className="my-label">{d.name}</div>
                </Marker>
                )
              })} */}

        </MapGL>
      );
    }
    return null;
  }
}

function ClusterMapPage (props) {
  const intl = useIntl ();
  const last_date = useLastMonth ();
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname} wide={true}>
      <SEO
        title={intl.formatMessage ({id: 'title_clusters'})}
        description={intl.formatMessage ({id: 'desc_clusters'})}
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
      />

      <HeroTitle>
        {intl.formatMessage ({id: 'Map of homicide clusters in Mexico from'})}
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

      <div style={{height: '700px', overflow: 'hidden'}}>
        <ClusterMap />
      </div>
      <hr />
      <TextColumn>
        {intl.formatMessage ({id: 'cluster_txt'})}
      </TextColumn>
    </Layout>
  );
}

export default ClusterMapPage;
