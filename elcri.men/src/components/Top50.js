import React from 'react';
import {render} from 'react-dom';
import {Bar} from '@vx/shape';
import {Group} from '@vx/group';
import localPoint from '@vx/event/build/localPoint';
import {withTooltip, TooltipWithBounds} from '@vx/tooltip';
// note that withParentSize and withScreenSize HOCs are also available
import {ParentSize} from '@vx/responsive';
import {AxisLeft, AxisTop} from '@vx/axis';
import {GridColumns} from '@vx/grid';
import {scaleBand, scaleLinear, scaleOrdinal} from '@vx/scale';
import {maxBy} from 'lodash-es';
import {FormattedMessage} from 'react-intl';
import {format} from 'd3-format';
import '../assets/css/top50.css';

// accessors
const y0 = d => d.name;

var comma = format (',');
const margin = 25;

function splitter (str, l) {
  var strs = [];
  while (str.length > l) {
    var pos = str.substring (0, l).lastIndexOf (' ');
    pos = pos <= 0 ? l : pos;
    strs.push (str.substring (0, pos));
    var i = str.indexOf (' ', pos) + 1;
    if (i < pos || i > pos + l) i = pos;
    str = str.substring (i);
  }
  strs.push (str);
  return strs;
}

class Top50 extends React.Component {
  handleMouseOverBar = (event, datum) => {
    const coords = localPoint (event.target.ownerSVGElement, event);
    this.props.showTooltip ({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    });
  };

  render () {
    const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      hideTooltip,
    } = this.props;

    // scales
    const yScale = scaleBand ({
      domain: this.props.data.map (y0),
      rangeRound: [0, this.props.height - margin / 2],
      padding: 0,
    });
    const leftMargin = 83;

    return (
      <ParentSize>
        {({width, height}) => {
          const innerWidth = width - margin;
          const innerHeight = height - margin;
          const barHeight = Math.max (10, innerHeight / this.props.data.length);
          const topScale = scaleLinear ({
            domain: [0, maxBy (this.props.data, 'rate')['rate']],
            rangeRound: [0, innerWidth - leftMargin],
            nice: true,
            clamp: true,
          });

          return (
            <div style={{position: 'relative'}}>
              <React.Fragment>
                <svg width={width} height={this.props.height}>
                  <Group top={margin} left={leftMargin}>
                    {this.props.data.map ((d, i) => (
                      <Bar
                        key={i}
                        width={
                         topScale(d.rate)
                        }
                        height={yScale.bandwidth ()}
                        x={0}
                        y={i * yScale.bandwidth ()}
                        left={leftMargin}
                        stroke="#fff"
                        strokeWidth={2}
                        fill="#fc4e2a"
                        // note: all additional props are thunks called with the bar data
                        // thunks are expected to return the desired attribute value
                        onMouseMove={e => this.handleMouseOverBar (e, d)}
                        onMouseOut={hideTooltip}
                      />
                    ))}
                    <AxisLeft
                      scale={yScale}
                      stroke="#000000"
                      tickStroke="#000000"
                      // tickFormat={formatDate}
                      hideAxisLine
                      children={function (x) {
                        let words;
                        let ret = x.ticks.map ((d, i) => {
                          let strs = splitter (d.value, 12);
                          let len = strs.length;
                          let a = {
                            1: [0],
                            2: [-0.4, 1.1],
                            3: [-1.25, 1.1, 1.1],
                            4: [-1.35, 1, 1, 1],
                            5: [-1.65, 1, 1, 1, 1],
                          };
                          return (
                            <text
                              x="-8"
                              y={d.from.y}
                              key={d.value}
                              fill="black"
                              fontFamily="Roboto Condensed"
                              fontSize="11"
                              textAnchor="end"
                            >
                              {strs.map ((split, i) => (
                                <tspan
                                  key={d.value + split}
                                  x="-8"
                                  dy={a[len][i] + 'em'}
                                >
                                  {split}
                                </tspan>
                              ))}
                            </text>
                          );
                        });
                        return ret;
                      }}
                      left={0}
                      tickLabelProps={(value, index) => ({
                        dx: '-0.25em',
                        dy: '0.25em',
                        fill: 'black',
                        fontFamily: 'Roboto Condensed',
                        fontSize: 10,
                        textAnchor: 'end',
                      })}
                    />
                    <AxisTop
                      scale={topScale}
                      numTicks={4}
                      hideZero
                      top={0}
                      left={0}
                      label={'Close Price ($)'}
                      stroke={'#1b1a1e'}
                      tickTextFill={'#1b1a1e'}
                    />
                  </Group>
                  <GridColumns
                    top={margin}
                    left={leftMargin}
                    scale={topScale}
                    // yScale={scaleLinear({domain:[0]})}
                    stroke="rgb(204, 204, 204)"
                    width={width}
                    height={this.props.height}
                    // numTicksRows={0}
                    numTicks={3}
                  />
                </svg>

                {tooltipOpen &&
                  <TooltipWithBounds
                    // set this to random so it correctly updates with parent bounds
                    key={Math.random ()}
                    style={{backgroundColor: 'black', color: 'white'}}
                    top={tooltipTop}
                    left={tooltipLeft}
                    class=" is-size-6"
                  >
                    <b>{tooltipData.name}</b>
                        <br />
                        <b><FormattedMessage id='tasa anualizada' />:</b>
                        {' '}
                        {tooltipData.rate}
                        <br />
                        <b><FormattedMessage id='map_count' />:</b>
                        {' '}
                        {tooltipData.count}
                        <br />
                        <b><FormattedMessage id='population' />:</b>
                        {' '}
                        {comma(tooltipData.population)}
                  </TooltipWithBounds>}
              </React.Fragment>
            </div>
          );
        }}
      </ParentSize>
    );
  }
}

export default Top50;
