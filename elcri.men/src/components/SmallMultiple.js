import React from 'react';
import {curveLinear as linear} from 'd3-shape';
import {format as num_format} from 'd3-format';
import {timeFormat as date_format} from 'd3-time-format';
import {timeFormatDefaultLocale} from 'd3-time-format';
import LazyLoad from 'react-lazyload';
import MetricsGraphics from 'react-metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';

import '../assets/css/trends.css';
import {useIntl} from 'react-intl';
import {dateLoc} from '../../src/i18n'

function SmallMultiple (props) {
  const {
    min_y = 0,
    col_class = 'col-3',
    height = 170,
    backgroundClass = 'line-chart-brown',
    ...restProps
  } = props;
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <div className={col_class} style={{marginBottom: '15px', height:"100%"}}>
      <div
        style={{borderRadius: '5px', height: "100%"}}
        className={backgroundClass || 'line-chart-brown'}
      >
        <LazyLoad height={height} once offset={200}>
          <MetricsGraphics
            title={props.title}
            // description="This graphic shows a time-series of downloads."
            data={props.formatData (props.data)}
            y_label={intl.formatMessage ({id: 'tasa anualizada'})}
            //height={height}
            show_confidence_band={['l', 'u']}
            // colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}
            small_text
            small_height_threshold={301}
            full_width
            full_height
            area={false}
            interpolate={linear}
            xax_count={3}
            yax_count={3}
            y_extended_ticks
            xax_format={date_format ('%b')}
            yax_format={num_format ('.0f')}
            max_y={props.max_rate}
            min_y={props.min_y}
            x_accessor="date"
            y_accessor={props.y}
            center_title_full_width
            left={53}
            buffer={0}
            top={40}
            bottom={40}
            active_point_on_lines
            active_point_accessor="active"
            active_point_size={4}
            //colors={['#00BFC4', '#F8766D']}
            {...props.metrics}
          />
        </LazyLoad>
      </div>
    </div>
  );
}

export default SmallMultiple;
