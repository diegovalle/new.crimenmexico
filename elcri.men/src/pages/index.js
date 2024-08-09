import React, { useEffect } from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'

import FrontPageMap from '../components/FrontPageMap'
import HistoricalChart from '../components/HistoricalChart'
import { useStaticQuery, graphql } from 'gatsby'
import SEO from '../components/SEO'
import LLink from '../components/LLink'

import { orderBy, filter } from 'lodash-es'
import { YYYYmmddToDate15 } from '../components/utils.js'

import LazyLoad from 'react-lazyload'
import Img from 'gatsby-image'
import { Link } from 'gatsby'
import '../assets/scss/style.scss'

import { useIntl, injectIntl, FormattedMessage } from 'react-intl'
import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import useBestImages from '../components/BestImages'

import social_image from '../assets/images/social/social-index.png'
import social_image_en from '../assets/images/social/social-index_en.png'

// variables for the inforgraphic names are in gatsby-node.js
export const data_query = graphql`
  query query($fname_infographic: String, $fname_mun: String) {
    allFile(
      filter: {
        sourceInstanceName: { in: ["infographics_en", "infographics_es"] }
        name: { in: [$fname_infographic, $fname_mun] }
      }
    ) {
      edges {
        node {
          childImageSharp {
            fluid(maxWidth: 432, srcSetBreakpoints: [216, 432, 648]) {
              ...GatsbyImageSharpFluid_withWebp_noBase64
              originalName
              originalImg
            }
          }
          base
          id
        }
      }
    }
  }
`

