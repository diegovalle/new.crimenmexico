import React from 'react';
import Navbar from '../components/navbar';
import {IntlProvider} from 'react-intl';
import Footer from '../components/Footer';

const Layout = ({locale, children, path}) => {
  return (
    <React.Fragment>
      <div className="container is-fluid">

        <Navbar locale={locale} path={path} />
        {children}
        <Footer />

      </div>

    </React.Fragment>
  );
};

export default Layout;
