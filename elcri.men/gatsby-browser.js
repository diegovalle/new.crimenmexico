/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
// import React from 'react'
// import { IntlProvider, IntlContextProvider } from 'react-intl'

// // Wraps every page in a component
// export const wrapRootElement = ({ element, props }) => {
//   const { pageContext, location } = props
//   const { intl } = pageContext

// const IntlContext = React.createContext()
// const IntlContextProvider = IntlContext.Provider
// const IntlContextConsumer = IntlContext.Consumer
//   return (
//     <IntlProvider
//       locale={intl.language}
//       defaultLocale={intl.defaultLanguage}
//       messages={intl.messages}
//     >
//       <IntlContextProvider value={intl}>{element}</IntlContextProvider>
//     </IntlProvider>
//   )
// }
import React from 'react'

export const onRouteUpdate = ({ location }) => {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const pagePath = location
    ? location.pathname + location.search + location.hash
    : undefined

  setTimeout(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: pagePath })
    }
  }, 100)

  return true
}
