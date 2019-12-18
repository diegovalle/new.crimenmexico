import React, {useState, useEffect} from 'react';
import {useStaticQuery, graphql} from 'gatsby';
import ReactDOM from 'react-dom';
import {curveLinear as linear} from 'd3-shape';
import {format as num_format} from 'd3-format';
import {timeFormatDefaultLocale} from 'd3-time-format';
import {timeFormat as date_format} from 'd3-time-format';
import MetricsGraphics from 'react-metrics-graphics';
import MG from 'metrics-graphics';
import {FormattedHTMLMessage, FormattedDate} from 'react-intl';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {format} from 'd3-format';

import {dateLoc} from '../../src/i18n'

function HistoricalChart (props) {
  const preliminary = useStaticQuery (graphql`
    query HistoricalChartQuery {
      site {
        siteMetadata {
          preliminaryINEGI
        }
      }
    }
  `);

  const [data, setData] = useState (null);
  const [state, setState] = useState ('national');
  const round1 = format ('.1f');
  const comma = format (',');

  useEffect (() => {
    fetch ('/elcrimen-json/national_1990.json')
      .then (response => response.json ())
      .then (responseJSON => {
        setData (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const formatData = data => {
    // This is needed to show preliminary INEGI data as a dotted line
    let data2;

    if (!(data[state][0][0].d instanceof Date)) {
      data2 = [
        MG.convert.date (data[state][0], 'd'),
        MG.convert.date (data[state][1], 'd'),
      ];
    } else {
      data2 = [data[state][0], data[state][1]];
    }
    if (preliminary.site.siteMetadata.preliminaryINEGI)
      data2 = [
        data2[0],
        data2[1].slice (0, data2[1].length - 12),
        data2[1].slice (data2[1].length - 13, data2[1].length),
      ];
    return data2;
  };

  const mouseOver = (d, i) => {
    //var date = new Date(d.d)
    //var day = d.d.getDate()
    //var monthIndex = d.d.getMonth()
    var year = d.d.getFullYear ();
    //console.log(d)
    const element = <span dangerouslySetInnerHTML={{__html: year + ' aaaa'}} />;
    ReactDOM.render (element, document.getElementById ('national-caption'));
  };

  const handleSelect = e => {
    const {value} = e.target;
    setState (value);
  };
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;
  return (
    <div className="columns is-multiline" id="national90">
      <div className="column is-half">
        <div className="select-style is-pulled-right	">
          <select
            id="state_select"
            onChange={handleSelect}
            aria-label="Select State"
          >
            <option value="national">
              {intl.formatMessage ({id: 'All of Mexico'})}
            </option>
            <option value="1">Aguascalientes</option>
            <option value="2">Baja California</option>
            <option value="3">Baja California Sur</option>
            <option value="4">Campeche</option>
            <option value="5">Coahuila</option>
            <option value="6">Colima</option>
            <option value="7">Chiapas</option>
            <option value="8">Chihuahua</option>
            <option value="9">Ciudad de México</option>
            <option value="10">Durango</option>
            <option value="11">Guanajuato</option>
            <option value="12">Guerrero</option>
            <option value="13">Hidalgo</option>
            <option value="14">Jalisco</option>
            <option value="15">México</option>
            <option value="16">Michoacán</option>
            <option value="17">Morelos</option>
            <option value="18">Nayarit</option>
            <option value="19">Nuevo León</option>
            <option value="20">Oaxaca</option>
            <option value="21">Puebla</option>
            <option value="22">Querétaro</option>
            <option value="23">Quintana Roo</option>
            <option value="24">San Luis Potosí</option>
            <option value="25">Sinaloa</option>
            <option value="26">Sonora</option>
            <option value="27">Tabasco</option>
            <option value="28">Tamaulipas</option>
            <option value="29">Tlaxcala</option>
            <option value="30">Veracruz</option>
            <option value="31">Yucatán</option>
            <option value="32">Zacatecas</option>
          </select>
        </div>
      </div>
      <div className="column is-half">
        <p style={{lineHeight: '1.2rem'}}>
          <FormattedHTMLMessage id="inegi-legend" />
          <br />
          <FormattedHTMLMessage id="snsp-victims" />
        </p>
      </div>

      <div className="column is-full">
        <a name="historical" id="historical" />
        <div id="national90">
          <figure class="image is-2by1 is-historical">
            <div className="has-ratio">
              {data
                ? <MetricsGraphics
                    title={intl.formatMessage ({
                      id: 'Datos Históricos de Homicidio',
                    })}
                    //description="This graphic shows a time-series of downloads."
                    data={formatData (data)}
                    y_label={intl.formatMessage ({
                      id: 'tasa anualizada',
                    })}
                    //height={400}
                    small_text={true}
                    small_height_threshold={301}
                    full_width={true}
                    full_height={true}
                    area={false}
                    interpolate={linear}
                    xax_count={3}
                    yax_count={3}
                    xax_format={date_format ('%b %Y')}
                    yax_format={num_format ('.0f')}
                    x_accessor="d"
                    y_accessor="r"
                    y_extended_ticks={true}
                    show_secondary_x_label={false}
                    //center_title_full_width={true}
                    min_y_from_data={false}
                    left={53}
                    buffer={0}
                    top={40}
                    bottom={40}
                    colors={['#008085', '#b35806']}
                    center_title_full_width={true}
                    //y_mouseover={' - %d,'}
                    //x_mouseover={'%b %Y - '}
                    //aggregate_rollover={true}
                    //show_rollover_text={false}
                    //mouseover={this.mouseOver}
                    y_mouseover={function (d) {
                      return '';
                    }}
                    x_mouseover={function (d) {
                      let date = new Date (d.d);
                      let df = date_format ('%b %Y');
                      return (
                        df (d.d) + ', ' +
                        intl.formatMessage ({id: 'population'}) + ': ' +
                        comma (d.p) + ' ' +
                        intl.formatMessage ({id: 'count'}) + ': ' +
                        comma (d.c) + ' ' +
                        intl.formatMessage ({id: 'rate'}) + ': ' +
                        round1 (d.r)
                      );
                    }}
                  />
                : <div />}
            </div>
          </figure>
        </div>

        {preliminary.site.siteMetadata.preliminaryINEGI
          ? <p>
              Las cifras correspondientes a los homicidios INEGI de los últimos 12 meses son de carácter preliminar y muy probablemente presentan un subregistro.
            </p>
          : null}
      </div>
    </div>
  );
}

export default HistoricalChart;
