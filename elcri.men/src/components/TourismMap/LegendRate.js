import React from 'react'
import { format } from 'd3-format'
import { Legend, LegendLinear, LegendItem, LegendLabel } from '@vx/legend'
import { useIntl, FormattedMessage } from 'react-intl'

const noDecimal = format('.0f')
var round1 = format('.1f')
const commaNoDecimal = format(',.0f')

function LegendNumber(props) {
  const intl = useIntl()
  return (
    <LegendDemo title={intl.formatMessage({ id: 'homicide rate:' })}>
      <LegendLinear
        scale={props.scale}
        labelFormat={(d, i) => {
          return commaNoDecimal(d)
        }}
      >
        {(labels) => {
          return labels.map((label, i) => {
            const size = 15
            return (
              <LegendItem key={`legend-quantile-${i}`}>
                <svg width={size} height={size} style={{ margin: '2px 0' }}>
                  <rect fill={label.value} width={size} height={size} />
                </svg>
                <LegendLabel align={'left'} margin={'0 4px'}>
                  {label.text}
                </LegendLabel>
              </LegendItem>
            )
          })
        }}
      </LegendLinear>
    </LegendDemo>
  )
}

function LegendDemo({ title, children }) {
  return (
    <div className="legend">
      {/* <h5 className="title  is-5">{title}</h5> */}
      <span className="is-size-6">{title}</span>
      <div style={{ display: 'flex', flexDirection: 'row' }}>{children}</div>
    </div>
  )
}

export default LegendNumber
