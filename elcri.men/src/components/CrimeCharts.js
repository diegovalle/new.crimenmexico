import React, {useState, useEffect} from 'react';
import {curveLinear as linear} from 'd3-shape';
import {format as num_format} from 'd3-format';
import {timeFormat as date_format} from 'd3-time-format';
import {timeFormatDefaultLocale} from 'd3-time-format';
import MetricsGraphics from 'react-metrics-graphics';
import MG from 'metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';
import SmallMultiple from '../components/SmallMultiple';
import {useIntl, FormattedMessage} from 'react-intl';

import {filter} from 'lodash-es';
import {dateLoc} from '../../src/i18n';
import {format} from 'd3-format';

const round1 = format ('.1f');
const comma = format (',');

function CrimeChart (props) {
  const stateNames = {
    '0': 'National',
    '1': 'AGS',
    '2': 'BC',
    '3': 'BCS',
    '4': 'CAMP',
    '5': 'COAH',
    '6': 'COL',
    '7': 'CHPS',
    '8': 'CHIH',
    '9': 'CDMX',
    '10': 'DGO',
    '11': 'GTO',
    '12': 'GRO',
    '13': 'HGO',
    '14': 'JAL',
    '15': 'MEX',
    '16': 'MICH',
    '17': 'MOR',
    '18': 'NAY',
    '19': 'NL',
    '20': 'OAX',
    '21': 'PUE',
    '22': 'QTO',
    '23': 'QROO',
    '24': 'SLP',
    '25': 'SIN',
    '26': 'SON',
    '27': 'TAB',
    '28': 'TAM',
    '29': 'TLAX',
    '30': 'VER',
    '31': 'YUC',
    '32': 'ZAC',
  };
  const [data, setData] = useState (null);

  useEffect (() => {
    fetch ('/elcrimen-json/states2.json')
      .then (response => response.json ())
      .then (responseJSON => {
        var a = {
          ext: zipObject (responseJSON.ext),
          rvcv: zipObject (responseJSON.rvcv),
          rvsv: zipObject (responseJSON.rvsv),
          sec: zipObject (responseJSON.sec),
          hd: [zipObject (responseJSON.hd[0]), zipObject (responseJSON.hd[1])],
          national: {
            ext: zipObject (responseJSON.national.ext),
            rvcv: zipObject (responseJSON.national.rvcv),
            rvsv: zipObject (responseJSON.national.rvsv),
            sec: zipObject (responseJSON.national.sec),
            hd: [
              zipObject (responseJSON.national.hd[0]),
              zipObject (responseJSON.national.hd[1]),
            ],
          },
        };
        setData (a);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const zipObject = obj => {
    let result = new Array (obj.d.length);
    if ('s' in obj)
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          p: obj.p[i],
          s: obj.s[i],
        };
      }
    else
      for (let i = 0; i < obj.d.length; i++) {
        result[i] = {
          d: obj.d[i],
          r: obj.r[i],
          c: obj.c[i],
          p: obj.p[i],
        };
      }
    return result;
  };

  const singleChart = title => {
    if (!data) return <div />;
    let dataf, selected_state = props.selected_state;
    switch (title) {
      case intl.formatMessage ({id: 'Homicidio Intencional'}):
        if (selected_state === '0') dataf = data.national.hd;
        else
          dataf = [
            filter (data.hd[0], {s: parseInt (selected_state)}),
            filter (data.hd[1], {s: parseInt (selected_state)}),
          ];
        break;
      case intl.formatMessage ({id: 'Secuestro'}):
        if (selected_state === '0') dataf = data.national.sec;
        else dataf = filter (data.sec, {s: parseInt (selected_state)});
        break;
      case intl.formatMessage ({id: 'Extorsión'}):
        if (selected_state === '0') dataf = data.national.ext;
        else dataf = filter (data.ext, {s: parseInt (selected_state)});
        break;
      case intl.formatMessage ({id: 'Robo de Coche c/v'}):
        if (selected_state === '0') dataf = data.national.rvcv;
        else dataf = filter (data.rvcv, {s: parseInt (selected_state)});
        break;
      case intl.formatMessage ({id: 'Robo de Coche s/v'}):
        if (selected_state === '0') dataf = data.national.rvsv;
        else dataf = filter (data.rvsv, {s: parseInt (selected_state)});
        break;
      default:
        throw new Error ("Unknown crime. Don't know how to filter");
    }

    dataf = formatData (dataf);
    title =
      title +
      ' - ' +
      (stateNames[props.selected_state] === 'National'
        ? intl.formatMessage ({id: 'nacional'})
        : stateNames[props.selected_state]);
    return (
      <MetricsGraphics
        title={title}
        //description="This graphic shows a time-series of downloads."
        data={dataf}
        y_label={intl.formatMessage ({id: 'tasa anualizada'})}
        //height={200}
        small_text={true}
        small_height_threshold={301}
        full_width={true}
        full_height={true}
        area={false}
        interpolate={linear}
        xax_count={2}
        yax_count={3}
        xax_format={date_format ('%b %Y')}
        yax_format={
          title === 'Secuestro' ? num_format ('.1f') : num_format ('.0f')
        }
        x_accessor="d"
        y_accessor="r"
        min_y={0}
        y_extended_ticks={true}
        show_secondary_x_label={false}
        min_y_from_data={false}
        left={53}
        buffer={0}
        top={38}
        bottom={40}
        center_title_full_width={true}
        colors={['#008085', '#E81208']}
        y_mouseover={() => null}
        x_mouseover={function (d) {
          let date = new Date (d.d);
          let df = date_format ('%b %Y');
          return (
            df (d.d) +
            ', ' +
            intl.formatMessage ({id: 'count'}) +
            ': ' +
            comma (d.c) +
            ' ' +
            intl.formatMessage ({id: 'rate'}) +
            ': ' +
            round1 (d.r)
          );
        }}
      />
    );
  };

  const formatData = crimeData => {
    if (crimeData.length === 2) {
      if (!(crimeData[0][0].d instanceof Date)) {
        crimeData[0] = MG.convert.date (crimeData[0], 'd');
        crimeData[1] = MG.convert.date (crimeData[1], 'd');
      }
    } else {
      if (!(crimeData[0].d instanceof Date))
        crimeData = MG.convert.date (crimeData, 'd');
    }

    return crimeData;
  };
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <React.Fragment>
      <div className="columns">
        <div className="column is-full">
          <figure className="image is-3by1 is-3by1-mobile-16by9">
            <div
              id="nat_hd"
              className={
                props.selected_crime === 'hd'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart (intl.formatMessage ({id: 'Homicidio Intencional'}))}
            </div>
          </figure>
        </div>
      </div>

      <div className="columns">
        <div className="column is-half">
          <figure className="image is-16by9">
            <div
              id="nat_sec"
              className={
                props.selected_crime === 'sec'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart (intl.formatMessage ({id: 'Secuestro'}))}
            </div>
          </figure>
        </div>
        <div className="column is-half">
          <figure className="image is-16by9">
            <div
              id="nat_ext"
              className={
                props.selected_crime === 'ext'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart (intl.formatMessage ({id: 'Extorsión'}))}
            </div>
          </figure>
        </div>
      </div>
      <div className="columns">
        <div className="column is-half">
          <figure className="image is-16by9">
            <div
              id="nat_rvcv"
              className={
                props.selected_crime === 'rvcv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart (intl.formatMessage ({id: 'Robo de Coche c/v'}))}
            </div>
          </figure>
        </div>
        <div className="column is-half">
          <figure className="image is-16by9">
            <div
              id="nat_rvsv"
              className={
                props.selected_crime === 'rvsv'
                  ? 'line-chart-brown has-ratio'
                  : 'line-chart-blue has-ratio'
              }
            >
              {singleChart (intl.formatMessage ({id: 'Robo de Coche s/v'}))}
            </div>
          </figure>
        </div>

      </div>
    </React.Fragment>
  );
}

export default CrimeChart;
