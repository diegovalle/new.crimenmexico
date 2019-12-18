import React from 'react'
import PropTypes from 'prop-types'
import Top50 from '../components/Top50'

export const BarTooltipPropTypes = {
  tooltipOpen: PropTypes.bool,
  tooltipLeft: PropTypes.number,
  tooltipTop: PropTypes.number,
  tooltipData: PropTypes.object,
  updateTooltip: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
}

class BarToolTip extends React.Component {
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
      <div style={{height:" 100%"}}>
        <Top50
          updateTooltip={this.props.updateTooltip}
          showTooltip={this.showTooltip}
          hideTooltip={this.hideTooltip}
          {...this.state}
          {...this.props}
        />
      </div>
    )
  }
}
export default BarToolTip
