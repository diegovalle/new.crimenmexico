import React, {useState, useEffect} from 'react';
import Helmet from 'react-helmet';

import Layout from '../components/layout';
import SmallMultiple from '../components/SmallMultiple';
import HeroTitlewithLegend from '../components/HeroTitlewithLegend';
import LegendLine from '../components/LegendLine';
import {groupBy, map, reduce, sortBy, filter, max, maxBy} from 'lodash-es';
import MG from 'metrics-graphics';
import SEO from '../components/SEO';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage, FormattedDate} from 'react-intl';
import {timeFormat as date_format} from 'd3-time-format';
import {format} from 'd3-format';
import {dateLoc} from '../../src/i18n';
import {timeFormatDefaultLocale, timeFormatLocale} from 'd3-time-format';

import social_image from '../assets/images/social/social-estados.png';
import social_image_en from '../assets/images/social/social-estados_en.png';

function Estados (props) {
  const [data, setdata] = useState (null);
  const [colors, setcolors] = useState (['#00BFC4', '#F8766D']);
  const [ordered_states, setordered_states] = useState (null);
  const [max_rate, setmax_rate] = useState (() => null);
  const [crime, setcrime] = useState ('hd');

  const round1 = format ('.1f');
  const comma = format (',');

  const maxRate = data => {
    let max_rate2;
    if (data.length === 2) {
      max_rate2 = max ([
        maxBy (data[0], 'rate')['rate'],
        maxBy (data[1], 'rate')['rate'],
      ]);
    } else {
      max_rate2 = maxBy (data, 'rate')['rate'];
    }
    return max_rate2;
  };

  const orderStates = data => {
    const groups = groupBy (data, function (x) {
      return x.name;
    });
    const byrate = map (groups, function (g, key) {
      return {
        name: key,
        rate: reduce (
          g,
          function (m, x) {
            return x.rate === null ? m : x.rate;
          },
          0
        ),
      };
    });
    const ordered = map (sortBy (byrate, 'rate'), 'name').reverse ();
    return ordered;
  };

  const filterCrime = (data, name) => {
    if (data.length === 2) {
      data = [filter (data[0], {name: name}), filter (data[1], {name: name})];
      if (typeof data[0][0].date !== 'object') {
        data[0] = MG.convert.date (data[0], 'date');
        data[1] = MG.convert.date (data[1], 'date');
      }
    } else {
      data = filter (data, {name: name});
      if (typeof data[0].date !== 'object')
        data = MG.convert.date (data, 'date');
    }

    return data;
  };

  useEffect (() => {
    fetch ('/elcrimen-json/states_sm.json')
      .then (response => response.json ())
      .then (responseJSON => {
        const ordered = orderStates (responseJSON[crime][0]);
        const max_rate2 = maxRate (responseJSON[crime]);

        setdata (responseJSON);
        setordered_states (ordered);
        setmax_rate (max_rate2);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const handleSelect = e => {
    let ordered, colors;
    const {value} = e.target;

    if (data[value].length === 2) {
      ordered = orderStates (data[value][0]);
      colors = ['#00BFC4', '#F8766D'];
    } else {
      ordered = orderStates (data[value]);
      colors = ['#00BFC4', 'transparent'];
    }

    const max_rate2 = maxRate (data[value]);

    setcrime (value);
    setordered_states (ordered);
    setmax_rate (max_rate2);
    setcolors (colors);
  };
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_estados'})}
        description={intl.formatMessage ({id: 'desc_estados'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">

        <HeroTitlewithLegend
          legend1={
            <LegendLine class={'inegi-adjusted'}>
              <FormattedHTMLMessage id="inegi-adjusted-no-line" />
            </LegendLine>
          }
          legend2={
            <LegendLine class={'snsp'}>
              <FormattedHTMLMessage id="snsp-victims-no-line" />
            </LegendLine>
          }
        >
          {intl.formatMessage ({id: 'Crime by State'})}
        </HeroTitlewithLegend>

        <section id="estados">
          <div style={{textAlign: 'center'}}>
            <div
              className="select"
              style={{margin: '0 auto', marginBottom: '3em'}}
            >
              <select
                id="crimeSelect"
                onChange={handleSelect}
                aria-label="Select Crime"
                class="is-hovered"
              >
                <option value="hd">
                  {intl.formatMessage ({id: 'Homicidio Intencional'})}
                </option>
                <option value="sec">
                  {intl.formatMessage ({id: 'Secuestro'})}
                </option>
                <option value="ext">
                  {intl.formatMessage ({id: 'Extorsión'})}
                </option>
                <option value="rvcv">
                  {intl.formatMessage ({
                    id: 'Robo de Coches con Violencia',
                  })}
                </option>
                <option value="rvsv">
                  {intl.formatMessage ({
                    id: 'Robo de Coches sin Violencia',
                  })}
                </option>
              </select>
            </div>
          </div>

          <div className="columns is-multiline" id="small-multiples">
            {ordered_states
              ? ordered_states.map ((state, i) => (
                  <div className="column is-3">
                    <figure class="image is-16by9">
                      <div className=" has-ratio">
                        <SmallMultiple
                          data={filterCrime (data[crime], state)}
                          key={i}
                          formatData={data => data}
                          y={'rate'}
                          title={state}
                          max_rate={max_rate}
                          metrics={{
                            x_mouseover: function (d) {
                              let date = new Date (d.date);
                              let df = date_format ('%b %Y');
                              return (
                                df (d.date) +
                                ', ' +
                                intl.formatMessage ({id: 'num'}) +
                                ': ' +
                                comma (d.count) +
                                ' ' +
                                intl.formatMessage ({id: 'rate'}) +
                                ': ' +
                                round1 (d.rate)
                              );
                            },
                            y_mouseover: () => null,
                          }}
                        />
                      </div>
                    </figure>
                  </div>
                ))
              : <div />}
          </div>
        </section>

        <hr />

        <section id="about">
          <div className="columns">
            <div className="column is-offset-3 is-half-desktop is-two-third-fullhd">
              <div className="content is-medium">
                <FormattedHTMLMessage id="estados_text" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Estados;
