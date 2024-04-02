import React from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { FaFileDownload } from 'react-icons/fa'
import { IoIosArrowDroprightCircle } from 'react-icons/io'
import social_image from '../assets/images/social/social-acerca.png'
import social_image_en from '../assets/images/social/social-acerca_en.png'

function HomeIndex(props) {
  const intl = useIntl()
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage({ id: 'title_about' })}
        description={intl.formatMessage({ id: 'desc_about' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />

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
        bodyAttributes={{
          class: 'homepage',
        }}
      />

      <section className="hero">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title">{intl.formatMessage({ id: 'Acerca de' })}</h1>
            <h2 className="subtitle">{intl.formatMessage({ id: 'Datos' })}</h2>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="columns">
          <div className="column is-offset-3 is-half-desktop is-two-third-fullhd">
            <div className="content is-medium">
              <FormattedHTMLMessage id="about_intro" />
              <br />
              <div className="columns is-centered">
                <div className="column is-8">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          {intl.formatMessage({ id: 'New methodology' })}:
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/nm-fuero-comun-municipios.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon  has-text-success">
                              <FaFileDownload />
                            </span>
                            nm-fuero-comun-municipios.csv.gz
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/nm-fuero-comun-estados.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon  has-text-success">
                              <FaFileDownload />
                            </span>
                            nm-fuero-comun-estados.csv.gz
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/nm-estatal-victimas.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon  has-text-success">
                              <FaFileDownload />
                            </span>
                            nm-estatal-victimas.csv.gz
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          {intl.formatMessage({
                            id: 'Old methodology (up to 2017)',
                          })}
                          :
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/fuero-comun-municipios.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon has-text-danger">
                              <FaFileDownload />
                            </span>
                            fuero-comun-municipios.csv.gz
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/fuero-comun-estados.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon has-text-danger">
                              <FaFileDownload />
                            </span>
                            fuero-comun-estados.csv.gz
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a
                            href="https://data.diegovalle.net/elcrimen/victimas.csv.gz"
                            rel="nofollow"
                          >
                            <span className="icon has-text-danger">
                              <FaFileDownload />
                            </span>
                            victimas.csv.gz
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-section-id="3"
        data-component-id="15a7_9_03_awz"
        data-category="faqs"
        className="section"
      >
        <div className="columns is-centered">
          <div className="column is-6-fullhd is-8-widescreen is-10-desktop is-12-tablet">
            <div className="content is-medium">
              <h2 className="title has-text-centered" data-config-id="header">
                {intl.formatMessage({ id: 'Frequently Asked Questions' })}
              </h2>
              <div className="block" data-config-id="faq">
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'Where does the data used in this website come from?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="data_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'Is the source code available?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="github_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'I really liked the hexagonal map on the frontpage, how can I make one?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="mxmaps_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'Is there an R package for working with INEGI homicide data?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="mxmortalitydb_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'How often is the website updated?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="month_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'How often is the INEGI homicide data updated?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="inegi_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'Where do the state and municipio codes and names come from?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="munnames_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'I tried calculating rates with the population data and I got a different value than what appears on your webpage',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="rates_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id:
                              'Is this website affiliated with the Mexican government?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="indp_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card block">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-medium mdi mdi-24px">
                          <IoIosArrowDroprightCircle />
                        </span>
                      </div>
                      <div className="media-content">
                        <h3 className="title is-4">
                          {intl.formatMessage({
                            id: 'How can I contact you?',
                          })}
                        </h3>
                        <p>
                          <FormattedHTMLMessage id="contact_ans" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <TextColumn>
          <FormattedHTMLMessage id="additional_info" />
        </TextColumn>
      </section>
    </Layout>
  )
}

export default HomeIndex
