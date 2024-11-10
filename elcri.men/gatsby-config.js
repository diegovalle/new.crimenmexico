let SITENAME = 'https://elcri.men/'

const osmTilesUrl = 'https://tilesmexico.netlify.app'
const mapboxUrl = 'https://api.tiles.mapbox.com'

module.exports = {
  siteMetadata: {
    title: 'Delincuencia en México - El Crimen',
    author: 'Diego Valle-Jones',
    description:
      'Descubre estadísticas de la delincuencia en tu estado y municipio con este mapa interactivo y reporte mensual de homicidios, secuestros, robos y más en México',
    baseUrl: `${SITENAME}`,
    siteUrl: `${SITENAME}`,
    twitterHandle: '@diegovalle',
    preliminaryINEGI: false,
    monthsPreliminaryINEGI: 12,
  },
  flags: {
    DEV_SSR: false,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`webp`],
          quality: 80,
        },
      },
    },
    'gatsby-plugin-image',
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          '/elcrimen-json/*': [
            'cache-control: public',
            'cache-control: max-age=0',
            'cache-control: must-revalidate',
          ],
          '/': [
            'Link: <https://elcri.men/elcrimen-json/states_national.json>; rel=preload; as=fetch; crossorigin',
          ],
          '/en/': [
            'Link: <https://elcri.men/elcrimen-json/states_national.json>; rel=preload; as=fetch; crossorigin',
          ],
          '/mapa-de-delincuencia/': [
            `Link: <https://elcri.men/elcrimen-json/municipios-centroids.json>; rel=preload; as=fetch; crossorigin; <${osmTilesUrl}>; rel=preconnect, <${mapboxUrl}>; rel=preconnect`,
          ],
          '/mapa-clusters/': [
            `Link: <${osmTilesUrl}>; rel=preconnect, <${mapboxUrl}>; rel=preconnect`,
          ],
          '/en/violence-map/': [
            `Link: <https://elcri.men/elcrimen-json/municipios-centroids.json>; rel=preload; as=fetch; crossorigin; <${osmTilesUrl}>; rel=preconnect, <${mapboxUrl}>; rel=preconnect`,
          ],
          '/en/cluster-map/': [
            `Link: <${osmTilesUrl}>; rel=preconnect, <${mapboxUrl}>; rel=preconnect`,
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
          '/static/*': [
            'cache-control: public',
            'cache-control: max-age=2592000',
            'cache-control: immutable',
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
          '/sw.js': [
            'cache-control: public',
            'cache-control: max-age=0',
            'cache-control: must-revalidate',
          ],
          '/*.js': [
            'cache-control: public',
            'cache-control: max-age=2592000',
            'cache-control: immutable',
          ],
          '/*.css': [
            'cache-control: public',
            'cache-control: max-age=2592000',
            'cache-control: immutable',
          ],
          '/__third-party-proxy*': ['Access-Control-Allow-Origin: *'],
        },
      },
    },
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
      },
    },
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
    'gatsby-plugin-sass',

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
    {
      resolve: 'gatsby-plugin-intl',
      options: {
        // language JSON resource path
        path: `${__dirname}/src/i18n`,
        // supported language
        languages: [`en`, `es`],
        // language file path
        defaultLanguage: `es`,
        // option to redirect to `/es` when connecting `/`
        redirect: false,
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      resolveSiteUrl: `https://elcri.men`,
      options: {
        exclude: [`/es/*`, '/es/'],
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
    // {
    //   resolve: 'gatsby-plugin-rollbar',
    //   options: {
    //     accessToken: '86e02448bb5c40e7b79d735a9ed1282c',
    //     // For all configuration options, see https://docs.rollbar.com/docs/rollbarjs-configuration-reference
    //     captureUncaught: true,
    //     maxItems: 10,
    //     itemsPerMinute: 5,
    //     captureUnhandledRejections: true,
    //     payload: {
    //       environment: 'production',
    //     },
    //   },
    // },
  ],
}
