import React from 'react'
import Helmet from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
import { routes } from '../../src/i18n'

const SEO = props => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          siteUrl
          twitterHandle
        }
      }
    }
  `)
  // const schemaOrgJSONLD = [
  //   {
  //     '@context': 'http://schema.org',
  //     '@type': 'WebSite',
  //     data.siteUrl,
  //     name: .title,
  //     alternateName: config.title,
  //   },
  // ];
  const defaults = data.site.siteMetadata

  if (defaults.siteUrl === '' && typeof window !== 'undefined') {
    defaults.siteUrl = window.location.origin
  }

  if (defaults.siteUrl === '') {
    console.error('Please set a baseUrl in your site metadata!')
    return null
  }

  const title = props.title
  const description = props.description
  const image = props.socialImage

  return (
    <Helmet>
      <title>{title}</title>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'http://schema.org/',
          '@type': 'Organization',
          url: 'https://elcri.men',
          '@id': 'https://elcri.men/#Organization',
          name: 'El Crimen',
          description: 'Mexico Crime Report',
          logo: {
            '@type': 'ImageObject',
            url: 'https://elcri.men/logo_elcrimen.png',
            width: '1200',
            height: '623',
          },
          founder: {
            '@type': 'Person',
            '@id': 'https://www.diegovalle.net/#Person',
            name: 'Diego Valle-Jones',
            givenName: 'Diego',
            familyName: 'Valle-Jones',
            sameAs: [
              'https://twitter.com/diegovalle',
              'https://github.com/diegovalle',
              'https://facebook.com/diegovalle',
              'https://www.linkedin.com/in/diegovalle',
              '',
              '',
            ],
            url: 'https://www.diegovalle.net',
          },
          foundingDate: '2011',
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: props.lang === 'es' ? 'El Crimen' : 'Mexico Crime Report',
          inLanguage: props.lang === 'es' ? 'es' : 'en',
          url:
            props.lang === 'es' ? 'https://elcri.men/' : 'https//elcri.men/en/',
          author: [
            {
              '@type': 'Person',
              '@id': 'https://www.diegovalle.net/#Person',
              name: 'Diego Valle-Jones',
              givenName: 'Diego',
              familyName: 'Valle-Jones',
              sameAs: [
                'https://twitter.com/diegovalle',
                'https://github.com/diegovalle',
                'https://facebook.com/diegovalle',
                'https://www.linkedin.com/in/diegovalle',
                '',
                '',
              ],
              url: 'https://www.diegovalle.net',
            },
          ],
        })}
      </script>
      <meta name="description" content={description} />
      <meta
        name="image"
        content={defaults.siteUrl.replace(/\/$/, '') + image}
      />

      {/* Schema.org tags */}
      {/* <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script> */}

      <meta property="og:url" content={`${defaults.siteUrl}${props.path}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={'El Crimen'} />
      <meta property="og:description" content={description} />
      <meta
        property="og:image"
        content={defaults.siteUrl.replace(/\/$/, '') + image}
      />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:width" content="1200" />
      <link
        rel="canonical"
        href={`${defaults.siteUrl}${props.path}${
          props.lang === "en" && props.path !== "/" ? "/" : ""
        }`.replace(/\/\/$/, "/")}
      />
      <link
        rel="alternate"
        hrefLang={props.lang === 'es' ? 'en' : 'es'}
        href={
          defaults.siteUrl.replace(/\/$/, '') +
          (props.lang === 'es'
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
        content={defaults.siteUrl.replace(/\/$/, '') + image}
      />
      <html lang={props.lang} />
    </Helmet>
  )
}

export default SEO
