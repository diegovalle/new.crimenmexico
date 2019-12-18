import React from 'react';
import {Link} from 'gatsby';

import {routes} from '../../src/i18n';

const LLink = ({locale, children, to, prefetch, ...props}) => {
  if (!prefetch) {
    return <a href={locale === "es" ? to : "/en/" + routes.routes[to]} {...props}>{children}</a>;
  }
  return <Link to={locale === "es" ? to : "en/" + routes.routes[to]} {...props}>{children}</Link>;
};

LLink.defaultProps = {
  prefetch: true,
};
export default LLink;
