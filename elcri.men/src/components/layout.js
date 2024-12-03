import React from 'react'
import Navbar from '../components/navbar'
// import { IntlProvider } from 'react-intl'
import Footer from '../components/Footer'
// import { Script } from 'gatsby'
import { Partytown } from '@builder.io/partytown/react'

const Layout = (props) => {
  const { locale, children, path, wide } = props
  return (
    <React.Fragment>
      <Partytown key="partytown" forward={['gtag']} />
      <script
        key="google-analytics"
        type="text/partytown"
        //src={`https://www.googletagmanager.com/gtag/js?id=G-SMLSV8EVFV`}
        src="/piggy"
      />
      <script
        key="google-analytics-config"
        type="text/partytown"
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
