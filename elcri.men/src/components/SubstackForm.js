// components/SubstackForm.js
import React from 'react'
import { useEffect } from 'react'

export default function SubstackForm(props) {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl">
      <iframe
        src={props.intl.formatMessage({ id: 'substack_embed' })}
        width="100%"
        height="150"
        style={{
          border: '1px solid #888',
          borderRadius: '12px',
          background: 'white',
        }}
        frameBorder="0"
        scrolling="no"
        title="Substack Signup"
      ></iframe>
    </div>
  )
}
