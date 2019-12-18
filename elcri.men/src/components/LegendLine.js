import React from 'react';

export default function HeroTitle (props) {
  return (
    <React.Fragment>
      <span className={props.class}>
        <span className="has-text-weight-bold">—</span>
        {props.children}
      </span>
      <br />
    </React.Fragment>
  );
}
