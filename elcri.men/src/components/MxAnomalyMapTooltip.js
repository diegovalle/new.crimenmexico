import React from 'react'
import PropTypes from 'prop-types'
import MxAnomalyMap from '../components/MxAnomalyMap'

export const withTooltipPropTypes = {
  tooltipOpen: PropTypes.bool,
  tooltipLeft: PropTypes.number,
  tooltipTop: PropTypes.number,
  tooltipData: PropTypes.object,
  updateTooltip: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
}

class MxAnomalyTooltip extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tooltipOpen: false,
      tooltipLeft: undefined,
      tooltipTop: undefined,
      tooltipData: undefined,
    }
    this.updateTooltip = this.updateTooltip.bind(this)
    this.showTooltip = this.showTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
  }
  updateTooltip({ tooltipOpen, tooltipLeft, tooltipTop, tooltipData }) {
    this.setState(prevState => ({
      ...prevState,
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
    }))
  }
  showTooltip({ tooltipLeft, tooltipTop, tooltipData }) {
    this.updateTooltip({
      tooltipOpen: true,
      tooltipLeft,
      tooltipTop,
      tooltipData,
    })
  }
  hideTooltip() {
    this.updateTooltip({
      tooltipOpen: false,
      tooltipLeft: undefined,
      tooltipTop: undefined,
      tooltipData: undefined,
    })
  }
  render() {
    return (
      <div style={{height: "100%"}}>
        <MxAnomalyMap
          height={500}
          selected_state={this.props.selected_state}
          updateState={this.props.updateState}
          selected_crime={this.props.selected_crime}
          updateCrime={this.props.updateCrime}
          updateTooltip={this.props.updateTooltip}
          showTooltip={this.showTooltip}
          hideTooltip={this.hideTooltip}
          crime={this.props.crime}
          {...this.state}
          {...this.props}
        />
      </div>
    )
  }
}
export default MxAnomalyTooltip
