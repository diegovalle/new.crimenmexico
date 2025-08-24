let SITENAME = 'https://elcri.men/'

// osmSpriteUrl: "https://tilesmexico.netlify.app/sprites/sprite",
// osmGlyphsUrl: "https://tilesmexico.netlify.app/font/{fontstack}/{range}.pbf",
// osmSpriteUrl: `https://elcri.men/tiles/sprites/sprite`,
// osmGlyphsUrl: `https://elcri.men/tiles/font/{fontstack}/{range}.pbf`,
// const osmTilesUrl = 'https://tiles.elcri.men'
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
    preliminaryINEGI: true,
    monthsPreliminaryINEGI: 12,
    osmTilesUrl: `${osmTilesUrl}`,
    osmSpriteUrl: `https://tilesmexico.netlify.app/sprites/sprite`,
    osmGlyphsUrl: `https://tilesmexico.netlify.app/font/{fontstack}/{range}.pbf`,
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
          '/reporte-diario/': [
            `Link: <https://diario.elcri.men/informe_diario.json>; rel=preload; as=fetch; crossorigin; <https://diario.elcri.men/por_dia2.json>; rel=preload; as=fetch; crossorigin;`,
          ],
          '/en/daily-report/': [
            `Link: <https://diario.elcri.men/informe_diario.json>; rel=preload; as=fetch; crossorigin; <https://diario.elcri.men/por_dia2.json>; rel=preload; as=fetch; crossorigin;`,
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
      resolve: `gatsby-plugin-posthog`,
      options: {
        // Specify the API key for your PostHog Project (required)
        apiKey: 'phc_362TiSyKgdQYtDzSZNEHI9tvena7mln2IkZaVfZN3bK',
        // Specify the app host if self-hosting (optional, default: https://us.i.posthog.com)
        apiHost: 'https://us.i.posthog.com',
        // Puts tracking script in the head instead of the body (optional, default: true)
        head: true,
        // Enable posthog analytics tracking during development (optional, default: false)
        isEnabledDevMode: true,
      },
    },
    // {
    //   resolve: `gatsby-plugin-google-gtag`,
    //   options: {
    //     // pluginConfig: { origin: 'https://elcri.men/__third-party-proxy' },
    //     // You can add multiple tracking ids and a pageview event will be fired for all of them.
    //     trackingIds: [
    //       'G-SMLSV8EVFV', // Google Analytics / GA
    //     ],
    //   },
    // },
    // {
    //   resolve: `gatsby-plugin-clarity`,
    //   options: {
    //     // String value for your clarity project id
    //     // Project id is found in your clarity dashboard url
    //     // https://clarity.microsoft.com/projects/view/{clarity_project_id}/
    //     clarity_project_id: 'p78rtb0hfs',
    //     // Boolean value for enabling clarity while developing
    //     // true will enable clarity tracking code on both development and production environments
    //     // false will enable clarity tracking code on production environment only
    //     enable_on_dev_env: true,
    //   },
    // },
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
  partytownProxiedURLs: [
    `https://www.googletagmanager.com/gtag/js?id=G-SMLSV8EVFV`,
    //`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2949275046149330`,
  ],
}
