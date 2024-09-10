import React, { useState, useEffect } from 'react'

import Layout from '../components/layout'
import { scaleLinear } from '@vx/scale'
import HeroTitle from '../components/HeroTitle'
import BarToolTip from '../components/BarToolTip'
import SEO from '../components/SEO'
import TextColumn from '../components/TextColumn'
// import AdSense from 'react-adsense'
import { useIntl } from 'react-intl'
import { FormattedHTMLMessage, FormattedDate } from 'react-intl'
import useLastMonth from '../components/LastMonth'
import TourismMapTooltip from '../components/TourismMap/TourismMapTooltip'
import { minBy, maxBy } from 'lodash-es'
import LazyLoad from 'react-lazyload'
import social_image from '../assets/images/social/social-turismo.png'
import social_image_en from '../assets/images/social/social-turismo_en.png'
import {YYYYmmddToDate15} from '../components/utils.js'

function MostViolent(props) {
  const [data, setdata] = useState(null)
  const [colorScale, setColorScale] = useState(() => null)

  useEffect(() => {
    fetch('/elcrimen-json/tourists.json')
      .then(response => response.json())
      .then(responseJSON => {
        for (var i = 0; i < responseJSON.length; i++) {
          responseJSON[i].name = responseJSON[i].name.replace(
            'BENITO JUÁREZ, QROO',
            'CANCÚN, QROO'
          )
          responseJSON[i].name = responseJSON[i].name.replace(
            'BAHÍA DE BANDERAS, NAY',
            'PUNTA MITA, NAY'
          )
          responseJSON[i].name = responseJSON[i].name.replace(
            'ZIHUATANEJO DE AZUETA, GRO',
            'ZIHUATANEJO, GRO'
          )
          responseJSON[i].name = responseJSON[i].name.replace(
            'SAN PEDRO MIXTEPEC, OAX',
            'PUERTO ESCONDIDO, OAX'
          )
        }
        let max_rate = maxBy(responseJSON, function(o) {
          return o.rate
        })['rate']
        let min_rate = minBy(responseJSON, function(o) {
          return o.rate
        })['rate']
        const colorScale2 = scaleLinear({
          range: ['#4575b4', '#ffffbf', '#d73027'],
          domain: [min_rate, 25, max_rate >= 100 ? 100 : max_rate],
        })
        setColorScale(() => colorScale2)
        setdata(responseJSON)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const chartHeight = 4235
  const intl = useIntl()
  const last_date = useLastMonth()

  return (
    <Layout locale={props.pageContext.locale} path={props.location.pathname}>
      <SEO
        title={intl.formatMessage({ id: 'title_tourism' })}
        description={intl.formatMessage({ id: 'desc_tourism' })}
        socialImage={
          props.pageContext.locale === 'es' ? social_image : social_image_en
        }
        path={props.location.pathname}
        lang={props.pageContext.locale}
      />
      <div>
        <HeroTitle>
          {intl.formatMessage({ id: 'Destinos turísticos más violentos de' })}{' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es6
            : last_date.month_long_en6}{' '}
          <FormattedDate value={YYYYmmddToDate15(last_date.iso_mid6)} year="numeric" />{' '}
          {intl.formatMessage({ id: 'to' })}{' '}
          {props.pageContext.locale === 'es'
            ? last_date.month_long_es
            : last_date.month_long_en}{' '}
          <FormattedDate value={YYYYmmddToDate15(last_date.iso_mid)} year="numeric" />
        </HeroTitle>

        {/* <AdSense.Google
          client="ca-pub-2949275046149330"
          slot="8649980552"
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        /> */}

        <div className="container is-fullhd">
          <div className="columns is-centered">
            <div className="column is-8">
              <div>
                <figure className="image is-square is-5by4-mobile-square">
                  {data ? (
                    <div className="has-ratio">
                      <TourismMapTooltip data={data} />{' '}
                    </div>
                  ) : (
                    <div className="has-ratio">
                      <div className="is-hidden-desktop columns is-mobile is-centered">
                        <div className="box">
                          <div role="status" className="circle-spin-2"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </figure>
              </div>
            </div>
          </div>

          <hr style={{ backgroundColor: '#fff' }} />
          {/* <AdSense.Google
            client="ca-pub-2949275046149330"
            slot="8649980552"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          /> */}

          <TextColumn>
            <p>
              <FormattedHTMLMessage id="tourism_text" />
            </p>
          </TextColumn>

          <div className="columns is-centered">
            <div className="column is-8-desktop is-full-mobile is-full-tablet">
              <div style={{ height: chartHeight + 80 }}>
                <LazyLoad height={440} once offset={200}>
                  {data ? (
                    <BarToolTip
                      data={data}
                      height={chartHeight}
                      scaleColor={colorScale}
                    />
                  ) : (
                    <div style={{ height: chartHeight + 80 }}>
                      <div className="is-hidden-desktop columns is-mobile is-centered">
                        <div className="box">
                          <div role="status" className="circle-spin-2"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </LazyLoad>
              </div>
            </div>
          </div>
        </div>
        <hr />

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

export default MostViolent
