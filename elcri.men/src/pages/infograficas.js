import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/SEO';

import { GatsbyImage } from "gatsby-plugin-image"
import useInfographics from '../components/InfographicsQuery';

import {orderBy, filter} from 'lodash-es';
import {useIntl} from 'react-intl';
import social_image from '../assets/images/social/social-infographics.png';
import social_image_en
  from '../assets/images/social/social-infographics_en.png';

const Infographics = ({data, location, pageContext}) => {
  const regex_es = /^infographic_es|^municipios_es/;
  const regex_en = /^infographic_(?!es)|^municipios_(?!es)/;
  const intl = useIntl ();
  const infographics = useInfographics ();
  return (
    <Layout locale={pageContext.locale} path={location.pathname}>
      <SEO
        title={intl.formatMessage ({id: 'title_infographics'})}
        description={intl.formatMessage ({id: 'desc_infographics'})}
        socialImage={
          pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={location.pathname}
        lang={pageContext.locale}
      />
      <div className="container">

        <section className="hero">
          <div className="hero-body">
            <div className="container">
              <div className="columns">
                <div className="column is-half">
                  <h1 className="title has-text-left">
                    {intl.formatMessage ({id: 'Infographics'})}
                  </h1>

                </div>
                <div className="column is-half">
                  <h2 className="subtitle has-text-right has-text-left-mobile">
                    {intl.formatMessage ({
                      id: 'Charts to explain the drug war',
                    })}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>

          <div className="columns is-multiline">
            {orderBy (
              filter (
                infographics.allFile.edges,
                obj =>
                  pageContext.locale === 'es'
                    ? regex_es.test (obj.node.base)
                    : regex_en.test (obj.node.base)
              ),
              [
                function (o) {
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
                  };
                  let name = o.node.base
                    .replace ('_es', '')
                    .replace ('.png')
                    .replace ('municipios', 'a')
                    .split ('_');
                  return name[2] + months[name[1]] + name[0];
                },
              ],
              ['desc']
            ).map ((edge, i) => (
              <React.Fragment key={i}>
                {i % 2 === 0
                  ? <div
                      className="column is-full has-text-centered"
                      key={i + 'div'}
                    >
                      <h3 className="title is-4" key={i}>
                        {edge.node.base
                          .replace ('_es', '')
                          .replace ('infographic_', '')
                          .replace ('.png', '')
                          .replace ('_', ' ')
                          .replace (/^\w/, c => c.toUpperCase ())}
                      </h3>
                    </div>
                  : <div key={i + 'null'} />}
                <div
                  key={edge.node.base + 'b'}
                  className="column is-offset-1 is-4"
                >
                  <a
                    key={i + 'a'}
                    className="absolutlynocallsname"
                    href={
                      (pageContext.locale === 'es'
                        ? '/es/images/infographics/fulls/'
                        : '/en/images/infographics/fulls/') +
                            edge.node.base
                    }
                  >
                    <figure className="image is-3x5" key={i + 'figure'}>
                      <GatsbyImage
                       image={edge.node.childImageSharp.gatsbyImageData}
                        loading="lazy"
                        backgroundColor="#c7b470"
                        key={edge.node.childImageSharp.base}
                        // fluid={edge.node.childImageSharp.fluid}
                        title={intl.formatMessage (
                          {id: 'infograph_alt'},
                          {
                            date: edge.node.base
                              .replace ('_es', '')
                              .replace ('infographic_', '')
                              .replace ('municipios_', '')
                              .replace ('.png', '')
                              .replace ('_', ' ')
                              .replace (/^\w/, c => c.toUpperCase ()),
                          }
                        )}
                        alt={intl.formatMessage (
                          {id: 'infograph_alt'},
                          {
                            date: edge.node.base
                              .replace ('_es', '')
                              .replace ('infographic_', '')
                              .replace ('municipios_', '')
                              .replace ('.png', '')
                              .replace ('_', ' ')
                              .replace (/^\w/, c => c.toUpperCase ()),
                          }
                        )}
                        //sizes={edge.node.childImageSharp.sizes}
                      />
                    </figure>
                  </a>
                  <hr key={i + 'hr'} />
                </div>
                <div className="column is-1" key={i + 'colpad'} />
              </React.Fragment>
            ))}
          </div>

          <div />
        </section>
      </div>

    </Layout>
  );
};

export default Infographics;
