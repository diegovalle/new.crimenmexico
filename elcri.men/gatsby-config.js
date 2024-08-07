SITENAME = 'https://elcri.men/'
SITENAME_NO_SLASH = 'https://elcri.men'

module.exports = {
  siteMetadata: {
    title: 'Delincuencia en México - El Crimen',
    author: 'Diego Valle-Jones',
    description:
      'Descubre estadísticas de la delincuencia en tu estado y municipio con este mapa interactivo y reporte mensual de homicidios, secuestros, robos y más en México',
    baseUrl: `${SITENAME}`,
    siteUrl: `${SITENAME}`,
    twitterHandle: '@diegovalle',
    preliminaryINEGI: true,
    monthsPreliminaryINEGI: 12,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-react-helmet-canonical-urls`,
      options: {
        siteUrl: `${SITENAME_NO_SLASH}`,
      },
    },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          // '/': [
          //   'Link: </elcrimen-json/states_hexgrid.json>; rel=preload; as=fetch; crossorigin',
          // ],
          '/elcrimen-json/*': [
            'cache-control: public',
            'cache-control: max-age=0',
            'cache-control: must-revalidate',
          ],
          '/*': [
            'Strict-Transport-Security: max-age=31536000',
            'Permissions-Policy: geolocation=(self), fullscreen=(self)',
          ],
          '/*.html': [
            'cache-control: public',
            'cache-control: max-age=0',
            'cache-control: must-revalidate',
          ],
          '/page-data/*': [
            'cache-control: public',
            'cache-control: max-age=0',
            'cache-control: must-revalidate',
          ],
          '/en/images/infographics/fulls/*': [
            'cache-control: public',
            'cache-control: max-age=2592000',
          ],
          '/es/images/infographics/fulls/*': [
            'cache-control: public',
            'cache-control: max-age=2592000',
          ],
          '/tiles/*': [
            'Access-Control-Allow-Origin: https://elcri.men',
            'cache-control: public',
            'cache-control: max-age=2592000',
          ],
          '/tendencias-estado/': [
            'Link: <https://trends.elcri.men/states_trends.json>; rel=preload; as=fetch; crossorigin',
          ],
          '/en/trends-states/': [
            'Link: <https://trends.elcri.men/states_trends.json>; rel=preload; as=fetch; crossorigin',
          ],
        }, // option to add more headers. `Link` headers are transformed by the below criteria
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        // Exclude specific pages or groups of pages using glob parameters
        // See: https://github.com/isaacs/minimatch
        // The example below will exclude the single `path/to/page` and all routes beginning with `category`
        exclude: ['/category/*', `/en`],
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }

          allSitePage {
            edges {
              node {
                path
              }
            }
          }
      }`,
        serialize: ({ site, allSitePage }) =>
          allSitePage.edges.map(edge => {
            return {
              url: site.siteMetadata.siteUrl + edge.node.path,
              changefreq: `monthly`,
              priority: 0.7,
            }
          }),
      },
    },
    `gatsby-plugin-layout`,
    //`gatsby-plugin-preload-fonts`,
    // {
    //   resolve: 'gatsby-plugin-webpack-bundle-analyzer',
    //   options: {
    //     production: true,
    //     analyzerPort: "9001",
    //   },
    // },
    // {
    //   resolve: "gatsby-plugin-guess-js",
    //   options: {
    //     // Find the view id in the GA admin in a section labeled "views"
    //     GAViewID: ``,
    //     // Add a JWT to get data from GA
    //     jwt: {
    //       client_email: `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
    //       private_key: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
    //     },
    //     minimumThreshold: 0.03,
    //     // The "period" for fetching analytic data.
    //     period: {
    //       startDate: new Date("2018-1-1"),
    //       endDate: new Date(),
    //     },
    //   },
    // },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `infographics_en`,
        path: `${__dirname}/static/en/images/infographics/fulls/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `infographics_es`,
        path: `${__dirname}/static/es/images/infographics/fulls/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: 'data',
        path: `${__dirname}/src/data`,
      },
    },
    `gatsby-transformer-json`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'ElCri.men',
        short_name: 'elcrimen',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        display: 'minimal-ui',
        icon: `src/favicon.png`,
      },
    },
    'gatsby-plugin-sass',
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: [`/admin`, `/tags/links`],
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        policy: [{ userAgent: '*', allow: '/' }],
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // selfHostedOrigin: "YOUR_SELF_HOSTED_ORIGIN",
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          'G-SMLSV8EVFV', // Google Analytics / GA
        ],
      },
    },
    `gatsby-plugin-favicon`,
    /* 'gatsby-plugin-offline',*/
    {
      resolve: `gatsby-plugin-purgecss`,
      options: {
        //printRejected: true, // Print removed selectors and processed file names
        whitelistPatterns: [
          /.*mg-.*/,
          /metricsGraphicsCon/,
          /metrics.*/,
          /inegi/,
        ],
        //ignore: ['metricsgraphics.css', 'react-tabs.css'],
        purgeOnly: [
          'scss/style.scss',
          '_datepicker.css',
          'top50.css',
          'mapbox-gl.css',
        ],
        //develop: true, // Enable while using `gatsby develop`
        // tailwind: true, // Enable tailwindcss support
        // whitelist: ['whitelist'], // Don't remove this selector
        // ignore: ['/ignored.css', 'prismjs/', 'docsearch.js/'], // Ignore files/folders
        // purgeOnly : ['components/', '/main.css', 'bootstrap/'], // Purge only these files/folders
      },
    },
  ],
}
