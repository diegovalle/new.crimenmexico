/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it
import React from 'react'

export const onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const headComponents = getHeadComponents();
  if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  }
  const result = headComponents.find((item) => item?.props && Object.hasOwn(item.props, 'hrefLang'));
  // Add the adsense script only to the non-English pages
  // if hrefLang is not 'en' then it's in English (sound weird, I know)
  if (result?.props?.hrefLang !== "en") {
    return replaceHeadComponents([
      ...headComponents,
      <script
        async
        key="google-ads"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2949275046149330"
        crossOrigin="anonymous"
      ></script>,
    ]);
  } else {
    return replaceHeadComponents([
      ...headComponents,
    ]);
  }

};
/* 
export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
  setHeadComponents([
    <script
      async
      key="adsense-script"
      src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2949275046149330"
      crossOrigin="anonymous"
    ></script>,
  ])
}

// Wraps every page in a component
/* export const wrapPageElement = ({ element, props }) => {
  console.log(props)
  return <IntlProvider>{element}</IntlProvider>
} */
