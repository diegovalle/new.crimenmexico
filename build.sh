#!/bin/bash
set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
EXPORT=crimenmexico.diegovalle.net/data
SQLITE3=sqlite3

# Download the snsp data and create a sqlite db with the data
. ~/.virtualenvs/victimas/bin/activate
rm -rf downloader/page-checksums/*.md5
rm -rf downloader/pdf/*.pdf && rm -rf pdf/*.md5
rm -rf downloader/victima-csv/*.csv
find downloader/snsp-data -type f -not -name '.gitignore' | xargs -0 rm -rf
#cd downloader && python scrape.py && cd ..

# Statistics with R
#cd R && Rscript run_all.R && cd ..

# Move the json files with the chart data to the website directory
cp R/json/*.json crimenmexico.diegovalle.net/assets/json/

# Create a geojson with the lat and lng of Mexican municipios
rm -rf R/interactive-map/municipios-centroids.json
cd R/interactive-map/ && ogr2ogr -f "GeoJSON" municipios-centroids.json municipios-centroids.vrt && cd ../..
cp R/interactive-map/municipios* crimenmexico.diegovalle.net/assets/json

# Move image to the website directory
# but only the ones for this month
cp "*infographic_$(date +%b | awk '{print tolower($0)}')*.png" crimenmexico.diegovalle.net/en/images/infographics/fulls/
cp "*_es_$(LC_ALL=es_ES.utf8 date +%b | awk '{print tolower($0)}')*.png" crimenmexico.diegovalle.net/es/images/infographics/fulls/
cd infographics && python infographics.py && cd ..


# Export the sqlite database to csv and compress
if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/$EXPORT/fuero-comun-estados.csv.gz ]]; then
    echo "exporting $SCRIPTPATH/$EXPORT/fuero-comun-estados.csv.gz"
  $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header 'select estados_fuero_comun.state_code, state, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, estados_fuero_comun.date,  count, population from estados_fuero_comun NATURAL JOIN modalidad_states NATURAL JOIN tipo_states  NATURAL JOIN subtipo_states NATURAL JOIN state_names NATURAL JOIN population_states;' | gzip > "$SCRIPTPATH"/$EXPORT/fuero-comun-estados.csv.gz
fi

if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/$EXPORT/fuero-comun-municipios.csv.gz ]]; then
    echo "exporting $SCRIPTPATH/$EXPORT/fuero-comun-municipios.csv.gz"
  $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header 'SELECT municipios_fuero_comun.state_code, state, municipios_fuero_comun.mun_code, municipio, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, municipios_fuero_comun.date, count, population FROM municipios_fuero_comun NATURAL JOIN modalidad_municipios NATURAL JOIN  tipo_municipios NATURAL JOIN subtipo_municipios NATURAL JOIN state_names NATURAL JOIN municipio_names NATURAL JOIN  population_municipios;' | gzip  > "$SCRIPTPATH"/$EXPORT/fuero-comun-municipios.csv.gz
fi

if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/$EXPORT/victimas.csv.gz ]]; then
    echo "exporting $SCRIPTPATH/$EXPORT/victimas.csv.gz"
  $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header 'select state, state_code, modalidad, tipo, subtipo, date, sum(count) as count, sum(population) as population, fuero, "victimas" as type from victimas group by state, state_code, modalidad, tipo, subtipo, date, fuero' | gzip  > "$SCRIPTPATH"/$EXPORT/victimas.csv.gz
fi
