#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
EXPORT=crimenmexico.diegovalle.net/data
SQLITE3=sqlite3

#Download INEGI homicide data for the national chart in index.html
cd R/data && ./inegi.sh && cd ../..

# Download the snsp data and create a sqlite db with the data
. ~/.virtualenvs/crimenmexico/bin/activate
rm -rf downloader/page-checksums/*.md5
rm -rf downloader/pdf/*.pdf && rm -rf pdf/*.md5
rm -rf downloader/victimas-csv/*.csv
find downloader/snsp-data -type f -not -name '.gitignore' -exec rm -rf "{}" \;
if [ -f db/crimenmexico.db ]
then
  rm db/crimenmexico.db
fi
sqlite3 db/crimenmexico.db < downloader/meta/sql.sql
echo "Downloading data"
cd downloader && python scrape.py && cd ..

# Statistics with R
echo "Starting statistical analysis"
cd R && Rscript run_all.R && cd ..
echo "Finished R script"
# Convert the infographics R created to png and optimize for the web
for filename in R/graphs/*.svg; do
    if [ ! -f "R/graphs/$(basename "$filename" .svg).png" ]
    then
        echo "Converting $filename"
        convert "$filename" R/graphs/"$(basename "$filename" .svg)".png
        optipng -quiet R/graphs/"$(basename "$filename" .svg)".png
    fi
done



# Move the json files with the chart data to the website directory
cp R/json/*.json crimenmexico.diegovalle.net/assets/json/

# Create a geojson with the lat and lng of Mexican municipios
echo "Converting the municipio centroids to GeoJSON"
if [ -f R/interactive-map/municipios-centroids.json ]
then
    rm R/interactive-map/municipios-centroids.json
fi
cd R/interactive-map/ && ogr2ogr -f "GeoJSON" municipios-centroids.json municipios-centroids.vrt && cd ../..
cp R/interactive-map/municipios* crimenmexico.diegovalle.net/assets/json

# Move images to the website directory
echo "Creating website...."
cp -n -v R/graphs/infographic_???_????.png crimenmexico.diegovalle.net/en/images/infographics/fulls/
cp -n -v R/graphs/municipios_???_????.png crimenmexico.diegovalle.net/en/images/infographics/fulls/
cp -n -v R/graphs/infographic_es_???_????.png crimenmexico.diegovalle.net/es/images/infographics/fulls/
cp -n -v R/graphs/municipios_es_???_????.png crimenmexico.diegovalle.net/es/images/infographics/fulls/
cd crimenmexico.diegovalle.net && python create_website.py && cd ..

echo "Exporting database to csv.gz"
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

# Test crimenmexico.diegovalle.net
simplehttpserver crimenmexico.diegovalle.net/ > /dev/null  2>&1 &
#cd crimenmexico.diegovalle.net && python -m SimpleHTTPServer 8000 > /dev/null 2>&1 &
sleep 40
cd crimenmexico.diegovalle.net/tests && casperjs --ssl-protocol=tlsv1 test web_test.js && cd ../..
kill "$!"

# copy  to the staging website
rsync --compress-level=9 --exclude='.git/' -Pavz -e 'ssh -i /root/.ssh/crimenmexico' --delete /root/new.crimenmexico/crimenmexico.diegovalle.net/ crimenmexico@168.235.92.165:/var/www/bcrimenmexico.diegovalle.net
rsync --compress-level=9 --exclude='.git/' -Pavz -e 'ssh -i /root/.ssh/crimenmexico' --delete /root/new.crimenmexico crimenmexico@168.235.92.165:/home/crimenmexico


