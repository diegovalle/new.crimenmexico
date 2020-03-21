import React from 'react';
import Helmet from 'react-helmet';

import {curveLinear as linear} from 'd3-shape';
import {format as num_format} from 'd3-format';
import Layout from '../components/layout';
import SmallMultiple from '../components/SmallMultiple';
import HeroTitlewithLegend from '../components/HeroTitlewithLegend';
import LegendLine from '../components/LegendLine';
import {flatten, maxBy} from 'lodash-es';
import MG from 'metrics-graphics';
import MetricsGraphics from 'react-metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';
import SEO from '../components/SEO';
import TextColumn from '../components/TextColumn';
import {useIntl, FormattedHTMLMessage} from 'react-intl';

import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'

import social_image from '../assets/images/social/social-envipe.png';
import social_image_en from '../assets/images/social/social-envipe_en.png';

var lesiones_data = [
  [
    {date: 2015, value: 1072610, sup: 1169170, inf: 976050},
    {date: 2016, value: 968451, sup: 1073862, inf: 863040},
    {date: 2017, value: 1004432, sup: 1004432 + 53448, inf: 1004432 - 53448},
    {
      date: 2018,
      value: 1032059,
      sup: 1032059 + 78700.1618011502,
      inf: 1032059 - 78700.1618011502,
    },
  ],
  [
    {date: 2015, value: 150711},
    {date: 2016, value: 148391},
    {date: 2017, value: 165092},
    {date: 2018, value: 158569},
    {date: 2019, value: 170216}
  ],
];
var secuestro_data = [
  [
    {date: 2015, value: 62636, sup: 77530, inf: 47742},
    {date: 2016, value: 66842, sup: 81522, inf: 52162},
    {date: 2017, value: 80319, sup: 80319 * 1.21, inf: 80319 * 0.79},
    {date: 2018, value: 79315, sup: 92998, inf: 65632},
  ],
  [
    {date: 2015, value: 1310},
    {date: 2016, value: 1381},
    {date: 2017, value: 1390},
    {date: 2018, value: 1559},
    {date: 2019, value: 1614},
  ],
];
var extorsion_data = [
  [
    {date: 2015, value: 7100878, sup: 7377798, inf: 6823958},
    {date: 2016, value: 7503477, sup: 7787836, inf: 7219118},
    {date: 2017, value: 6590728, sup: 6590728 + 182555, inf: 6590728 - 182555},
    {date: 2018, value: 5716346, sup: 5716346 + 155019, inf: 5716346 - 155019},
  ],
  [
    {date: 2015, value: 5277},
    {date: 2016, value: 5395},
    {date: 2017, value: 5947},
    {date: 2018, value: 6606},
    {date: 2019, value: 8523}
  ],
];
//Robo total de vehículo (automóvil, camioneta, camión).
var robocoche_data = [
  [
    {date: 2015, value: 452001, sup: 486110, inf: 417893},
    {date: 2016, value: 493727, sup: 527885, inf: 459570},
    {date: 2017, value: 626088, sup: 626088 + 23985, inf: 626088 - 23985},
    {
      date: 2018,
      value: 605817,
      sup: 605817 + 23245.2550962169,
      inf: 605817 - 23245.2550962169,
    },
  ],
  [
    {date: 2015, value: 145734},
    {date: 2016, value: 153437},
    {date: 2017, value: 179709},
    {date: 2018, value: 178935},
    {date: 2019, value: 150306}
  ],
  [
    {date: 2015, value: 63044},
    {date: 2016, value: 80542},
    {date: 2017, value: 93168},
    {date: 2018, value: 91559},
  ],
];

