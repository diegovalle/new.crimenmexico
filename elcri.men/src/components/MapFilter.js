/* global window */
import React, {PureComponent} from 'react';
import {BaseControl} from 'react-map-gl';
import OrdinalFrame from 'semiotic/lib/OrdinalFrame';
import {maxBy} from 'lodash-es';

const frameProps = {
  /* --- Size --- */
  size: [700, 100],
  margin: {left: 20, top: 0, bottom: 50, right: 20},

  /* --- Layout --- */
  type: 'bar',
  //summaryType: 'histogram',
  summaryType: {
    type: 'histogram',
    bins: 200, // Number, bins ito bin the values into,
    //binValue: d => d.length, //Function that determines the summarized value (by default it’s the number of items in a bin),
    useBins: true, // Boolean, if set to false, bins will have a one-to-one correspondence with the points passed to the column, allowing you to create your own samples without trying to wrangle bin numbers,
    relative: false, // Boolean, whether or not the scale of each individual plot is relative to the maximum of all plots or only to its own plot,
    // axis: Object, Uses the same axis settings from everywhere else but makes an axis for each column
  },
  projection: 'horizontal',

  /* --- Process --- */
  oAccessor: function () {
    return 'singleColumn';
  },
  rAccessor: 'value',
  //rExtent: [0, 500],

  /* --- Customize --- */
  style: {fill: '#ac58e5', stroke: 'white', strokeWidth: 1},
  summaryStyle: {
    fill: '#ac58e5',
    fillOpacity: 1,
    stroke: 'white',
    strokeWidth: 1,
  },
  axes: [{orient: 'bottom', ticks: 8}],
};

export default class MapFilter extends BaseControl {
  static defaultProps = {
    captureScroll: true,
    captureDrag: true,
    captureClick: true,
    captureDoubleClick: true,
  };

  constructor (props) {
    super (props);
    this.state = {
      hasFocus: false,
      values: null,
      lower: null,
      upper: null,
      histogram: null,
    };

    this.changeExtent = this.changeExtent.bind (this);
    this.onBrush = this.onBrush.bind (this);
  }


  onBrush (d) {
    let hist = this.props.histogram;
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
    //console.log (opacity['circle-opacity']);
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

  changeExtent (e) {
    //console.log (e);
    let opacity = this.props.dataLayer.paint;
    opacity['circle-opacity'].stops = [
      [0, 0],
      [e[0], 0.8],
      [e[1], 0],
      [10000000, 0],
    ];
    opacity['circle-opacity'].stops = e[0] === 0
      ? opacity['circle-opacity'].stops.slice (1)
      : opacity['circle-opacity'].stops;
    opacity['circle-stroke-width'].stops = [
      [0, 0],
      [e[0], 1],
      [e[1], 0],
      [10000000, 0],
    ];
    opacity['circle-stroke-width'].stops = e[0] === 0
      ? opacity['circle-stroke-width'].stops.slice (1)
      : opacity['circle-stroke-width'].stops;
    //opacity.paint['circle-opacity'].type = "error"
    //console.log (opacity['circle-opacity'].stops);
    this.props.map.setPaintProperty (
      'data',
      'circle-opacity',
      opacity['circle-opacity']
    );
    this.props.map.setPaintProperty (
      'data',
      'circle-stroke-width',
      opacity['circle-stroke-width']
    );

    this.setState ({
      lower: e[0],
      upper: e[1],
    });
  }

  _render = () => {
    const {values} = this.props;

    const Container = ({children}) => (
      <div className="control-panel">{children}</div>
    );
    return (
      <Container>
        <div>

          <div
            className="panel"
            style={{
              background: '#fff',
              position: 'absolute',
              outline: 'none',
              cursor: 'auto',
            }}
            tabindex="0"
          >
            {values !== null
              ? <OrdinalFrame
                  {...frameProps}
                  data={values}
                  interaction={{
                    columnsBrush: true,
                    extent: {
                      singleColumn: [
                        0,
                        maxBy (values, function (o) {
                          return o.value;
                        }).value,
                      ],
                    },
                    //end: this.changeExtent,
                    during: this.changeExtent,
                  }}
                />
              : null}
          </div> : <div />
        </div>

      </Container>
    );
  };
}
