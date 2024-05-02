import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import Layout from '../components/layout'
import SmallMultiple from '../components/SmallMultiple'
import HeroTitle from '../components/HeroTitle'
import BarToolTip from '../components/BarToolTip'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
import AdSense from 'react-adsense'
import { useIntl, injectIntl, FormattedMessage } from 'react-intl'
import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import social_image from '../assets/images/social/social-top50.png'
import social_image_en from '../assets/images/social/social-top50_en.png'

function MostViolent(props) {
  const [data, setdata] = useState(null)

  useEffect(() => {
    fetch('/elcrimen-json/top-municipios.json')
      .then(response => response.json())
      .then(responseJSON => {
        setdata(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const chartHeight = 2720
  const intl = useIntl()
  const last_date = useLastMonth()

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage({ id: 'title_top' })}
        description={intl.formatMessage({ id: 'desc_top' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div>
        <HeroTitle>
          {intl.formatMessage({ id: 'Most violent municipios from' })}{' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es6
            : last_date.month_long_en6}{' '}
          <FormattedDate value={new Date(last_date.iso_mid6)} year="numeric" />{' '}
          {intl.formatMessage({ id: 'to' })}{' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es
            : last_date.month_long_en}{' '}
          <FormattedDate value={new Date(last_date.iso_mid)} year="numeric" />
        </HeroTitle>

        <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        />

        <div className="container is-fullhd">
          <div className="columns is-centered">
            <div className="column is-8-desktop is-full-mobile is-full-tablet">
              {data ? (
                <div style={{ height: chartHeight + 80 }}>
                  <BarToolTip data={data} height={chartHeight} />
                </div>
              ) : (
                <div style={{ height: chartHeight + 80 }}>
                  <div class="is-hidden-desktop columns is-mobile is-centered">
                  <div class="box">
                    <div
                      role="status"
                      className="circle-spin-2"
                    ></div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        />

        <hr />
        <TextColumn>
          <p>
            <FormattedHTMLMessage id="top50_text" />
          </p>
        </TextColumn>

        <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        />
      </div>
    </Layout>
  )
}

export default MostViolent
