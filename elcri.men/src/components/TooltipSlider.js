import Slider from "rc-slider"
import Tooltip from "rc-tooltip"
import "rc-tooltip/assets/bootstrap.css"
import raf from "rc-util/lib/raf"
import * as React from "react"

const HandleTooltip = props => {
  const {
    value,
    children,
    visible,
    tipFormatter = val => `${val}`,
    ...restProps
  } = props

  const tooltipRef = React.useRef()
  const rafRef = React.useRef(null)

  function cancelKeepAlign() {
    raf.cancel(rafRef.current)
  }

  function keepAlign() {
    rafRef.current = raf(() => {
      tooltipRef.current?.forceAlign()
    })
  }

  React.useEffect(() => {
    if (visible) {
      keepAlign()
    } else {
      cancelKeepAlign()
    }

    return cancelKeepAlign
  }, [value, visible])

  return (
    <Tooltip
      placement="top"
      overlay={tipFormatter(value)}
      overlayInnerStyle={{ minHeight: "auto" }}
      ref={tooltipRef}
      visible={visible}
      {...restProps}
    >
      {children}
    </Tooltip>
  )
}

export const handleRender = (node, props) => (
  <HandleTooltip value={props.value} visible={props.dragging}>
    {node}
  </HandleTooltip>
)

const TooltipSlider = ({ tipFormatter, tipProps, ...props }) => {
  const tipHandleRender = (node, handleProps) => (
    <HandleTooltip
      value={handleProps.value}
      visible={handleProps.dragging}
      tipFormatter={tipFormatter}
      {...tipProps}
    >
      {node}
    </HandleTooltip>
  )

  return <Slider {...props} handleRender={tipHandleRender} />
}

export default TooltipSlider
