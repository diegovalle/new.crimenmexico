#!/bin/bash

# Download files with wget, overwriting existing files
wget -O states_females_sm.json https://elcri.men/elcrimen-json/states_females_sm.json
wget -O states_females_total.json https://elcri.men/elcrimen-json/states_females_total.json
wget -O states_feminicide_sm.json https://elcri.men/elcrimen-json/states_feminicide_sm.json
wget -O states_feminicide_total.json https://elcri.men/elcrimen-json/states_feminicide_total.json
wget -O states_hexgrid.json https://elcri.men/elcrimen-json/states_hexgrid.json
wget -O states_national.json https://elcri.men/elcrimen-json/states_national.json
wget -O states_sm.json https://elcri.men/elcrimen-json/states_sm.json
wget -O states_yearly_rates.json https://elcri.men/elcrimen-json/states_yearly_rates.json
wget -O top-municipios.json https://elcri.men/elcrimen-json/top-municipios.json
wget -O tourists.json https://elcri.men/elcrimen-json/tourists.json
wget -O national_1990.json https://elcri.men/elcrimen-json/national_1990.json
wget -O states2.json https://elcri.men/elcrimen-json/states2.json
wget -O national_diff.json https://elcri.men/elcrimen-json/national_diff.json
wget -O anomalies.json https://elcri.men/elcrimen-json/anomalies.json
wget -O cities.json https://elcri.men/elcrimen-json/cities.json
wget -O municipios-centroids.json https://elcri.men/elcrimen-json/municipios-centroids.json
wget -O lisa.json https://elcri.men/elcrimen-json/lisa.json
wget -O municipios.json https://elcri.men/elcrimen-json/municipios.json


# Print completion message
echo "Download complete. Files saved in elcrimen-json directory."
