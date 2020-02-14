import React, {useState, useEffect} from 'react';
import {feature} from 'topojson-client';
import {scaleQuantize, scalePower} from '@vx/scale';
import {schemeOrRd} from 'd3-scale-chromatic';
import {format} from 'd3-format';
import {Mercator} from '@vx/geo';
import {ParentSize} from '@vx/responsive';
import {withTooltip, TooltipWithBounds} from '@vx/tooltip';
import {localPoint} from '@vx/event';
import {Circle} from '@vx/shape';
import {minBy, maxBy} from 'lodash-es';
import {useIntl, FormattedMessage} from 'react-intl';

import topology from '../../assets/json/mexico_estatal.json';

const mexico = feature (topology, topology.objects.mexico_estatal);
var round1 = format ('.1f');

function TourismMap (props) {
  const [data, setdata] = useState (null);
  const [color, setcolor] = useState (null);
  const [min_count, set_min_count] = useState (null);
  const [max_count, set_max_count] = useState (null);
  const [selected_state, setselected_state] = useState (null);
  const [radiusScale, setradiusScale] = useState (() => null);
  const [colorScale, setcolorScale] = useState (() => null);

  useEffect (() => {
    const {data} = props;
    let max_count = maxBy (data, function (o) {
      return o.count;
    })['count'];
    let min_count = minBy (data, function (o) {
      return o.count;
    })['count'];
    let max_rate = maxBy (data, function (o) {
      return o.rate;
    })['rate'];
    let min_rate = minBy (data, function (o) {
      return o.rate;
    })['rate'];
    set_min_count (min_count);
    set_max_count (max_count);
    const radiusScale2 = scalePower ({
      rangeRound: [2, 12],
      domain: [min_count, max_count],
    });
    const colorScale2 = scaleQuantize ({
      range: schemeOrRd[9],
      domain: [min_rate, max_rate >= 100 ? 100 : max_rate],
    });
    setcolorScale (() => colorScale2);
    setradiusScale (() => radiusScale2);
    setdata (data);
  }, []);

  const handleMouseOver = (event, datum) => {
    const coords = localPoint (event.target.ownerSVGElement, event);
    props.showTooltip ({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    });
  };

  const rectClick = e => {
    props.updateState ('0');
    setselected_state ('0');
  };

  const handleSelect = e => {
    const {value} = e.target;
  };

  let opacity, strokeWidth;
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hideTooltip,
  } = props;
  const intl = useIntl ();
  return (
    <div>
      {data !== null
        ? <ParentSize>
            {parent => (
              <React.Fragment>
                {parent.width
                  ? <React.Fragment>
                      <svg
                        width={parent.width}
                        height={parent.width ? parent.width * 0.75 : 0}
                      >

                        <Mercator
                          fitExtent={[
                            [[25, 0], [parent.width - 25, parent.height]],
                            mexico,
                          ]}
                          data={mexico.features}
                        >
                          {mercator => {
                            return (
                              <g>

                                {mercator.features.map ((feature, i) => {
                                  const {feature: f} = feature;
                                  return (
                                    <React.Fragment key={`frag-${i}`}>
                                      <path
                                        key={`map-feature-${i}`}
                                        d={mercator.path (f)}
                                        fill={'#c7b470'}
                                        stroke={'black'}
                                        strokeWidth={0.5}
                                      />
                                    </React.Fragment>
                                  );
                                })}

                                {data.map ((f, i) => {
                                  return (
                                    <Circle
                                      onMouseMove={e => handleMouseOver (e, f)}
                                      onMouseOut={hideTooltip}
                                      key={`point-${i}`}
                                      cx={
                                        mercator.features[0].projection ([
                                          f.long,
                                          f.lat,
                                        ])[0]
                                      }
                                      cy={
                                        mercator.features[0].projection ([
                                          f.long,
                                          f.lat,
                                        ])[1]
                                      }
                                      r={scalePower ({
                                        rangeRound: [
                                          parent.height / 200,
                                          parent.height / 26,
                                        ],
                                        domain: [min_count, max_count],
                                      }) (f.count + 1)}
                                      fill={colorScale (f.rate)}
                                      opacity={0.8}
                                      stroke={'#111'}
                                    />
                                  );
                                })}
                              </g>
                            );
                          }}
                        </Mercator>
                      </svg>

                      {tooltipOpen &&
                        <TooltipWithBounds
                          // set this to random so it correctly updates with parent bounds
                          key={tooltipData.name}
                          style={{backgroundColor: 'black', color: 'white'}}
                          top={tooltipTop}
                          left={tooltipLeft}
                        >
                          <b>{tooltipData.name}</b>
                          <br />
                          <b>{intl.formatMessage ({id: 'rate'})}:</b>
                          {' '}
                          {tooltipData.rate}
                          <br />
                          <b>{intl.formatMessage ({id: 'homicides'})}:</b>
                          {' '}

                          {tooltipData.count}
                        </TooltipWithBounds>}

                    </React.Fragment>
                  : <div />}
              </React.Fragment>
            )}
          </ParentSize>
        : <div />}
    </div>
  );
}

export default TourismMap;
