import React, {useState, useEffect} from 'react';
import {curveLinear as linear} from 'd3-shape';
import {format as num_format} from 'd3-format';
import {
  timeFormat as date_format,
  timeFormatDefaultLocale,
} from 'd3-time-format';
import MetricsGraphics from 'react-metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';
import SmallMultipleTrend from '../components/SmallMultipleTrend';
import {cloneDeepWith} from 'lodash-es';

import {selection, select as d3Select} from 'd3-selection';
import 'd3-transition';
import '../assets/css/trends.css';
import {useIntl} from 'react-intl';
import {dateLoc} from '../../src/i18n';

function TendenciaNacional (props) {
  const [data, setData] = useState (null);

  useEffect (() => {
    fetch ('/elcrimen-json/national_diff.json')
      .then (response => response.json ())
      .then (responseJSON => {
        setData (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const formatData = data => {
    if (typeof data[0].date !== 'object') data = MG.convert.date (data, 'date');
    let diffs = cloneDeepWith (data);
    let gam = cloneDeepWith (data);
    let zero = cloneDeepWith (data);
    diffs.forEach (function (d) {
      d['value'] = d['diff'];
    });
    gam.forEach (function (d) {
      d['value'] = d['gam'];
    });
    zero.forEach (function (d) {
      d['value'] = 0;
    });
    return [diffs, gam, zero];
  };

  const trbody = data => {
    let df = date_format ('%B %Y');
    let a = Object.keys (data).map (function (key, index) {
      let date = new Date (data[key].date);
      return (
        <tr>
          <td>
            {df (data[key].date) +
              ' - ' +
              date_format ('%B ') (data[key].date) +
              (parseInt (date_format ('%Y') (data[key].date)) - 1)}
          </td>
          <td>{data[key].diff}</td>
          <td>{data[key].diff_count}</td>
        </tr>
      );
    });
    return a;
  };
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <div className="columns">
      <div className="column is-full">
        <figure class="image is-3by1 is-big-national">
          <div className=" has-ratio" id="tendencias">
            {data
              ? <MetricsGraphics
                  title={intl.formatMessage ({
                    id: 'nacional',
                  })}
                  //description="This graphic shows a time-series of downloads."
                  data={formatData (data)}
                  y_label={intl.formatMessage ({
                    id: 'diferencia en tasa',
                  })}
                  //height={170}
                  //show_confidence_band= {["l", "u"]}
                  //colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}
                  small_text={true}
                  small_height_threshold={301}
                  full_width={true}
                  full_height={true}
                  area={false}
                  interpolate={linear}
                  xax_count={3}
                  yax_count={3}
                  y_extended_ticks={true}
                  xax_format={date_format ('%b')}
                  yax_format={num_format ('.0f')}
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
                  x_mouseover={function (d) {
                    let date = new Date (d.date);
                    let df = date_format ('%b %Y');
                    return (
                      df (d.date) +
                      ' - ' +
                      date_format ('%b ') (d.date) +
                      (parseInt (date_format ('%Y') (d.date)) - 1) +
                      ': ' +
                      intl.formatMessage ({id: 'rate_diff'}) +
                      ': ' +
                      d.diff +
                      ', ' +
                      intl.formatMessage ({id: 'count_diff'}) +
                      ': ' +
                      d.diff_count
                    );
                  }}
                  y_mouseover={() => null}
                />
              : null}

          </div>
        </figure>
        <hr />
        <div class="columns is-centered">
          <div class="column is-6">
            <div class="table-container">
              <table className="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>
                      {intl.formatMessage ({
                        id: 'Date',
                      })}
                    </th>
                    <th>
                      {intl.formatMessage ({
                        id: 'trate',
                      })}
                    </th>
                    <th>
                      {intl.formatMessage ({
                        id: 'tcount',
                      })}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data ? trbody (data) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default TendenciaNacional;
