#!/usr/bin/env python # -*- coding: utf-8 -*-
from BeautifulSoup import BeautifulSoup, SoupStrainer
import requests
import re
import pycurl
from StringIO import StringIO
import ntpath
import hashlib
import urllib
import os
import lib.victimas_comun as v
from lib.clean_states import CrimeMunicipios, CrimeStates, CrimeStatesVictimas
import pandas as pd
import numpy as np
import pandas.io.sql as pd_sql
import sqlite3 as sq
import zipfile
import re
import shutil


def write_file(fileName, md):
    f = open(fileName, 'w')
    f.write(md)
    f.close()

def write_state_victimas_db(conn, CSV_ESTADOS):
    crime_states = CrimeStatesVictimas(os.path.join('snsp-data', CSV_ESTADOS))

    pd_sql.to_sql(crime_states.tipo, 'tipo_states_victimas', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.subtipo, 'subtipo_states_victimas', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.modalidad, 'modalidad_states_victimas', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.state_codes, 'state_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.bien_juridico, 'bien_juridico_states_victimas', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.age_groups, 'age_group', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.sex, 'sex', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.population, 'population_age_sex', conn, if_exists='append', index=False, chunksize=20000)
    pd_sql.to_sql(crime_states.data, 'estados_victimas', conn, if_exists='append', index=False, chunksize=20000)

def write_state_db(conn, CSV_ESTADOS):
    crime_states = CrimeStates(os.path.join('snsp-data', CSV_ESTADOS))

    pd_sql.to_sql(crime_states.tipo, 'tipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.subtipo, 'subtipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.modalidad, 'modalidad_states', conn, if_exists='append', index=False)
    # pd_sql.to_sql(crime_states.state_codes, 'state_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.bien_juridico, 'bien_juridico_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.population, 'population_states', conn, if_exists='append', index=False, chunksize=20000)
    pd_sql.to_sql(crime_states.data, 'estados_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)


def write_mun_db(conn, CSV_MUNICIPIOS):
    print("Cleaning municipio data")
    crime_municipios = CrimeMunicipios(os.path.join('snsp-data', CSV_MUNICIPIOS))
    print("Writing metada to db")
    pd_sql.to_sql(crime_municipios.tipo, 'tipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.subtipo, 'subtipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.modalidad, 'modalidad_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.bien_juridico, 'bien_juridico_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.municipios, 'municipio_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.population, 'population_municipios', conn, if_exists='append', index=False, chunksize=20000)
    print("Writing municipio data to db")
    # Temporary fix because the SNSP duplicated (with different values) the data for 2055 TRINIDAD ZAACHILA
    #crime_municipios.data = crime_municipios.data[(crime_municipios.data['state_code'] != 22) & (crime_municipios.data['mun_code'] != 555)]
    pd_sql.to_sql(crime_municipios.data, 'municipios_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)
    print("End writing municipio data to db")

#Clean the state and municipio fuero comun CSV files
CLEAN_DIR = os.path.join('..', 'db')

conn = sq.connect(os.path.join(CLEAN_DIR, 'crimenmexico.db'))
conn.execute('pragma foreign_keys=ON')
write_state_victimas_db(conn, 'estados_victimas.csv')
write_state_db(conn, 'estados.csv') 
write_mun_db(conn, 'municipios.csv')

conn.close()
