import React from 'react';

export default function HeroTitle (props) {
  return (
    <React.Fragment>
      {/* <hr className="is-hidden-mobile" /> */}
      <section class="hero">
        <div class="hero-body">
          <div class="container">
            <div className="columns is-centered is-mobile">
              <div className="column is-full">
                <h1 class="title is-size-4-mobile has-text-centered-mobile ">
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
