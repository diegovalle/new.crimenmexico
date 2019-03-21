#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
EXPORT=crimenmexico.diegovalle.net/data
SQLITE3=sqlite3

ESTADOS_FILE=nm-fuero-comun-estados.csv.gz
MUNICIPIOS_FILE=nm-fuero-comun-municipios.csv.gz
VICTIMAS_FILE=nm-estatal-victimas.csv.gz


# Convert the infographics R created to png and optimize for the web
for filename in R/graphs/*.svg; do
    if [ ! -f "R/graphs/$(basename "$filename" .svg).png" ]
    then
        echo "Converting $filename"
        inkscape -z -e R/graphs/"$(basename "$filename" .svg)".png -w 1080 -h 1800 "$filename"
        optipng -quiet R/graphs/"$(basename "$filename" .svg)".png
    fi
done

# Move images to the website directory
echo "Creating website...."
cp -n -v R/graphs/infographic_???_????.png crimenmexico.diegovalle.net/en/images/infographics/fulls/
cp -n -v R/graphs/municipios_???_????.png crimenmexico.diegovalle.net/en/images/infographics/fulls/
cp -n -v R/graphs/infographic_es_???_????.png crimenmexico.diegovalle.net/es/images/infographics/fulls/
cp -n -v R/graphs/municipios_es_???_????.png crimenmexico.diegovalle.net/es/images/infographics/fulls/
cd crimenmexico.diegovalle.net && python create_website.py && cd ..

# Move the json files with the chart data to the website directory
cp R/json/*.json crimenmexico.diegovalle.net/assets/json/

# Create a geojson with the lat and lng of Mexican municipios
echo "Converting the municipio centroids to GeoJSON"
if [ -f R/interactive-map/municipios-centroids.json ]
then
    rm R/interactive-map/municipios-centroids.json
fi
cd R/interactive-map/ && ./convert.sh && cd ../..
cp R/interactive-map/municipios*.{csv,json} crimenmexico.diegovalle.net/assets/json

echo "Exporting databases to csv.gz"
# Export the sqlite database to csv and compress
if [ "$SCRIPTPATH"/db/crimenmexico.db -nt "$SCRIPTPATH"/$EXPORT/$ESTADOS_FILE ]; then
    echo "exporting $SCRIPTPATH/$EXPORT/$ESTADOS_FILE"
    $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header \
             "SELECT estados_fuero_comun.state_code,
                    state,
                    bien_juridico_text as bien_juridico,
                    tipo_text as tipo,
                    subtipo_text as subtipo,
                    modalidad_text as modalidad,
                    estados_fuero_comun.date,
                    count,
                    population
             FROM estados_fuero_comun
             NATURAL JOIN bien_juridico_states
             NATURAL JOIN modalidad_states
             NATURAL JOIN tipo_states
             NATURAL JOIN subtipo_states
             NATURAL JOIN state_names
             NATURAL JOIN population_states
             ORDER BY estados_fuero_comun.state_code,
                      estados_fuero_comun.date,
                      bien_juridico_text,
                      tipo_text,
                      subtipo_text,
                      modalidad_text;" \
                 | gzip -9 > "$SCRIPTPATH"/$EXPORT/$ESTADOS_FILE
fi

if [ "$SCRIPTPATH"/db/crimenmexico.db -nt "$SCRIPTPATH"/$EXPORT/$MUNICIPIOS_FILE ]; then
    echo "exporting $SCRIPTPATH/$EXPORT/$MUNICIPIOS_FILE"
    $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header \
             "SELECT m.state_code,
                    state,
                    m.mun_code,
                    municipio,
                    bien_juridico_text as bien_juridico,
                    tipo_text as tipo,
                    subtipo_text as subtipo,
                    modalidad_text as modalidad,
                    m.date,
                    count,
                    population
             FROM municipios_fuero_comun m
             NATURAL JOIN bien_juridico_municipios
             NATURAL JOIN modalidad_municipios
             NATURAL JOIN  tipo_municipios
             NATURAL JOIN subtipo_municipios
             NATURAL JOIN state_names
             NATURAL JOIN municipio_names
             LEFT JOIN population_municipios p
             ON p.state_code = m.state_code and
                p.mun_code = m.mun_code and p.date = m.date
             ORDER BY m.state_code,
                      m.date,
                      bien_juridico_text,
                      tipo_text,
                      subtipo_text,
                      modalidad_text;" \
                 | gzip -9  > "$SCRIPTPATH"/$EXPORT/$MUNICIPIOS_FILE
fi

if [ "$SCRIPTPATH"/db/crimenmexico.db -nt "$SCRIPTPATH"/$EXPORT/$VICTIMAS_FILE ]; then
    echo "exporting $SCRIPTPATH/$EXPORT/$VICTIMAS_FILE"
    $SQLITE3 "$SCRIPTPATH"/db/crimenmexico.db -csv -header \
             "SELECT v.state_code,
                     state,
                     bien_juridico_text as bien_juridico,
                     tipo_text as tipo,
                     subtipo_text as subtipo,
                     modalidad_text as modalidad,
                     v.date,
                     sex_text as sex,
                     age_group_text as age_group,
                     population,
                     count
             FROM estados_victimas v
             LEFT JOIN population_age_sex p ON p.age_group = v.age_group and
                       p.sex = v.sex and p.date = v.date and
                       p.state_code = v.state_code
             LEFT JOIN sex s on  s.sex = v.sex
             LEFT JOIN age_group a on a.age_group=v.age_group
             NATURAL JOIN bien_juridico_states_victimas
             NATURAL JOIN modalidad_states_victimas
             NATURAL JOIN  tipo_states_victimas
             NATURAL JOIN subtipo_states_victimas
             NATURAL JOIN state_names
             ORDER BY v.state_code,
                      v.date,
                      bien_juridico_text,
                      tipo_text,
                      subtipo_text,
                      modalidad_text,
                      sex_text,
                      age_group_text;" \
        | gzip -9 > "$SCRIPTPATH"/$EXPORT/$VICTIMAS_FILE
fi

# Test crimenmexico.diegovalle.net
simplehttpserver crimenmexico.diegovalle.net/ > /dev/null  2>&1 &
sleep 40
cd crimenmexico.diegovalle.net/tests && casperjs  --fail-fast --ssl-protocol=tlsv1 test web_test.js && cd ../..
kill "$!"
