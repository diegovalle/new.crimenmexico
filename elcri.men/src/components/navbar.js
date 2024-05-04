import React, { useState } from 'react'
import PropTypes from 'prop-types'
import '../assets/scss/style.scss'
import { Link } from 'gatsby'
import LLink from '../components/LLink'
import { useIntl, injectIntl, FormattedMessage } from 'react-intl'
import NoPrefetchLink from '../components/NoPrefetchLink'

import Language from '../components/Language'

const NavbarBurger = props => (
  <a
    role="button"
    className={`burger navbar-burger ${props.active ? 'is-active' : ''}`}
    aria-label="menu"
    aria-expanded="false"
    data-target="navbarBasicExample"
    onClick={props.toggleMenu}
  >
    <span />
    <span />
    <span />
  </a>
)

const Navbar = ({ locale, path }) => {
  const [activeMenu, setActiveMenu] = useState(false)

  const intl = useIntl()
  const toggleMenu = () => {
    setActiveMenu(!activeMenu)
  }
  const colorMenu = (title, path) => {
    if (path.match(title)) {
      return 'has-background-grey-dark has-text-white-ter has-text-weight-bold active'
    } else {
      return ''
    }
  }

  return (
    <nav
      className="navbar is-white is-size-5 has-text-weight-normal"
      role="navigation"
      aria-label="main navigation"
      style={{ fontFamily: 'Source Sans Pro' }}
    >
      <div className="navbar-brand">
        {/* <a className="navbar-item" href="https://elcri.men">
            <img
              src={hexgrid}
              width="50"
              height="28"
            /> <span style={{fontFamily: "Source Sans Pro", fontSize: "20px"}}>ELCRI.MEN</span>
          </a> */}

        <NavbarBurger active={activeMenu} toggleMenu={toggleMenu} />
      </div>

      <div
        id="elcrimennavbar"
        className={`navbar-menu ${activeMenu ? 'is-active' : ''}`}
      >
        <div
          className="navbar-start"
          style={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <LLink
            locale={locale}
            className="navbar-item"
            to="/"
            activeClassName={
              'has-background-grey-dark has-text-white-ter has-text-weight-bold active'
            }
          >
            {intl.formatMessage({ id: 'home' })}
          </LLink>

          <div className="navbar-item has-dropdown is-hoverable is-boxed">
            <div
              style={{ borderRadius: '0 0 5px 5px' }}
              className={
                !activeMenu
                  ? 'navbar-link ' +
                    colorMenu(
                      /estados|state-crime|homicidios-mujeres|female-homicides|feminicidio|feminicides|estados-diferencia|state-changes|estados-ranking|state-ranking/g,
                      path
                    )
                  : 'navbar-link '
              }
            >
              {intl.formatMessage({ id: 'states' })}
            </div>
            <div className="navbar-dropdown is-size-6">
              <LLink
                locale={locale}
                className="navbar-item"
                to="/estados/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'time_series' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/homicidios-mujeres/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'female_homicides' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/feminicidio/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'feminicides' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/estados-diferencia/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'changes' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/estados-ranking/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'ranking' })}
              </LLink>
            </div>
          </div>

          <div className="navbar-item has-dropdown is-hoverable is-boxed">
            <div
              style={{ borderRadius: '0 0 5px 5px' }}
              className={
                !activeMenu
                  ? 'navbar-link ' +
                    colorMenu(
                      /municipios|municipios-mas-violentos|most-violent-cities|turismo|tourism/g,
                      path
                    )
                  : 'navbar-link '
              }
            >
              {intl.formatMessage({ id: 'municipios' })}
            </div>

            <div className="navbar-dropdown  is-size-6">
              <LLink
                locale={locale}
                className="navbar-item"
                to="/municipios/"
                partiallyActive={false}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'mun_time_series' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/municipios-mas-violentos/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'top50' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/turismo/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'Destinos Turísticos' })}
              </LLink>
            </div>
          </div>

          <div className="navbar-item has-dropdown is-hoverable is-boxed">
            <div
              style={{ borderRadius: '0 0 5px 5px' }}
              className={
                !activeMenu
                  ? 'navbar-link ' +
                    colorMenu(
                      /mapa-de-delincuencia|violence-map|cluster-map|mapa-clusters/g,
                      path
                    )
                  : 'navbar-link '
              }
            >
              {intl.formatMessage({ id: 'Mapas' })}
            </div>

            <div className="navbar-dropdown  is-size-6">
              <a
                className={
                  'navbar-item ' +
                  colorMenu(/^\/mapa-de-delincuencia|violence-map/g, path)
                }
                href={
                  locale === 'es'
                    ? '/mapa-de-delincuencia/'
                    : '/en/violence-map/'
                }
              >
                {intl.formatMessage({ id: 'crime_map' })}
              </a>
              <a
                className={
                  'navbar-item ' +
                  colorMenu(/^\/mapa-clusters|cluster-map/g, path)
                }
                href={locale === 'es' ? '/mapa-clusters/' : '/en/cluster-map/'}
              >
                {intl.formatMessage({ id: 'cluster_map' })}
              </a>
            </div>
          </div>

          <div className="navbar-item has-dropdown is-hoverable is-boxed">
            <div
              style={{ borderRadius: '0 0 5px 5px' }}
              className={
                !activeMenu
                  ? 'navbar-link ' +
                    colorMenu(
                      /tendencias|trends|envipe|underreporting-crime|anomalias|anomalies|infograficas|infographics|tendencias_estado|trends_state/g,
                      path
                    )
                  : 'navbar-link '
              }
            >
              {intl.formatMessage({ id: 'statistics' })}
            </div>

            <div className="navbar-dropdown  is-size-6">
              <LLink
                locale={locale}
                className="navbar-item"
                to="/anomalias/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'anomalies' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/tendencias/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'trends' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/tendencias-estado/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'trends_state' })}
              </LLink>
              <LLink
                locale={locale}
                className="navbar-item"
                to="/envipe/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'underreporting' })}
              </LLink>
              <hr className="navbar-divider" />
              <LLink
                locale={locale}
                className="navbar-item"
                to="/infograficas/"
                partiallyActive={true}
                activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
              >
                {intl.formatMessage({ id: 'infographics' })}
              </LLink>
            </div>
          </div>

          <LLink
            locale={locale}
            className="navbar-item"
            to="/acerca/"
            partiallyActive={true}
            activeClassName="has-background-grey-dark has-text-white-ter has-text-weight-bold active"
          >
            {intl.formatMessage({ id: 'about' })}
          </LLink>
          <div className="navbar-item">
            <Language locale={locale} path={path} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
