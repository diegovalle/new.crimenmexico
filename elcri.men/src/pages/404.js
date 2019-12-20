import React from 'react';
import {useStaticQuery, graphql} from 'gatsby';
import Layout from '../components/layout';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import Img from 'gatsby-image';

const useError = () => {
  const data = useStaticQuery (graphql`
query errorQuery {
  
  fatbubu:file(relativePath: {eq: "fatbubu.jpg"}) {
    childImageSharp {
      fixed(width: 300, height: 400, quality: 80) {
        ...GatsbyImageSharpFixed_withWebp
        originalName
        width
      }
    }
  }
}
`);
  return data;
};

const NotFoundPage = props => {
  const intl = useIntl ();
  const image = useError ();
  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <section class="hero">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 className="title has-text-centered has-text-danger">
              {intl.formatMessage ({id: 'NOT FOUND'})}
            </h1>
            <h2 className="subtitle  has-text-centered has-text-danger">
              {intl.formatMessage ({
                id: "You just hit a route that doesn't exist... the sadness.",
              })}
            </h2>
          </div>
        </div>
      </section>
      <div class="columns is-mobile is-centered">
        <div class="column is-half has-text-centered">
          <figure class="image is-3x4 is-inline-block">
            <Img
              key={image.fatbubu.childImageSharp.fixed}
              fixed={image.fatbubu.childImageSharp.fixed}
              title={intl.formatMessage ({
                id: 'NOT FOUND',
              })}
              alt={intl.formatMessage ({
                id: 'NOT FOUND',
              })}
            />
          </figure>
        </div>
      </div>

    </Layout>
  );
};

export default NotFoundPage;
