import React from 'react';
import Navbar from '../components/navbar';
import {IntlProvider} from 'react-intl';
import Footer from '../components/Footer';

const Layout = ({locale, children, path, wide}) => {
  return (
    <React.Fragment>
      <div
        className="container is-fluid"
        style={wide === true ? {paddingLeft: '14px', paddingRight: '14px'} : {}}
      >

        <Navbar locale={locale} path={path} />
        {children}
        <Footer />

      </div>

    </React.Fragment>
  );
};

export default Layout;
