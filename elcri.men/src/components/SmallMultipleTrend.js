import React from 'react'
import { curveLinear as linear  } from 'd3-shape'
import { format as num_format} from 'd3-format'
import {timeFormat as date_format} from'd3-time-format'
import MetricsGraphics from 'react-metrics-graphics'
import 'metrics-graphics/dist/metricsgraphics.css'

import '../assets/css/trends.css'

class SmallMultipleTrend extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="col-3" style={{marginBottom: "15px"}}>
        <div style={{ width: '100%', borderRadius: "5px" }} className="line-chart" id={"line" + Object.keys(this.props.data)[0].replace(/ |\.|,/g, "")}>
          <MetricsGraphics
            title={Object.keys(this.props.data)[0]}
            //description="This graphic shows a time-series of downloads."
            data={this.props.formatData(this.props.data)}
            y_label={intl.formatMessage ({id: 'tasa anualizada'})}
            height={170}
            show_confidence_band= {["l", "u"]}
            colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}
            small_text={true}
            small_height_threshold={301}
            full_width={true}
            area={false}
            interpolate={ linear }
            xax_count={3}
            yax_count={3}
            y_extended_ticks={true}
            xax_format={date_format("%b")}
            yax_format={num_format(".0f")}
            x_accessor="date"
            y_accessor="value"
            center_title_full_width={true}
            min_y_from_data={true}
            left={53}
            buffer={0}
            top={40}
            bottom={40}
            active_point_on_lines={true}
            active_point_accessor="active"
            active_point_size={4}
          />
        </div>
      </div>
    )
  }
}

export default SmallMultipleTrend
