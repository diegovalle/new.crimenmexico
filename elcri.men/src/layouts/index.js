import React from 'react';
import {IntlProvider} from 'react-intl';


import en from '../i18n/en.json';
import es from '../i18n/es.json';

const messages = {es, en};

const Layout = ({pageContext, children}) => {
  //const {children} = this.props;
  return (
    <IntlProvider locale={pageContext.locale}  messages={messages[pageContext.locale]}>
      {children}
    </IntlProvider>
  );
};

export default Layout