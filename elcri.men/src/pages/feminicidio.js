import React, {useState, useEffect} from 'react';
import Helmet from 'react-helmet';

import Layout from '../components/layout';
import SmallMultiple from '../components/SmallMultiple';
import HeroTitlewithLegend from '../components/HeroTitlewithLegend';
import LegendLine from '../components/LegendLine';
import SEO from '../components/SEO';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage, FormattedDate} from 'react-intl';
import {
  groupBy,
  map,
  reduce,
  sortBy,
  filter,
  max,
  maxBy,
  flatten,
} from 'lodash-es';
import MG from 'metrics-graphics';
import TextColumn from '../components/TextColumn';

import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'

import {timeFormat as date_format} from 'd3-time-format';
import {format} from 'd3-format';
import {dateLoc} from '../../src/i18n';
import {timeFormatDefaultLocale} from 'd3-time-format';

import social_image from '../assets/images/social/social-feminicidio.png';
import social_image_en from '../assets/images/social/social-feminicidio_en.png';

function HomicidiosMujeres (props) {
  const [data, setdata] = useState (null);
  const [ordered_states, setordered_states] = useState (null);
  const [max_rate, setmax_rate] = useState (null);
  const [crime, setcrime] = useState ('hd');
  const [total, settotal] = useState (null);

  const round1 = format ('.1f');
  const comma = format (',');

  const maxRate = data => {
    let max_rate;
    if (data.length === 2) {
      max_rate = max ([
        maxBy (data[0], 'rate')['rate'],
        maxBy (data[1], 'rate')['rate'],
      ]);
    } else {
      max_rate = maxBy (flatten (data), 'rate')['rate'];
    }
    return max_rate;
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
    fetch ('/elcrimen-json/states_feminicide_sm.json')
      .then (response => response.json ())
      .then (responseJSON => {
        const ordered = orderStates (responseJSON[crime]);
        const max_rate2 = maxRate (responseJSON[crime]);
        setdata (responseJSON);
        setordered_states (ordered);
        setmax_rate (max_rate2);
      })
      .catch (error => {
        console.error (error);
      });
    fetch ('/elcrimen-json/states_feminicide_total.json')
      .then (response => response.json ())
      .then (responseJSON => {
        responseJSON[0] = MG.convert.date (responseJSON[0], 'date');
        settotal (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);
  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet
        link={[
          {
            rel: 'preload',
            href:
              '/static/source-sans-pro-v13-latin-regular.subset-6b67f4639bb02f388b7e72e34e180d7f.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        ]}
      />
      <SEO
        title={intl.formatMessage ({id: 'title_feminicidios'})}
        description={intl.formatMessage ({id: 'desc_feminicidios'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">

        <HeroTitlewithLegend
          legend1={
            <LegendLine class={'snsp'}>
              <FormattedHTMLMessage id="snsp-victims-no-line" />
            </LegendLine>
          }
        >
          {intl.formatMessage ({id: 'Feminicides'})}
        </HeroTitlewithLegend>

        <section>

          <div className="columns is-multiline" id="national-chart">
            <div className="column is-full">
              <figure className="image is-3by1 is-big-national">
                <div className=" has-ratio">
                  {total
                    ? <SmallMultiple
                        data={total}
                        key={'national'}
                        formatData={data => data}
                        y={'rate'}
                        title={intl.formatMessage ({
                          id: 'nacional',
                        })}
                        max_rate={maxRate (total)}
                        col_class="col-12"
                        height="350"
                        metrics={{
                          yax_format: format ('.1f'),
                          colors: ['#008085'],
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
                        backgroundClass="line-chart-blue"
                      />
                    : <div />}
                </div>
              </figure>
            </div>
          </div>
          <div className="columns is-multiline" id="small-multiples">
            {ordered_states
              ? ordered_states.map ((state, i) => (
                  <div className="column is-3" key={i}>
                    <figure className="image is-16by9" key={i}>
                      <div className=" has-ratio" key={i}>
                        <SmallMultiple
                          data={filterCrime (data[crime], state)}
                          key={i}
                          formatData={data => data}
                          y={'rate'}
                          title={state}
                          max_rate={max_rate}
                          metrics={{
                            colors: ['#008085'],
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

          <hr />

          <TextColumn>
            <FormattedHTMLMessage id="feminicides_text" />
          </TextColumn>
        </section>
      </div>
    </Layout>
  );
}

export default HomicidiosMujeres;
