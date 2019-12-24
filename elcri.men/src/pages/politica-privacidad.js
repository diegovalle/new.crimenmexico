import React from 'react';
import {useStaticQuery, graphql} from 'gatsby';
import Layout from '../components/layout';
import TextColumn from '../components/TextColumn';
import useBestImages from '../components/BestImages';
import {
  useIntl,
  injectIntl,
  FormattedMessage,
  FormattedHTMLMessage,
} from 'react-intl';
import Img from 'gatsby-image';
import LLink from '../components/LLink';
import Helmet from 'react-helmet';

const NotFoundPage = props => {
  const intl = useIntl ();
  const bestImages = useBestImages ();
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet>
        <title>{intl.formatMessage ({id: 'privacy_policy'})}</title>
        <meta
          name="description"
          content={intl.formatMessage ({
            id: 'privacy_desc',
          })}
        />
        <html lang={props.pageContext.locale} />
      </Helmet>
      <section class="hero">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 className="title has-text-centered has-text-info">
              {intl.formatMessage ({id: 'privacy_policy'})}
            </h1>
          </div>
        </div>
      </section>

      <section>
        <TextColumn>
          <FormattedHTMLMessage id="privacy_txt" />
        </TextColumn>
      </section>

      <hr/>

      <section class="more is-widescreen" style={{paddingTop: '2rem'}}>
        <div class="container has-text-centered">
          <h2 class="title">
            <FormattedMessage id="best_site" />
          </h2>
          <div class="columns">
            <div class="column">
              <h5 class="title is-5"><FormattedMessage id="crime_map" /></h5>
              <br />
              <div class="level">
                <div class="level-item">
                  <figure class="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.mapa.childImageSharp.fixed}
                      fixed={bestImages.mapa.childImageSharp.fixed}
                      title={intl.formatMessage ({id: 'Crime map of Mexico'})}
                      alt={intl.formatMessage ({id: 'Crime map of Mexico'})}
                    />
                  </figure>
                </div>
              </div>
              <p className="block">
                <FormattedHTMLMessage id="map_description" />
              </p>
              <br />
              <button class="button  is-link">
                <LLink
                  to="/mapa-de-delincuencia/"
                  locale={props.pageContext.locale}
                >
                  <FormattedMessage id="crime_map" />
                </LLink>
              </button>
            </div>
            <div class="column">
              <h5 class="title is-5"><FormattedMessage id="anomalies" /></h5>
              <div class="level">
                <div class="level-item">
                  <figure class="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.anomalies.childImageSharp.fixed}
                      fixed={bestImages.anomalies.childImageSharp.fixed}
                      title={intl.formatMessage ({id: 'Crime anomalies'})}
                      alt={intl.formatMessage ({id: 'Crime anomalies'})}
                    />
                  </figure>
                </div>
              </div>
              <p className="block">
                <FormattedHTMLMessage id="anomalies_description" />
              </p>
              <br />
              <button class="button  is-link">
                <LLink to="/anomalias/" locale={props.pageContext.locale}>
                  <FormattedMessage id="anomalies" />
                </LLink>
              </button>
            </div>
            <div class="column">
              <h5 class="title is-5"><FormattedMessage id="trends" /></h5><br />
              <div class="level">
                <div class="level-item">
                  <figure class="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.trend.childImageSharp.fixed}
                      fixed={bestImages.trend.childImageSharp.fixed}
                      title={intl.formatMessage ({
                        id: 'Homicide trends in Mexico',
                      })}
                      alt={intl.formatMessage ({
                        id: 'Homicide trends in Mexico',
                      })}
                    />
                  </figure>
                </div>
              </div>
              <p class="block">
                <FormattedHTMLMessage id="trend_description" />
              </p>
              <br />
              <button class="button  is-link">
                <LLink to="/tendencias/" locale={props.pageContext.locale}>
                  <FormattedMessage id="trends" />
                </LLink>
              </button>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default NotFoundPage;