const HomeIndex = props => {
  const intl = useIntl()
  const bestImages = useBestImages()
  const last_date = useLastMonth()
  const regex_es = /^infographic_es|^municipios_es/
  const regex_en = /^infographic_(?!es)|^municipios_(?!es)/

  useEffect(() => {
    if (props.location.hash.includes('#historical')) {
      document.getElementById('historical').scrollIntoView()
    }
  })

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet
        bodyAttributes={{
          class: 'homepage',
        }}
      />
      <SEO
        title={intl.formatMessage({ id: 'Delincuencia en México - El Crimen' })}
        socialTitle="ElCri.men"
        description={intl.formatMessage({ id: 'desc_index' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <section className="hero">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h2 className="subtitle has-text-weight-semibold is-4">
              {intl.formatMessage({ id: 'crimen_mexico' })}
            </h2>
            <h1 className="title has-text-weight-bold is-2  is-size-3-mobile">
              {props.pageContext.locale === 'es'
                ? intl.formatMessage({ id: 'Reporte de' })
                : null}{' '}
              {props.pageContext.locale === 'es'
                ? last_date.month_long_es
                : last_date.month_long_en}{' '}
              <FormattedDate
                value={YYYYmmddToDate15(last_date.iso_mid)}
                year="numeric"
              />{' '}
              <FormattedMessage id="title_home" />
            </h1>
            {/* <AdSense.Google
              client="ca-pub-2949275046149330"
              slot="8649980552"
              // style={{display: 'block'}}
              // format="auto"
              // responsive="true"
            /> */}
          </div>
        </div>
      </section>

      <hr className="is-hidden-mobile" style={{ margin: '1rem 0 2.5rem 0' }} />

      <section className="frontpage">
        <div className="container  is-fullhd">
          <div className="columns">
            <div className="column is-half">
              <h2 className="subtitle is-3 is-size-5-mobile">
                {intl.formatMessage({ id: 'tasas de criminalidad' })}
                {' - '}
                {props.pageContext.locale === 'es'
                  ? last_date.month_short_es
                  : last_date.month_short_en}{' '}
                <FormattedDate
                  value={YYYYmmddToDate15(last_date.iso_mid)}
                  year="numeric"
                />
              </h2>
            </div>
            <div className="column is-half is-hidden-mobile">
              <p style={{ lineHeight: '1.2rem' }}>
                <FormattedHTMLMessage id="inegi-adjusted" />
                <br />
                <FormattedHTMLMessage id="snsp-victims" />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="hexmap_and_charts" style={{ marginTop: '.75rem' }}>
        <div className="container  is-fullhd">
          <FrontPageMap />
        </div>
      </section>

      <hr />

      <section id="cifras">
        <div className="columns">
          <div className="column is-offset-3 is-half-desktop is-two-third-fullhd">
            <div className="content is-medium">
              {/* <AdSense.Google
                client="ca-pub-2949275046149330"
                slot="8649980552"
                // style={{display: 'block'}}
                // format="auto"
                // responsive="true"
              /> */}
              <FormattedHTMLMessage id="oficial_data" />
            </div>
          </div>
        </div>
      </section>
      <hr />

      <section className="historicalChart">
        <div className="hero-body">
          <div className="container">
            <div className="columns">
              <div className="column is-full">
                <h2 className="title has-text-centered has-text-weight-bold">
                  <FormattedMessage id="histchart_title" />
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="container  is-widescreen">
          {/* <AdSense.Google
            client="ca-pub-2949275046149330"
            slot="8649980552"
            // style={{display: 'block'}}
            // format="auto"
            // responsive="true"
          /> */}
          <a name="#historical" id="historical" />
          <LazyLoad height={440} once offset={200}>
            <HistoricalChart hash={props.location.hash} />
          </LazyLoad>
        </div>
      </section>

      <hr />

      <section className="infographics">
        <div className="hero-body">
          <div className="container">
            <div className="columns">
              <div className="column is-half">
                <h2 className="title has-text-left">
                  <FormattedMessage id="Infographics" />
                </h2>
              </div>
              <div className="column is-half">
                <h3 className="subtitle has-text-right">
                  <FormattedMessage id="Charts to explain the drug war" />
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div className="container  is-widescreen">
          <div className="columns">
            {orderBy(
              filter(props.data.allFile.edges, obj =>
                props.pageContext.locale === 'es'
                  ? regex_es.test(obj.node.base)
                  : regex_en.test(obj.node.base)
              ),
              [
                function(o) {
                  let months = {
                    jan: '01',
                    feb: '02',
                    mar: '03',
                    apr: '04',
                    may: '05',
                    jun: '06',
                    jul: '07',
                    aug: '08',
                    sep: '09',
                    oct: '10',
                    nov: '11',
                    dec: '12',
                    ene: '01',
                    feb: '02',
                    mar: '03',
                    abr: '04',
                    may: '05',
                    jun: '06',
                    jul: '07',
                    ago: '08',
                    sep: '09',
                    oct: '10',
                    nov: '11',
                    dic: '12',
                  }
                  let name = o.node.base
                    .replace('_es', '')
                    .replace('.png')
                    .replace('municipios', 'a')
                    .split('_')
                  return name[2] + months[name[1]] + name[0]
                },
              ],
              ['desc']
            )
              .slice(0, 2)
              .map(edge => (
                <React.Fragment
                  key={edge.node.childImageSharp.fluid.originalName}
                >
                  <div
                    key={edge.node.childImageSharp.fluid.originalName + 'div'}
                    className="column is-offset-1 is-4"
                  >
                    <a
                      key={edge.node.childImageSharp.fluid.originalName}
                      href={
                        (props.pageContext.locale === 'es' ? '/es' : '/en') +
                        '/images/infographics/fulls/' +
                        edge.node.childImageSharp.fluid.originalName
                      }
                    >
                      <figure
                        className="image is-3x5"
                        key={
                          edge.node.childImageSharp.fluid.originalName + 'fluid'
                        }
                      >
                        <Img
                          key={
                            edge.node.childImageSharp.fluid.originalName + 'img'
                          }
                          fluid={edge.node.childImageSharp.fluid}
                          title={intl.formatMessage({
                            id: 'Infographic of crime in Mexico',
                          })}
                          alt={intl.formatMessage({
                            id: 'Infographic of crime in Mexico',
                          })}
                          sizes={edge.node.childImageSharp.sizes}
                          loading="lazy"
                        />
                      </figure>
                    </a>
                  </div>
                  <div
                    className="column"
                    key={edge.node.childImageSharp.fluid.originalName}
                  />
                </React.Fragment>
              ))}
          </div>
        </div>
        <section className="section">
          <div className="has-text-centered">
            <LLink
              style={{ fontFamily: 'Arial, sans-serif' }}
              className="button is-link is-centered"
              to="/infograficas/"
              locale={props.pageContext.locale}
            >
              <FormattedMessage id="starship" />
            </LLink>
          </div>
        </section>
      </section>

      <hr />

      <section className="more is-widescreen" style={{ paddingTop: '2rem' }}>
        <div className="container has-text-centered">
          <h2 className="title">
            <FormattedMessage id="best_site" />
          </h2>
          <div className="columns">
            <div className="column">
              <h3 className="title is-5">
                <FormattedMessage id="crime_map" />
              </h3>
              <br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.mapa.childImageSharp.fixed}
                      fixed={bestImages.mapa.childImageSharp.fixed}
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
              <LLink
                style={{ fontFamily: 'Arial, sans-serif' }}
                className="button is-link"
                to="/mapa-de-delincuencia/"
                locale={props.pageContext.locale}
              >
                <FormattedMessage id="crime_map" />
              </LLink>
            </div>
            <div className="column">
              <h3 className="title is-5">
                <FormattedMessage id="anomalies" />
              </h3>
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.anomalies.childImageSharp.fixed}
                      fixed={bestImages.anomalies.childImageSharp.fixed}
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
              <LLink
                style={{ fontFamily: 'Arial, sans-serif' }}
                className="button is-link"
                to="/anomalias/"
                locale={props.pageContext.locale}
              >
                <FormattedMessage id="anomalies" />
              </LLink>
            </div>
            <div className="column">
              <h3 className="title is-5">
                <FormattedMessage id="trends" />
              </h3>
              <br />
              <div className="level">
                <div className="level-item">
                  <figure className="image is-128x128">
                    <Img
                      className="is-rounded"
                      key={bestImages.trend.childImageSharp.fixed}
                      fixed={bestImages.trend.childImageSharp.fixed}
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
              <LLink
                style={{ fontFamily: 'Arial, sans-serif' }}
                className="button is-link"
                to="/tendencias/"
                locale={props.pageContext.locale}
              >
                <FormattedMessage id="trends" />
              </LLink>
            </div>
          </div>
        </div>
      </section>

      <hr />
    </Layout>
  )
}

export default injectIntl(HomeIndex)
