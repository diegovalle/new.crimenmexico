import React from 'react';
import Layout from '../components/layout';
import TextColumn from '../components/TextColumn';
import useBestImages from '../components/BestImages';
import {
  useIntl,
  FormattedMessage,
  FormattedHTMLMessage,
} from 'react-intl';
import { GatsbyImage } from "gatsby-plugin-image"
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
      <section className="hero">
        <div className="hero-body">
          <div className="container has-text-centered">
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

      <section className="more is-widescreen" style={{paddingTop: '2rem'}}>
        <div className="container has-text-centered">
          <h2 className="title">
            <FormattedMessage id="best_site" />
          </h2>
          <div className="columns">
            <div className="column">
              <h5 className="title is-5"><FormattedMessage id="crime_map" /></h5>
              <br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
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
              <button className="button  is-link">
                <LLink
                  to="/mapa-de-delincuencia/"
                  locale={props.pageContext.locale}
                >
                  <FormattedMessage id="crime_map" />
                </LLink>
              </button>
            </div>
            <div className="column">
              <h5 className="title is-5"><FormattedMessage id="anomalies" /></h5>
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
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
              <button className="button  is-link">
                <LLink to="/anomalias/" locale={props.pageContext.locale}>
                  <FormattedMessage id="anomalies" />
                </LLink>
              </button>
            </div>
            <div className="column">
              <h5 className="title is-5"><FormattedMessage id="trends" /></h5><br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
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
              <p className="block">
                <FormattedHTMLMessage id="trend_description" />
              </p>
              <br />
              <button className="button  is-link">
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
