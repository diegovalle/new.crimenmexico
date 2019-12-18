import React from 'react'
import Layout from '../components/layout'

const NotFoundPage = (props) => (
  <Layout locale={props.pageContext.locale} path={props.location.pathname}>
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export default NotFoundPage
