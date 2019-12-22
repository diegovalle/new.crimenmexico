import React, {useState} from 'react';

import MxHexTileMap from '../components/MxHexTileMap';
import CrimeChart from '../components/CrimeCharts';
import MxHexTileMapTooltip from '../components/MxHexTileMapTooltip';
import {useIntl, FormattedHTMLMessage} from 'react-intl';

function FrontPageMap (props) {
  const intl = useIntl ();
  const [selected_state, setselected_state] = useState ('0');
  const [selected_crime, setselected_crime] = useState ('hd');

  const updateState = state => {
    setselected_state (state);
  };

  const updateCrime = crime => {
    setselected_crime (crime);
  };

  return (
    <div className="columns">
      <div id="content" className="column is-half">

        <MxHexTileMapTooltip
          selected_state={selected_state}
          updateState={updateState}
          selected_crime={selected_crime}
          updateCrime={updateCrime}
        />

      </div>
      <div className="column is-half">
        <div className="column is-half is-hidden-tablet">
          <p style={{lineHeight: '1.2rem'}}>
            <FormattedHTMLMessage id="inegi-adjusted" />
            <br />
            <FormattedHTMLMessage id="snsp-victims" />
          </p>
        </div>
        <CrimeChart
          selected_state={selected_state}
          updateState={updateState}
          selected_crime={selected_crime}
          updateCrime={updateCrime}
        />
      </div>
    </div>
  );
}

export default FrontPageMap;
