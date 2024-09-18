import React from 'react'
import Navbar from '../components/navbar'
import { IntlProvider } from 'react-intl'
import Footer from '../components/Footer'
import { Script } from 'gatsby'

const Layout = ({ locale, children, path, wide }) => {
  return (
    <React.Fragment>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-SMLSV8EVFV`}
        strategy="off-main-thread"
        forward={[`gtag`]}
      />
      <Script
        id="gtag-config"
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(){ window.dataLayer.push(arguments);}
          gtag('js', new Date()); 
          gtag('config', 'G-SMLSV8EVFV', { send_page_view: false })`,
        }}
      />
      <div
        className="container is-fluid"
        style={
          wide === true ? { paddingLeft: '14px', paddingRight: '14px' } : {}
        }
      >
        <Navbar locale={locale} path={path} />
        {children}
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default Layout
