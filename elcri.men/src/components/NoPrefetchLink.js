import React from 'react'
import { Link } from 'gatsby'

function NoPrefetchLink({ children, to, className, activeClassName, prefetch, ...rest }) {
  if (!prefetch) {
    return <a href={to} {...rest} className={className }>{children}</a>
  }
  return <Link to={to} {...rest}>{children}</Link>
}

NoPrefetchLink.defaultProps = {
  prefetch: true
}

export default NoPrefetchLink
