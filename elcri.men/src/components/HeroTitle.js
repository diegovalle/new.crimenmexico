import React from 'react';

export default function HeroTitle (props) {
  return (
    <React.Fragment>
      {/* <hr className="is-hidden-mobile" /> */}
      <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered is-mobile">
              <div className="column is-full">
                <h1 className="title is-size-4-mobile has-text-centered-mobile ">
                  {props.children}
                </h1>
              </div>

            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
