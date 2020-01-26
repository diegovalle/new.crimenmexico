import React from 'react';
import Helmet from 'react-helmet';
import {useStaticQuery, graphql} from 'gatsby';
import {routes, routes_inverted} from '../../src/i18n';

const SEO = props => {
  const data = useStaticQuery (graphql`
    {
      site {
        siteMetadata {
          siteUrl
          twitterHandle
        }
      }
    }
  `);
  // const schemaOrgJSONLD = [
  //   {
  //     '@context': 'http://schema.org',
  //     '@type': 'WebSite',
  //     data.siteUrl,
  //     name: .title,
  //     alternateName: config.title,
  //   },
  // ];
  const defaults = data.site.siteMetadata;

  if (defaults.siteUrl === '' && typeof window !== 'undefined') {
    defaults.siteUrl = window.location.origin;
  }

  if (defaults.siteUrl === '') {
    console.error ('Please set a baseUrl in your site metadata!');
    return null;
  }

  const title = props.title;
  const description = props.description;
  const image = props.socialImage;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="image"
        content={defaults.siteUrl.replace (/\/$/, '') + image}
      />

      {/* Schema.org tags */}
      {/* <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script> */}

      <meta property="og:url" content={`${defaults.siteUrl}${props.path}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta
        property="og:image"
        content={defaults.siteUrl.replace (/\/$/, '') + image}
      />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:width" content="1200" />

      <link
        rel="alternate"
        hreflang={props.lang === 'es' ? 'en' : 'es'}
        href={defaults.siteUrl.replace (/\/$/, '') + (
          props.lang === 'es'
            ? '/en' + routes.routes[props.path]
            : routes.routes_inverted[props.path])
        }
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={data.site.twitterHandle} />
      <meta name="twitter:title" content={props.socialTitle || title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={defaults.siteUrl.replace (/\/$/, '') + image}
      />
      <html lang={props.lang} />
    </Helmet>
  );
};

export default SEO;
