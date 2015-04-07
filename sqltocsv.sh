#!/bin/bash
SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
SQLITE3=sqlite3


if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/exports/fuero-comun-estados.csv.zip ]]; then
    echo "exporting $SCRIPTPATH/exports/fuero-comun-estados.csv.zip"
  $SQLITE3 $SCRIPTPATH/db/crimenmexico.db -csv -header 'select estados_fuero_comun.state_code, state, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, estados_fuero_comun.date,  count, population from estados_fuero_comun NATURAL JOIN modalidad_states NATURAL JOIN tipo_states  NATURAL JOIN subtipo_states NATURAL JOIN state_names NATURAL JOIN population_states;' | zip -9 > $SCRIPTPATH/exports/fuero-comun-estados.csv.zip
fi

if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/exports/fuero-comun-municipios.csv.zip ]]; then
    echo "exporting $SCRIPTPATH/exports/fuero-comun-municipios.csv.zip"
  $SQLITE3 $SCRIPTPATH/db/crimenmexico.db -csv -header 'SELECT municipios_fuero_comun.state_code, state, municipios_fuero_comun.mun_code, municipio, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, municipios_fuero_comun.date, count, population FROM municipios_fuero_comun NATURAL JOIN modalidad_municipios NATURAL JOIN  tipo_municipios NATURAL JOIN subtipo_municipios NATURAL JOIN state_names NATURAL JOIN municipio_names NATURAL JOIN  population_municipios;' | zip -9  > $SCRIPTPATH/exports/fuero-comun-municipios.csv.zip
fi

if [[ $SCRIPTPATH/db/crimenmexico.db -nt $SCRIPTPATH/exports/victimas.csv.zip ]]; then
    echo "exporting $SCRIPTPATH/exports/victimas.csv.zip"
  $SQLITE3 $SCRIPTPATH/db/crimenmexico.db -csv -header 'select state, state_code, modalidad, tipo, subtipo, date, sum(count) as count, sum(population) as population, "victimas" as type from victimas group by state, state_code, modalidad, tipo, subtipo, date 
UNION ALL 
select state, state_code, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, date, count, population, "averiguaciones" as type from estados_fuero_comun natural join state_names natural join population_states natural join modalidad_states natural join subtipo_states natural join tipo_states where modalidad_text = "ROBO COMUN" and (tipo_text ="SIN VIOLENCIA" or tipo_text ="CON VIOLENCIA") and subtipo_text = "DE VEHICULOS" and date > '2014-01';' | zip -9  > $SCRIPTPATH/exports/victimas.csv.zip
fi
