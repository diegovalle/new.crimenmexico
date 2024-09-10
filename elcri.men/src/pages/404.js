import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import {
  useIntl,
  injectIntl,
  FormattedMessage,
  FormattedHTMLMessage,
} from 'react-intl'
import { GatsbyImage } from "gatsby-plugin-image";
import useBestImages from '../components/BestImages'
import LLink from '../components/LLink'
import Helmet from 'react-helmet'

const useError = () => {
  const data = useStaticQuery(graphql`
    query errorQuery {
      fatbubu: file(relativePath: { eq: "fatbubu.jpg" }) {
        childImageSharp {
          gatsbyImageData(
            width: 300
            height: 400
            quality: 80
            placeholder: NONE
            layout: CONSTRAINED
          )
        }
      }
    }
  `)
  return data
}

const NotFoundPage = props => {
  const intl = useIntl()
  const image = useError()
  const bestImages = useBestImages()
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet>
        <title>{intl.formatMessage({ id: 'NOT FOUND' })}</title>
        <meta
          name="description"
          content={intl.formatMessage({
            id: "You just hit a route that doesn't exist... the sadness.",
          })}
        />
        <html lang={props.pageContext.locale} />
      </Helmet>
      <section className="hero">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title has-text-centered has-text-danger">
              {intl.formatMessage({ id: 'NOT FOUND' })}
            </h1>
            <h2 className="subtitle  has-text-centered has-text-danger">
              {intl.formatMessage({
                id: "You just hit a route that doesn't exist... the sadness.",
              })}
            </h2>
          </div>
        </div>
      </section>
      <div className="columns is-mobile is-centered">
        <div className="column is-half has-text-centered">
          <figure className="image is-3x4 is-inline-block">
            <GatsbyImage
              key={image.fatbubu.childImageSharp.gatsbyImageData}
              image={image.fatbubu.childImageSharp.gatsbyImageData}
              title={intl.formatMessage({
                id: 'NOT FOUND',
              })}
              alt={intl.formatMessage({
                id: 'NOT FOUND',
              })}
            />
          </figure>
        </div>
      </div>

      <section className="more is-widescreen" style={{ paddingTop: '2rem' }}>
        <div className="container has-text-centered">
          <h2 className="title">
            <FormattedMessage id="best_site" />
          </h2>
          <div className="columns">
            <div className="column">
              <h5 className="title is-5">
                <FormattedMessage id="crime_map" />
              </h5>
              <br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
                      className="is-rounded"
                      key={bestImages.mapa.childImageSharp.gatsbyImageData}
                      image={bestImages.mapa.childImageSharp.gatsbyImageData}
                      title={intl.formatMessage({ id: 'Crime map of Mexico' })}
                      alt={intl.formatMessage({ id: 'Crime map of Mexico' })}
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
              <h5 className="title is-5">
                <FormattedMessage id="anomalies" />
              </h5>
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
                      className="is-rounded"
                      key={bestImages.anomalies.childImageSharp.gatsbyImageData}
                      image={bestImages.anomalies.childImageSharp.gatsbyImageData}
                      title={intl.formatMessage({ id: 'Crime anomalies' })}
                      alt={intl.formatMessage({ id: 'Crime anomalies' })}
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
              <h5 className="title is-5">
                <FormattedMessage id="trends" />
              </h5>
              <br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <GatsbyImage
                      className="is-rounded"
                      key={bestImages.trend.childImageSharp.gatsbyImageData}
                      image={bestImages.trend.childImageSharp.gatsbyImageData}
                      title={intl.formatMessage({
                        id: 'Homicide trends in Mexico',
                      })}
                      alt={intl.formatMessage({
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
  )
}

export default NotFoundPage
