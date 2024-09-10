import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'
import SmallMultiple from '../components/SmallMultiple'
import HeroTitle from '../components/HeroTitle'
import SEO from '../components/SEO'
// import AdSense from 'react-adsense'
import TextColumn from '../components/TextColumn'
import { useIntl } from 'react-intl'
import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import { groupBy, map, reduce, sortBy, filter, mapValues } from 'lodash-es'
import {
  YYYYmmddCollectionToDate,
  YYYYmmddToDate15,
} from '../components/utils.js'

import MxAnomalyMapTooltip from '../components/MxAnomalyMapTooltip'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import social_image from '../assets/images/social/social-anomalias.png'
import social_image_en from '../assets/images/social/social-anomalias_en.png'

function Anomalies(props) {
  const [data, setdata] = useState(null)

  const orderStates = (data) => {
    const groups = groupBy(data, function (x) {
      return x.name
    })
    const byrate = map(groups, function (g, key) {
      return {
        name: key,
        rate: reduce(
          g,
          function (m, x) {
            return x.rate === null ? m : x.rate
          },
          0
        ),
      }
    })
    const ordered = map(sortBy(byrate, 'rate'), 'name').reverse()
    return ordered
  }

  const filterCrime = (data, name) => {
    if (data.length === 2) {
      data = [filter(data[0], { name: name }), filter(data[1], { name: name })]
      if (typeof data[0][0].date !== 'object') {
        data[0] = YYYYmmddCollectionToDate(data[0], 'date')
        data[1] = YYYYmmddCollectionToDate(data[1], 'date')
      }
    } else {
      data = filter(data, { name: name })
      if (typeof data[0].date !== 'object')
        data = YYYYmmddCollectionToDate(data, 'date')
    }

    return data
  }

  useEffect(() => {
    fetch('/elcrimen-json/anomalies.json')
      .then((response) => response.json())
      .then((responseJSON) => {
        responseJSON = mapValues(responseJSON, function (x) {
          return filter(x, function (o) {
            return typeof o.rate !== 'undefined'
          })
        })
        setdata(responseJSON)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const formatCrime = (crime) => {
    switch (crime) {
      case 'hom':
        return intl.formatMessage({ id: 'Homicidio Intencional' })
      case 'rvcv':
        return intl.formatMessage({ id: 'Robo de Coche c/v' })
      case 'rvsv':
        return intl.formatMessage({ id: 'Robo de Coche s/v' })
      case 'ext':
        return intl.formatMessage({ id: 'Extorsión' })
      case 'reos':
        return intl.formatMessage({ id: 'Fuga de Reos' })
      case 'lesions':
        return intl.formatMessage({ id: 'Lesiones' })
      case 'kidnapping':
        return intl.formatMessage({ id: 'Secuestro' })
      default:
        break
    }
  }

  const tab = (data) => {
    return map(data, (muns, crime) => {
      if (muns.length) {
        return <Tab key={crime}>{formatCrime(crime)}</Tab>
      }
    })
  }

  const tabPanel = (data) => {
    return map(data, (muns, crime) => {
      if (muns.length) {
        return (
          <TabPanel key={crime}>
            <div className="columns" style={{ paddingTop: '1rem' }} key={crime}>
              <div className="column is-three-fourths" key={crime}>
                <div
                  className="columns is-multiline"
                  id="small-multiples"
                  key={crime}
                >
                  {orderStates(data[crime]).map((mun, i) => (
                    <div
                      className="column is-half-desktop is-full-tablet"
                      key={i}
                    >
                      <figure className="image is-2by1" key={i}>
                        <div className=" has-ratio" key={i}>
                          <SmallMultiple
                            data={filterCrime(data[crime], mun)}
                            key={i}
                            formatData={(data) => [data]}
                            y={'rate'}
                            title={mun}
                          />
                        </div>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>

              <div className="column is-one-fourth has-ratio">
                <figure className="image is-square">
                  <div className=" has-ratio">
                    <MxAnomalyMapTooltip crime={crime} />
                  </div>
                </figure>
              </div>
            </div>
          </TabPanel>
        )
      }
    })
  }
  const intl = useIntl()
  //intl.locale === 'es' ? timeFormatDefaultLocale(dateLoc.es_MX) : null
  const last_date = useLastMonth()

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <Helmet />
      <SEO
        title={intl.formatMessage({ id: 'title_anomalies' })}
        description={intl.formatMessage({ id: 'desc_anomalies' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div className="container is-fullhd">
        <HeroTitle>
          {intl.formatMessage({
            id: 'All municipios with a crime rate spike or a sharp decrease during',
          })}{' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es
            : last_date.month_long_en}{' '}
          <FormattedDate
            value={YYYYmmddToDate15(last_date.iso_mid)}
            year="numeric"
          />
        </HeroTitle>

        {/* <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        /> */}

        <section id="anomaliesTabs">
          {data ? (
            <Tabs defaultIndex={0}>
              <TabList>{tab(data)}</TabList>
              {tabPanel(data)}
            </Tabs>
          ) : (
            <Tabs defaultIndex={0}>
              <TabList>
                {[
                  intl.formatMessage({ id: 'Homicidio Intencional' }),
                  intl.formatMessage({ id: 'Robo de Coche c/v' }),
                  intl.formatMessage({ id: 'Robo de Coche s/v' }),
                  intl.formatMessage({ id: 'Lesiones' }),
                  intl.formatMessage({ id: 'Extorsión' }),
                ].map((item, i) => (
                  <Tab key={i}>
                    <span
                      className="has-background-skeleton"
                      style={{ color: 'transparent' }}
                    >
                      {item}
                    </span>
                  </Tab>
                ))}
              </TabList>
              <TabPanel key="tab1">
                <div className="columns" style={{ paddingTop: '1rem' }}>
                  <div className="column is-three-fourths">
                    <div className="columns is-multiline" id="small-multiples">
                      <div className="column is-half-desktop is-full-tablet">
                        <figure className="image is-2by1">
                          <div className="has-background-skeleton has-ratio"></div>
                        </figure>
                      </div>
                      <div className="column is-half-desktop is-full-tablet">
                        <figure className="image is-2by1">
                          <div className="has-background-skeleton has-ratio"></div>
                        </figure>
                      </div>
                    </div>
                  </div>

                  <div className="column is-one-fourth has-ratio">
                    <figure className="image is-square">
                      <div className=" has-ratio"> </div>
                    </figure>
                  </div>
                </div>
              </TabPanel>
              <TabPanel key="tab2"></TabPanel>
              <TabPanel key="tab3"></TabPanel>
              <TabPanel key="tab4"></TabPanel>
              <TabPanel key="tab5"></TabPanel>
            </Tabs>
          )}
        </section>

        {/* <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        /> */}

        <hr />
        <TextColumn>
          <FormattedHTMLMessage id="anomalies_text" />
        </TextColumn>

        {/* <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        /> */}
      </div>
    </Layout>
  )
}

export default Anomalies
