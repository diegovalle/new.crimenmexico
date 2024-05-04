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
const {locales, routes} = require ('./src/i18n');
const files = require('./src/data/infographics_filenames.json');

exports.onCreatePage = ({page, actions}) => {
  const {createPage, deletePage} = actions;

  return new Promise (resolve => {
    deletePage (page);

    Object.keys (locales).map (lang => {
      const localizedPath = locales[lang].default
        ? page.path
        : locales[lang].path + routes.routes[page.path];
      return createPage ({
        ...page,
        path: localizedPath,
        context: {
          locale: lang,
          fname_infographic: lang == "es" ? files.ies[0] : files.ien[0],
          fname_mun: lang == "es" ? files.mes[0] : files.men[0],
        },
      });
    });

    resolve ();
  });
};
