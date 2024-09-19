import React from 'react'
import {
  FaTwitterSquare,
  FaFacebookSquare,
  FaGithubSquare,
  FaEnvelope,
} from 'react-icons/fa'
import { IconContext } from 'react-icons'
import Obfuscate2 from '../components/Obfuscate'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { Script } from 'gatsby'

function Footer(props) {
  const intl = useIntl()
  return (
    <IconContext.Provider value={{ color: '#333', size: '3em' }}>
      <footer
        className="footer has-background-white-ter"
        style={{ marginTop: '5rem' }}
      >
        <hr />
        <div className="container">
          <div className="columns">
            <div className="column is-4 has-text-centered is-hidden-tablet">
              {intl.formatMessage({ id: 'author' })}:{' '}
              <a
                rel="me"
                className="title is-4 is-size-5"
                href="https://www.diegovalle.net/"
              >
                {intl.formatMessage({ id: 'name' })}
              </a>
              <hr />
              <p>
                <FormattedHTMLMessage id="Please visit" />
              </p>
            </div>
            <div className="column is-4">
              <div className="level">
                <a
                  className="level-item"
                  aria-label="Twitter"
                  rel="me"
                  href="https://twitter.com/diegovalle"
                >
                  <span className="icon icon is-large">
                    <FaTwitterSquare />
                  </span>
                  <span className="is-hidden">Twitter</span>
                </a>

                <a
                  className="level-item"
                  aria-label="Facebook"
                  rel="me"
                  href="https://facebook.com/diegovalle"
                >
                  {' '}
                  <span className="icon icon is-large">
                    <FaFacebookSquare />
                  </span>
                  <span className="is-hidden">Facebook</span>
                </a>
              </div>
            </div>
            <div className="column is-4 has-text-centered is-hidden-mobile">
              {intl.formatMessage({ id: 'author' })}:{' '}
              <a
                rel="me"
                className="title is-5 is-size-5"
                href="https://www.diegovalle.net/"
              >
                <h4
                  className="title is-5 is-size-5"
                  style={{ display: 'inline' }}
                >
                  {intl.formatMessage({ id: 'name' })}
                </h4>
              </a>
              <hr />
              <p>
                <FormattedHTMLMessage id="Please visit" />
              </p>
            </div>
            <div className="column is-4 has-text-right">
              <div className="level">
                <a
                  className="level-item"
                  aria-label="GitHub"
                  rel="me"
                  href="https://github.com/diegovalle"
                >
                  <span className="icon icon is-large">
                    <FaGithubSquare />
                  </span>
                  <span className="is-hidden">GitHub</span>
                </a>

                <Obfuscate2
                  className="level-item"
                  aria-label="Mail"
                  email="ZGllZ29AZGllZ292YWxsZS5uZXQK"
                >
                  <span className="icon icon is-large">
                    <FaEnvelope />
                  </span>
                  <span className="is-hidden">Mail</span>
                </Obfuscate2>
              </div>
            </div>
          </div>
          <p className="subtitle has-text-centered is-6">
            {intl.formatMessage({ id: '© All rights reserved' })}
          </p>
        </div>
      </footer>
    </IconContext.Provider>
  )
}

export default Footer
