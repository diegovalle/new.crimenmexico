/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it
import React from 'react'

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
  setHeadComponents([
        <script
          async
          src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2949275046149330"
          crossOrigin="anonymous"
        ></script>
  ])
}
