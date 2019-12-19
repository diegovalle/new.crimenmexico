import React, {useState, useEffect} from 'react';
import {feature} from 'topojson-client';
import {scaleQuantize} from '@vx/scale';
import {schemeYlOrRd} from 'd3-scale-chromatic';
import {format} from 'd3-format';
import {Mercator} from '@vx/geo';
import {ParentSize} from '@vx/responsive';
import {withTooltip, TooltipWithBounds} from '@vx/tooltip';
import {localPoint} from '@vx/event';
import {useIntl, FormattedMessage} from 'react-intl';
import {keyBy} from 'lodash-es';

import topology from '../assets/json/mx_hexgrid_topojson.json';

const mexico = feature (topology, topology.objects.mx_hexgrid);
var round1 = format ('.1f');
var comma = format (',');
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
};

function MxHexTileMap (props) {
  const intl = useIntl ();
  const [data, setData] = useState (null);
  const [tooltipTable, settooltipTable] = useState (null);
  const [selected_state, setselected_state] = useState (null);
  const [crime, setCrime] = useState ('hd');

  useEffect (() => {
    fetch ('/elcrimen-json/states_hexgrid.json')
      .then (response => response.json ())
      .then (responseJSON => {
        mexico.features = mexico.features.map (function (f) {
          let colors = {};
          Object.keys (responseJSON).map (function (crime) {
            let index = responseJSON[crime].findIndex (function (e) {
              return e.state_abbrv === f.properties.state_abbr;
            });

            let ratecolor = color (responseJSON, crime) (
              responseJSON[crime][index].rate
            );
            colors[crime] = ratecolor;
          });
          return {
            ...f,
            ...colors,
          };
        });
        setData (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const color = function (data, crime) {
    return scaleQuantize ({
      domain: [
        Math.min.apply (
          Math,
          data[crime].map (function (o) {
            return o.rate;
          })
        ),
        Math.max.apply (
          Math,
          data[crime].map (function (o) {
            return o.rate;
          })
        ),
      ],
      range: schemeYlOrRd[9],
    });
  };

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

    props.updateCrime (value);
    setCrime (value);
  };

  const stateClick = e => {
    props.updateState (e.target.attributes.state_code.value);
    setselected_state (e.target.attributes.state.value);
  };

  let opacity, strokeWidth;
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hideTooltip,
  } = props;
  return (
    <figure className="image is-square">
      <div className="has-ratio">
        {data !== null
          ? <ParentSize>
              {parent => (
                <React.Fragment>

                  <div className="select-style">
                    <select
                      id="crimeSelect"
                      onChange={handleSelect}
                      aria-label="Select Crime"
                    >
                      <option value="hd">
                        {intl.formatMessage ({id: 'Homicidio Intencional'})}
                      </option>
                      <option value="sec">
                        {intl.formatMessage ({id: 'Secuestro'})}
                      </option>
                      <option value="ext">
                        {intl.formatMessage ({id: 'Extorsión'})}
                      </option>
                      <option value="rvcv">
                        {intl.formatMessage ({
                          id: 'Robo de Coches con Violencia',
                        })}
                      </option>
                      <option value="rvsv">
                        {intl.formatMessage ({
                          id: 'Robo de Coches sin Violencia',
                        })}
                      </option>
                    </select>
                  </div>
                  <div className="legend">
                    <ul className="OrRd list-inline">
                      {schemeYlOrRd[9].map ((feature, i) => {
                        return (
                          <li
                            key={i}
                            className="key is-size-6 is-size-7-mobile"
                            style={{borderTopColor: feature}}
                          >
                            {round1 (
                              color (data, crime).invertExtent (feature)[0]
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div style={{position: 'relative'}}>
                    <div id="hexmap" style={{height: '100%', width: '100%'}}>
                      <svg
                        width={parent.width}
                        height={(parent.width ? parent.width : 50) - 50}
                      >
                        <rect
                          x={0}
                          y={0}
                          width={parent.width}
                          height={(parent.width ? parent.width : 50) - 50}
                          fill="transparent"
                          rx={14}
                          onClick={rectClick}
                        />
                        <Mercator
                          fitExtent={[
                            [
                              [30, 0],
                              [
                                parent.width - 20,
                                (parent.width ? parent.width : 50) - 50,
                              ],
                            ],
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
                                        fill={f[crime]}
                                        stroke={'black'}
                                        strokeWidth={0.5}
                                      />
                                      <text
                                        key={`text-feature-${i}`}
                                        textAnchor="middle"
                                        className="is-size-7-mobile"
                                        dominantBaseline="mathemetical"
                                        x={
                                          mercator.path.centroid (f)[0]
                                            ? mercator.path.centroid (f)[0]
                                            : -1
                                        }
                                        y={
                                          mercator.path.centroid (f)[1]
                                            ? mercator.path.centroid (f)[1] + 5
                                            : -1
                                        }
                                      >
                                        {f.properties.state_abbr}
                                      </text>
                                    </React.Fragment>
                                  );
                                })}
                                {mercator.features.map ((feature, i) => {
                                  const {feature: f} = feature;
                                  if (
                                    selected_state === f.properties.state_abbr
                                  ) {
                                    opacity = 1;
                                    strokeWidth = '4px';
                                  } else {
                                    opacity = 0;
                                    strokeWidth = 0;
                                  }
                                  return (
                                    <path
                                      onMouseMove={e =>
                                        handleMouseOver (e, f.properties)}
                                      onMouseOut={hideTooltip}
                                      key={`map-overlay-feature2-${i}`}
                                      state={f.properties.state_abbr}
                                      state_code={f.properties.state_code}
                                      d={mercator.path (f)}
                                      fill={'transparent'}
                                      stroke={'black'}
                                      opacity={1}
                                      strokeWidth={strokeWidth}
                                      onClick={stateClick}
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
                          key={Math.random ()}
                          top={tooltipTop}
                          left={tooltipLeft}
                          style={{backgroundColor: 'black', color: 'white'}}
                          className="is-size-6"
                        >
                          <b>{stateNames[tooltipData.state_abbr]}</b>
                          <br />
                          <b>{intl.formatMessage ({id: 'tasa anualizada'})}:</b>
                          {' '}
                          {data[crime].find (
                              o => o.state_code === tooltipData.state_code
                            ).rate}
                          <br />
                          <b>{intl.formatMessage ({id: 'count'})}:</b>
                          {' '}
                          {
                            data[crime].find (
                              o => o.state_code === tooltipData.state_code
                            ).count
                          }
                          <br />
                          <b>{intl.formatMessage ({id: 'population'})}:</b>
                          {' '}
                          {comma (
                            data[crime].find (
                              o => o.state_code === tooltipData.state_code
                            ).population
                          )}
                        </TooltipWithBounds>}
                    </div>
                  </div>
                </React.Fragment>
              )}
            </ParentSize>
          : <div />}
      </div>
    </figure>
  );
}

export default MxHexTileMap;
