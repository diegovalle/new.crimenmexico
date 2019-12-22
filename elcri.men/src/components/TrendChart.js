import React from 'react'
import { curveLinear as linear } from 'd3-shape'
import { format as num_format } from 'd3-format'
import { timeFormat as date_format } from 'd3-time-format'
import MetricsGraphics from 'react-metrics-graphics'
import 'metrics-graphics/dist/metricsgraphics.css'
import SmallMultipleTrend from '../components/SmallMultipleTrend'

import '../assets/css/trends.css'

class TrendChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
    }
  }

  componentDidMount() {
    fetch('/elcrimen-json/states_trends.json')
      .then(response => response.json())
      .then(responseJSON => {
        this.setState({ data: responseJSON })
      })
      .catch(error => {
        console.error(error)
      })
  }

  formatData(data) {
    let state = Object.keys(data)[0]
    let len = data[state][0].length
    let state_tidy = [[], []]
    for (let i = 0; i < len; i++) {
      let d = new Date(2015, 0, 1)
      state_tidy[0].push({
        value: data[state][1][i],
        date: new Date(d.setMonth(d.getMonth() + i)),
        l: data[state][0][i],
        u: data[state][2][i],
        active: true,
      })
      state_tidy[1].push({
        value: data[state][3][i],
        date: new Date(d.setMonth(d.getMonth())),
        active: true,
      })
    }
    //for (var i = 0; i < state_tidy.length; i++) {
    //    state_tidy[i] = MG_convert_date(state_tidy[i], "date");
     // }
    return state_tidy
  }

  render() {
    return (
      <div className="grid-wrapper" id="small-multiples">
      
        {this.state.data ? (
          this.state.data.map((state, i) => (
            <SmallMultipleTrend data={state} key={i} formatData={this.formatData}/>
          ))
        ) : (
          <div></div>
        )}
      
      </div>
    )
  }
}

export default TrendChart
