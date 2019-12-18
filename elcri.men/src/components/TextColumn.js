import React from 'react';

class TextColumn extends React.Component {
  constructor (props) {
    super (props);
  }

  render () {
    const {children} = this.props;

    return (
      <section id="cifras">
        <div className="columns">
          <div className="column is-offset-3 is-half-desktop is-two-third-fullhd">
            <div className="content is-medium">
              {children}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default TextColumn;
