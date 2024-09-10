import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/SEO';
import TextColumn from '../components/TextColumn';
import HeroTitlewithLegend from '../components/HeroTitlewithLegend';
import LegendLine from '../components/LegendLine';
import TendenciaNacional from '../components/TendeciaNacional';
import {useIntl, FormattedHTMLMessage} from 'react-intl';

import social_image from '../assets/images/social/social-trends.png';
import social_image_en from '../assets/images/social/social-trends_en.png';

export default function TendenciasPage (props) {
  const intl = useIntl ();
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_trends'})}
        description={intl.formatMessage ({id: 'desc_trends'})}
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
          legend2={
            <LegendLine class={'regression'}>
              {intl.formatMessage ({
                id: 'Regression Line',
              })}
            </LegendLine>
          }
        >
          {intl.formatMessage ({
            id: 'Homicide Trends',
          })}
        </HeroTitlewithLegend>
        <h2 className="subtitle has-text-weight-semibold is-4 has-text-centered">
          {intl.formatMessage ({
            id: 'Month over month difference (this month - same month previous year)',
          })}
        </h2>
        <section>
          <TendenciaNacional />
        </section>
        <hr />
        <section>
          <TextColumn>
            {intl.formatMessage ({id: 'trends_text'})}
          </TextColumn>
        </section>

      </div>
    </Layout>
  );
}
