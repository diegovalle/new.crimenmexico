/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
// exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
//   if (stage === "build-html") {
//     actions.setWebpackConfig({
//       module: {
//         rules: [
//           {
//             test: /semiotic/,
//             use: loaders.null(),
//           },
//         ],
//       },
//     })
//   }
// }
// const path = require(`path`)

// pages locale
// exports.onCreatePage = ({ page, actions }) => {
//     const { createPage, deletePage } = actions
//     deletePage(page)
//     // You can access the variable "locale" in your page queries now
//     createPage({
//         ...page,
//         context: {
//             ...page.context,
//             locale: page.context.intl.language,
//         },
//     })
// }
//const locales = require ('./src/constants/locales');
const { locales, routes } = require('./src/i18n')
const files = require('./src/data/infographics_filenames.json')

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  return new Promise((resolve) => {
    let localizedPath

    deletePage(page)
    if (!page.path.match(/^\/404\/$/) || !page.path.startsWith('/es/')) {
      if (locales[page.context.language]?.default) {
        localizedPath = page.path
      } else {
        if (routes.routes.hasOwnProperty(page.context.intl.originalPath)) {
          localizedPath = '/en' + routes.routes[page.context.intl.originalPath]
        } else {
          throw new Error('Bad localized Path')
        }
      }

      createPage({
        ...page,
        path: localizedPath,
        context: {
          ...page.context,
          locale: page.context.language,
          fname_infographic:
            page.context.language === 'es' ? files.ies[0] : files.ien[0],
          fname_mun:
            page.context.language === 'es' ? files.mes[0] : files.men[0],
        },
      })
    }
    //});

    resolve()
  })
}
