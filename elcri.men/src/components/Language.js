import React from 'react';
import {useIntl, injectIntl, FormattedMessage} from 'react-intl';
import {routes, routes_inverted} from '../../src/i18n';
import us_flag from '../assets/images/us.png';
import mx_flag from '../assets/images/mx.png';

const Language = props => {
  const intl = useIntl ();
  return (
    <React.Fragment>
      <a
        style={{color: '#0a0a0a'}}
        href={
          props.locale === 'es'
            ? '/en' + routes.routes[props.path]
            : routes.routes_inverted[props.path]
        }
      >
        <img
          src={props.locale === 'es' ? us_flag : mx_flag }
          width="24"
          height="16"
          alt="English Version"
        />
        {intl.formatMessage ({id: 'altlang'})}
      </a>
    </React.Fragment>
  );
};

export default injectIntl (Language);
