import React from 'react';
import {
  FaTwitterSquare,
  FaFacebookSquare,
  FaGithubSquare,
  FaEnvelope,
} from 'react-icons/fa';
import {IconContext} from 'react-icons';
import Obfuscate2 from '../components/Obfuscate';
import {useIntl, FormattedHTMLMessage} from 'react-intl';

function Footer (props) {
  const intl = useIntl ();
  return (
    <IconContext.Provider value={{color: '#333', size: '3rem'}}>
      <footer
        className="footer has-background-white-ter"
        style={{marginTop: '5rem'}}
      >
        <hr />
        <div className="container">
          <div className="columns">
            <div className="column is-4 has-text-centered is-hidden-tablet">
               {intl.formatMessage ({id: 'author'})}:
              {' '}
              <a
                className="title is-4 is-size-5"
                href="https://www.diegovalle.net/"
              >
                 {intl.formatMessage ({id: 'name'})}
              </a>
              <hr />
              <p>
                 <FormattedHTMLMessage id='Please visit' />
              </p>
            </div>
            <div className="column is-4">
              <div className="level">

                <a
                  className="level-item"
                  aria-label="Twitter"
                  href="https://twitter.com/diegovalle"
                >
                  <span class="icon icon is-large"><FaTwitterSquare /></span>
                  <span className="is-hidden">Twitter</span>
                </a>

                <a
                  className="level-item"
                  aria-label="Facebook"
                  href="https://facebook.com/diegovalle"
                >
                  {' '}
                  <span class="icon icon is-large"><FaFacebookSquare /></span>
                  <span className="is-hidden">Facebook</span>
                </a>

              </div>
            </div>
            <div className="column is-4 has-text-centered is-hidden-mobile">
              {intl.formatMessage ({id: 'author'})}:
              {' '}
              <a
                className="title is-5 is-size-5"
                href="https://www.diegovalle.net/"
              >
                 {intl.formatMessage ({id: 'name'})}
              </a>
              <hr />
              <p>
                <FormattedHTMLMessage id='Please visit' />
              </p>
            </div>
            <div className="column is-4 has-text-right">
              <div className="level">

                <a
                  className="level-item"
                  aria-label="GitHub"
                  href="https://github.com/diegovalle"
                >
                  <span class="icon icon is-large"><FaGithubSquare /></span>
                  <span className="is-hidden">GitHub</span>
                </a>

                <Obfuscate2
                  className="level-item"
                  aria-label="Mail"
                  email="ZGllZ29AZGllZ292YWxsZS5uZXQK"
                  //href="&#109;ailt&#111;&#58;die%&#54;7o&#64;di&#37;&#54;5%6&#55;o%76%61l%6Ce&#46;net"
                >
                  <span class="icon icon is-large"><FaEnvelope /></span>
                  <span className="is-hidden">Mail</span>
                </Obfuscate2>

              </div>
            </div>
          </div>
          <p className="subtitle has-text-centered is-6">
            {intl.formatMessage ({id: '© All rights reserved'})}
          </p>
        </div>
      </footer>
    </IconContext.Provider>
  );
}

export default Footer;
