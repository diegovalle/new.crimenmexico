import React, {useState, useEffect} from 'react';
import Helmet from 'react-helmet';

import Layout from '../components/layout';
import SmallMultiple from '../components/SmallMultiple';
import HeroTitle from '../components/HeroTitle';
import SEO from '../components/SEO';
import TextColumn from '../components/TextColumn';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage, FormattedDate} from 'react-intl';
import useLastMonth from '../components/LastMonth';
import {
  groupBy,
  map,
  reduce,
  sortBy,
  filter,
  max,
  maxBy,
  mapValues,
  size,
} from 'lodash-es';
import MG from 'metrics-graphics';

import {format} from 'd3-format';
import {dateLoc} from '../../src/i18n';
import {timeFormatDefaultLocale, timeFormatLocale} from 'd3-time-format';
import {timeFormat as date_format} from 'd3-time-format';

import {graphql} from 'gatsby';
import MxAnomalyMapTooltip from '../components/MxAnomalyMapTooltip';

import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import social_image from '../assets/images/social/social-anomalias.png';
import social_image_en from '../assets/images/social/social-anomalias_en.png';

// export const query = graphql`
// query MyQuery {
//   allDataJson {
//     edges {
//       node {
//         last_month
//       }
//     }
//   }
// }
// `;

function Anomalies (props) {
  const [data, setdata] = useState (null);
  const [ordered_states, setordered_states] = useState (null);
  const [max_rate, setmax_rate] = useState (null);
  const [crime, setcrime] = useState ('hom');
  const [total, settotal] = useState (null);

  const round1 = format ('.1f');
  const comma = format (',');

  const handleSelect = e => {
    let ordered;
    const {value} = e.target;

    if (data[value].length === 2) {
      ordered = orderStates (data[value][0]);
    } else ordered = orderStates (data[value]);

    const max_rate2 = maxRate (data[value]);

    setcrime (value);
    setordered_states (ordered);
    setmax_rate (max_rate2);
  };

  const maxRate = data => {
    let max_rate;
    if (data.length === 2) {
      max_rate = max ([
        maxBy (data[0], 'rate')['rate'],
        maxBy (data[1], 'rate')['rate'],
      ]);
    } else {
      max_rate = maxBy (data, 'rate')['rate'];
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
    fetch ('/elcrimen-json/anomalies.json')
      .then (response => response.json ())
      .then (responseJSON => {
        responseJSON = mapValues (responseJSON, function (x) {
          return filter (x, function (o) {
            return typeof o.rate !== 'undefined';
          });
        });
        setdata (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const formatCrime = crime => {
    switch (crime) {
      case 'hom':
        return intl.formatMessage ({id: 'Homicidio Intencional'});
        break;
      case 'rvcv':
        return intl.formatMessage ({id: 'Robo de Coche c/v'});
        break;
      case 'rvsv':
        return intl.formatMessage ({id: 'Robo de Coche s/v'});
        break;
      case 'ext':
        return intl.formatMessage ({id: 'Extorsión'});
        break;
      case 'reos':
        return intl.formatMessage ({id: 'Fuga de Reos'});
        break;
      case 'lesions':
        return intl.formatMessage ({id: 'Lesiones'});
        break;
      case 'kidnapping':
        return intl.formatMessage ({id: 'Secuestro'});
        break;
    }
  };

  const tab = data => {
    return map (data, (muns, crime) => {
      if (muns.length) {
        return <Tab key={crime}>{formatCrime (crime)}</Tab>;
      }
    });
  };

  const tabPanel = data => {
    return map (data, (muns, crime) => {
      if (muns.length) {
        return (
          <TabPanel key={crime}>

            <div className="columns" style={{paddingTop: '1rem'}} key={crime}>

              <div className="column is-three-fourths" key={crime}>
                <div className="columns is-multiline" id="small-multiples" key={crime}>
                  {orderStates (data[crime]).map ((mun, i) => (
                    <div className="column is-half" key={i}>

                      <figure className="image is-2by1" key={i}>
                        <div className=" has-ratio" key={i}>
                          <SmallMultiple
                            data={filterCrime (data[crime], mun)}
                            key={i}
                            formatData={data => data}
                            y={'rate'}
                            title={mun}
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
                  ))}
                </div>
              </div>

              <div className="column is-one-fourth">
                <div>

                  <figure className="image is-square">
                    <div className=" has-ratio">
                      <MxAnomalyMapTooltip crime={crime} />
                    </div>
                  </figure>
                </div>
              </div>

            </div>

          </TabPanel>
        );
      }
    });
  };
  const intl = useIntl ();
  intl.locale === 'es' ? timeFormatDefaultLocale (dateLoc.es_MX) : null;
  const last_date = useLastMonth ();

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_anomalies'})}
        description={intl.formatMessage ({id: 'desc_anomalies'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">
        <HeroTitle>
          {intl.formatMessage ({
            id: 'All municipios with a crime rate spike or a sharp decrease during',
          })}
          {' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es
            : last_date.month_long_en}
          {' '}
          <FormattedDate value={new Date (last_date.iso_mid)} year="numeric" />
        </HeroTitle>

        <section id="anomaliesTabs">

          {data
            ? <Tabs defaultIndex={0}>
                <TabList>
                  {tab (data)}
                </TabList>

                {tabPanel (data)}
              </Tabs>
            : null}

        </section>
        <hr />
        <TextColumn>
          <FormattedHTMLMessage id="anomalies_text" />
        </TextColumn>

      </div>
    </Layout>
  );
}

export default Anomalies;
