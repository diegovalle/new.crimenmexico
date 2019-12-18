import React, {useState, useEffect} from 'react';
import Helmet from 'react-helmet';

import Layout from '../components/layout';
import SmallMultiple from '../components/SmallMultiple';
import HeroTitle from '../components/HeroTitle';
import BarToolTip from '../components/BarToolTip';
import MG from 'metrics-graphics';
import SEO from '../components/SEO';
import TextColumn from '../components/TextColumn';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage, FormattedDate} from 'react-intl';
import useLastMonth from '../components/LastMonth';
import social_image from '../assets/images/social/social-top50.png';
import social_image_en from '../assets/images/social/social-top50_en.png';

function MostViolent (props) {
  const [data, setdata] = useState (null);

  useEffect (() => {
    fetch ('/elcrimen-json/top-municipios.json')
      .then (response => response.json ())
      .then (responseJSON => {
        setdata (responseJSON);
      })
      .catch (error => {
        console.error (error);
      });
  }, []);

  const chartHeight = 2720;
  const intl = useIntl ();
  const last_date = useLastMonth ();

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_top'})}
        description={intl.formatMessage ({id: 'desc_top'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div>
        <HeroTitle>
          {intl.formatMessage ({id: 'Most violent municipios from'})}
          {' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es6
            : last_date.month_long_en6}
          {' '}
          <FormattedDate value={new Date (last_date.iso_mid6)} year="numeric" />
          {' '}
          {intl.formatMessage ({id: 'to'})}
          {' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es
            : last_date.month_long_en}
          {' '}
          <FormattedDate value={new Date (last_date.iso_mid)} year="numeric" />
        </HeroTitle>

        <section class="section" id="top-section">

          <div class="container is-desktop">

            <div className="columns is-centered">
              <div className="column is-8">
                <div style={{height: ' 100%'}}>
                  {data
                    ? <BarToolTip data={data} height={chartHeight} />
                    : <div />}
                </div>
              </div>
            </div>
          </div>
        </section>
        <hr />
        <TextColumn>
          <p>
            <FormattedMessage id="top50_text" />
          </p>
        </TextColumn>
      </div>
    </Layout>
  );
}

export default MostViolent;