function Envipe (props) {
  const intl = useIntl ();
  const comma = num_format (',.0f');
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_envipe'})}
        description={intl.formatMessage ({id: 'desc_envipe'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">

        <HeroTitlewithLegend
          legend1={<LegendLine class={'envipe'}>ENVIPE</LegendLine>}
          legend2={
            <LegendLine class={'snsp'}>
              {intl.formatMessage ({id: 'SESNSP victims/cars'})}
            </LegendLine>
          }
          legend3={
            <LegendLine class={'amis'}>
              {intl.formatMessage ({id: 'AMIS insured cars'})}
            </LegendLine>
          }
        >
          {intl.formatMessage ({id: 'Underreporting crime'})}
        </HeroTitlewithLegend>

        <section>
          <div className="columns is-multiline" id="small-multiples">
            <div className="column is-half">
              <div className="line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <MetricsGraphics
                      title={intl.formatMessage ({id: 'Car Robbery'})}
                      // description="This graphic shows a time-series of downloads."
                      data={robocoche_data}
                      y_label="crimes"
                      show_confidence_band={['inf', 'sup']}
                      full_width={true}
                      full_height={true}
                      area={false}
                      interpolate={linear}
                      xax_count={3}
                      y_extended_ticks={false}
                      yax_count={3}
                      xax_format={num_format ('.0f')}
                      max_y={maxBy (flatten (robocoche_data), 'sup')['sup']}
                      x_accessor="date"
                      y_accessor="value"
                      show_tooltips={true}
                      left={53}
                      buffer={0}
                      top={40}
                      bottom={40}
                      min_y={0}
                      height={350}
                      colors={['#c51b7d', '#008085', '#d95f02']}
                      x_mouseover={function (d) {
                        return (
                          d.date +
                          ': ' +
                          intl.formatMessage ({id: 'Car Robbery'}) +
                          ': ' +
                          comma (d.value) +
                          ' ' +
                          (typeof d.inf !== 'undefined'
                            ? intl.formatMessage ({id: 'superior'}) +
                                ': ' +
                                comma (d.sup) +
                                ' ' +
                                intl.formatMessage ({id: 'inferior'}) +
                                ': ' +
                                comma (d.inf)
                            : '')
                        );
                      }}
                      y_mouseover={() => null}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <MetricsGraphics
                      title={intl.formatMessage ({id: 'Lesiones'})}
                      // description="This graphic shows a time-series of downloads."
                      full_width={true}
                      data={lesiones_data}
                      y_label={intl.formatMessage ({id: 'crimes'})}
                      show_confidence_band={['inf', 'sup']}
                      area={false}
                      interpolate={linear}
                      xax_count={3}
                      y_extended_ticks={false}
                      yax_count={3}
                      xax_format={num_format ('.0f')}
                      x_accessor="date"
                      y_accessor="value"
                      max_y={maxBy (flatten (lesiones_data), 'sup')['sup']}
                      left={53}
                      buffer={0}
                      top={40}
                      bottom={40}
                      min_y={0}
                      height={350}
                      colors={['#c51b7d', '#008085']}
                      x_mouseover={function (d) {
                        return (
                          d.date +
                          ': ' +
                          intl.formatMessage ({id: 'Lesiones'}) +
                          ': ' +
                          comma (d.value) +
                          ' ' +
                          (typeof d.inf !== 'undefined'
                            ? intl.formatMessage ({id: 'superior'}) +
                                ': ' +
                                comma (d.sup) +
                                ' ' +
                                intl.formatMessage ({id: 'inferior'}) +
                                ': ' +
                                comma (d.inf)
                            : '')
                        );
                      }}
                      y_mouseover={() => null}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <MetricsGraphics
                      title={intl.formatMessage ({id: 'Extorsión'})}
                      // description="This graphic shows a time-series of downloads."
                      data={extorsion_data}
                      y_label="crimes"
                      show_confidence_band={['inf', 'sup']}
                      // colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}
                      // small_text={true}
                      // small_height_threshold={301}
                      full_width={true}
                      area={false}
                      interpolate={linear}
                      xax_count={3}
                      y_extended_ticks={false}
                      yax_count={3}
                      xax_format={num_format ('.0f')}
                      data={extorsion_data}
                      max_y={maxBy (flatten (extorsion_data), 'sup')['sup']}
                      x_accessor="date"
                      y_accessor="value"
                      left={53}
                      buffer={0}
                      top={40}
                      bottom={40}
                      min_y={0}
                      height={350}
                      colors={['#c51b7d', '#008085']}
                      x_mouseover={function (d) {
                        return (
                          d.date +
                          ': ' +
                          intl.formatMessage ({id: 'Extorsión'}) +
                          ': ' +
                          comma (d.value) +
                          ' ' +
                          (typeof d.inf !== 'undefined'
                            ? intl.formatMessage ({id: 'superior'}) +
                                ': ' +
                                comma (d.sup) +
                                ' ' +
                                intl.formatMessage ({id: 'inferior'}) +
                                ': ' +
                                comma (d.inf)
                            : '')
                        );
                      }}
                      y_mouseover={() => null}
                    />
                  </div>
                </figure>
              </div>
            </div>
            <div className="column is-half">
              <div className=" line-chart-brown">
                <figure className="image is-16by9">
                  <div className=" has-ratio">
                    <MetricsGraphics
                      title={intl.formatMessage ({id: 'Secuestro'})}
                      // description="This graphic shows a time-series of downloads."
                      data={secuestro_data}
                      y_label="crimes"
                      show_confidence_band={['inf', 'sup']}
                      // colors={[this.props.data.trend[0] === "positive" ? "#e41a1c" : this.props.data.trend[0] === "negative" ? "#377eb8" : "#e5d8bd", "#888888"]}
                      // small_text={true}
                      // small_height_threshold={301}
                      full_width={true}
                      area={false}
                      interpolate={linear}
                      xax_count={3}
                      y_extended_ticks={false}
                      yax_count={3}
                      xax_format={num_format ('.0f')}
                      max_y={maxBy (flatten (secuestro_data), 'sup')['sup']}
                      x_accessor="date"
                      y_accessor="value"
                      left={53}
                      buffer={0}
                      top={40}
                      bottom={40}
                      min_y={0}
                      height={350}
                      colors={['#c51b7d', '#008085']}
                      x_mouseover={function (d) {
                        return (
                          d.date +
                          ': ' +
                          intl.formatMessage ({id: 'Secuestro'}) +
                          ': ' +
                          comma (d.value) +
                          ' ' +
                          (typeof d.inf !== 'undefined'
                            ? intl.formatMessage ({id: 'superior'}) +
                                ': ' +
                                comma (d.sup) +
                                ' ' +
                                intl.formatMessage ({id: 'inferior'}) +
                                ': ' +
                                comma (d.inf)
                            : '')
                        );
                      }}
                      y_mouseover={() => null}
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </section>
        <hr />
        <TextColumn>
          <FormattedHTMLMessage id="envipe_text" />
        </TextColumn>
      </div>
    </Layout>
  );
}

export default Envipe;
