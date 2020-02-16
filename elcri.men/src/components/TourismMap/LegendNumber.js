import React from 'react';
import {format} from 'd3-format';
import {Legend, LegendSize, LegendItem, LegendLabel} from '@vx/legend';
import {useIntl, FormattedMessage} from 'react-intl';

const noDecimal = format ('.0f');
var round1 = format ('.1f');
const commaNoDecimal = format (',.0f');

function LegendNumber (props) {

  const intl = useIntl ();
  return (
    <LegendDemo title={intl.formatMessage ({id: "number of homicides:"})}>
      <LegendSize scale={props.scale}>
        {labels => {
          return labels.map (label => {
            const size = props.scale (label.datum);
            const color = 'black';
            return (
              <LegendItem
                key={`legend-${label.text}-${label.index}`}
                onClick={event => {
                  alert (`clicked: ${JSON.stringify (label)}`);
                }}
              >
                <svg width={size} height={size} style={{margin: '5px 0'}}>
                  <circle
                    fill={color}
                    r={size / 2}
                    cx={size / 2}
                    cy={size / 2}
                  />
                </svg>
                <LegendLabel align={'left'} margin={'0 4px'}>
                  {commaNoDecimal (label.text)}
                </LegendLabel>
              </LegendItem>
            );
          });
        }}
      </LegendSize>
    </LegendDemo>
  );
}

function LegendDemo({title, children}) {
  return (
    <div className="legend">
      {/* <h5 className="title  is-5">{title}</h5> */}
      <span className="is-size-6">{title}</span>
      <div style={{display: 'flex', flexDirection: 'row'}}>

        {children}
      </div>
    </div>
  );
}

export default LegendNumber;
