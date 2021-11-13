import React from 'react';
import Helmet from 'react-helmet';

import Layout from '../components/layout';
import TrendChart from '../components/TrendChart';
import SEO from '../components/SEO';
import {useIntl, injectIntl, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {timeFormatDefaultLocale, timeFormatLocale} from 'd3-time-format';

import {dateLoc} from '../../src/i18n';
import social_image from '../assets/images/social/social-trends-states.png';
import social_image_en from '../assets/images/social/social-trends-states_en.png';

function TrendsDeriv (props) {
  const siteTitle = 'Gatsby Starter - Strata';
  const siteDescription = 'Site description';

  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_trends_states'})}
        description={intl.formatMessage ({id: 'desc_trends_states'})}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
        
       <div className="container is-fullhd" id="trends">
        <article id="content">
          

          <TrendChart />

         

          <br />
          <br />
          <br />
           <p style={{lineHeight: '1.2rem'}}>
          <FormattedHTMLMessage id="trend_text" />
        </p>
          <p style={{textAlign: 'left'}}>
            
          </p>
          <br />
        </article>
      </div>
    </Layout>
  );
}

export default TrendsDeriv;
