--
-- modalidad_states
--
CREATE TABLE modalidad_states(
  modalidad INTEGER PRIMARY KEY,
  modalidad_text TEXT NOT NULL
);

--
-- tipo_states
--
CREATE TABLE tipo_states(
  tipo INTEGER PRIMARY KEY,
  tipo_text TEXT NOT NULL
);

--
-- subtipo_states
--
CREATE TABLE subtipo_states(
  subtipo INTEGER  PRIMARY KEY,
  subtipo_text TEXT NOT NULL
);

--
-- population_states
--
CREATE TABLE population_states(
  population INTEGER,
  date TEXT,
  state_code INTEGER,
  PRIMARY KEY (date, state_code)
);

--
-- modalidad_municipios
--
CREATE TABLE modalidad_municipios(
  modalidad INTEGER PRIMARY KEY,
  modalidad_text TEXT NOT NULL
);

--
-- tipo_municipios
--
CREATE TABLE tipo_municipios(
  tipo INTEGER PRIMARY KEY,
  tipo_text TEXT NOT NULL
);

--
-- subtipo_municipios
--
CREATE TABLE subtipo_municipios(
  subtipo INTEGER  PRIMARY KEY,
  subtipo_text TEXT NOT NULL
);

--
-- population_municipios
--
CREATE TABLE population_municipios(
  population INTEGER,
  state_code INTEGER NOT NULL,
  mun_code INTEGER NOT NULL,
  date TEXT,
  PRIMARY KEY (date, state_code, mun_code)
);

--
-- state names
--
CREATE TABLE state_names(
  state_code INTEGER,
  state TEXT NOT NULL,
  PRIMARY KEY (state_code, state)
);

--
-- municipio names
--
CREATE TABLE municipio_names(
  state_code INTEGER NOT NULL,
  mun_code INTEGER NOT NULL,
  municipio TEXT,
  PRIMARY KEY (state_code, mun_code, municipio)
);


--
-- estados_fuero_comun
--
CREATE TABLE estados_fuero_comun(
  state_code INTEGER NOT NULL,
  date VARCHAR(7) NOT NULL,
  modalidad INTEGER,
  tipo INTEGER,
  subtipo INTEGER,
  count FLOAT,
  FOREIGN KEY(tipo) REFERENCES tipo_states(tipo),
  FOREIGN KEY(modalidad) REFERENCES modalidad_states(modalidad),
  FOREIGN KEY(subtipo) REFERENCES subtipo_states(subtipo),
  PRIMARY KEY (state_code, modalidad, tipo, subtipo, date)
);

--
-- municipios_fuero_comun
--
CREATE TABLE municipios_fuero_comun(
  state_code INTEGER NOT NULL,
  mun_code INTEGER NOT NULL,
  date VARCHAR(7) NOT NULL,
  modalidad INTEGER,
  tipo INTEGER,
  subtipo INTEGER,
  count FLOAT,
  FOREIGN KEY(tipo) REFERENCES tipo_municipios(tipo),
  FOREIGN KEY(modalidad) REFERENCES modalidad_municipios(modalidad),
  FOREIGN KEY(subtipo) REFERENCES subtipo_municipios(subtipo),
  PRIMARY KEY (state_code, mun_code, modalidad, tipo, subtipo, date)
);

select estados_fuero_comun.state_code, state, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, estados_fuero_comun.date,  count, population from estados_fuero_comun, modalidad, tipo, subtipo, states, population where modalidad.modalidad = estados_fuero_comun.modalidad and subtipo.subtipo = estados_fuero_comun.subtipo and tipo.tipo = estados_fuero_comun.tipo and states.state_code = estados_fuero_comun.state_code and estados_fuero_comun.state_code = population.state_code and estados_fuero_comun.date = population.date order by state, modalidad, tipo, subtipo, estados_fuero_comun.date limit 10;

select municipios_fuero_comun.state_code, state, municipios_fuero_comun.mun_code, municipio_names.municipio, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, municipios_fuero_comun.date, count from municipios_fuero_comun, modalidad_municipios, tipo_municipios, subtipo_municipios, state_names, municipio_names where modalidad_municipios.modalidad = municipios_fuero_comun.modalidad and subtipo_municipios.subtipo = municipios_fuero_comun.subtipo and tipo_municipios.tipo = municipios_fuero_comun.tipo and state_names.state_code = municipios_fuero_comun.state_code  and municipios_fuero_comun.mun_code = municipio_names.mun_code limit 10;

SELECT state_code, state, mun_code, municipio, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, date, count, population FROM municipios_fuero_comun NATURAL JOIN modalidad_municipios NATURAL JOIN tipo_municipios  NATURAL JOIN subtipo_municipios NATURAL JOIN state_names NATURAL JOIN municipio_names  NATURAL JOIN population_municipios limit 10;

sqlite3 clean-data/crimenmexico.db <<!
.headers on
.mode csv
.output out.csv
select estados_fuero_comun.state_code, state, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, estados_fuero_comun.date,  count, population from estados_fuero_comun, modalidad, tipo, subtipo, states, population where modalidad.modalidad = estados_fuero_comun.modalidad and subtipo.subtipo = estados_fuero_comun.subtipo and tipo.tipo = estados_fuero_comun.tipo and states.state_code = estados_fuero_comun.state_code and estados_fuero_comun.state_code = population.state_code and estados_fuero_comun.date = population.date order by state, modalidad, tipo, subtipo, estados_fuero_comun.date;
!


sqlite3 clean-data/crimenmexico.db <<!
.headers on
.mode csv
.output clean-data/fuero_comun_municipios.csv
SELECT state_code, state, mun_code, municipio, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, date, count, population FROM municipios_fuero_comun NATURAL JOIN modalidad_municipios NATURAL JOIN tipo_municipios  NATURAL JOIN subtipo_municipios NATURAL JOIN state_names NATURAL JOIN municipio_names  NATURAL JOIN population_municipios;
!

sqlite3 clean-data/crimenmexico.db <<!
.headers on
.mode csv
.output clean-data/victimas.csv
select state, state_code, modalidad, tipo, subtipo, date, sum(count) as count, sum(population) as population, (sum(count) * 12) / sum(population) * 100000 as rate, "victimas" as type from victimas group by state, state_code, modalidad, tipo, subtipo, date 
UNION ALL 
select state, state_code, modalidad_text as modalidad, tipo_text as tipo, subtipo_text as subtipo, date, count, population, population/count  as rate, "averiguaciones" as type from estados_fuero_comun natural join state_names natural join population_states natural join modalidad_states natural join subtipo_states natural join tipo_states where modalidad_text = "ROBO COMUN" and (tipo_text ="SIN VIOLENCIA" or tipo_text ="CON VIOLENCIA") and subtipo_text = "DE VEHICULOS" and date > '2014-01';
!




















