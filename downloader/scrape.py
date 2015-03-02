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
from lib.clean_states import CrimeMunicipios, CrimeStates
import pandas as pd
import numpy as np
import pandas.io.sql as pd_sql
import sqlite3 as sq

def write_file(fileName, md):
    f = open(fileName, 'w')
    f.write(md)
    f.close()


def hashfile(fname):
    afile = open(fname, 'rb')
    hasher = hashlib.md5()
    # skip the first line because the file header includes
    # the date the csv was generated
    i = 1
    for line in afile:
        if i > 1:
            hasher.update(line)
        i = i + 1
    afile.close()
    return hasher.hexdigest()


def changed(fname):
    md = hashfile(fname)
    changed = False
    try:
        with open(fname + '.md5', 'r') as f:
            checksum = f.read()
            if checksum != md:
                changed = True
                write_file(fname + '.md5', md)
    except IOError:
        changed = True
        write_file(fname + '.md5', md)
    return changed


def to_csv(fname, page, crime_name):
    os.system('RBENV_VERSION=jruby-1.7.12 tabula --spreadsheet -p ' + str(
        page) + ' -o victimas-csv/' + fname + '.' + crime_name + '.csv ' + 'pdf/' + fname)


baseurl = "http://secretariadoejecutivo.gob.mx/incidencia-delictiva/"
# page = "incidencia-delictiva-victimas.php"

def getPDF(page, crime_type):
    change = False
    r = requests.get(baseurl + page)

    data = r.text
    soup = BeautifulSoup(data)

    #headers = StringIO()

    for i, link in enumerate(soup.findAll('a', href=re.compile(crime_type + '.*pdf'))):
        print link['href']
        fname = crime_type + '_' + str(i + 2014 if crime_type == "victima" else 2015) + '.pdf'
        with open('pdf/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, baseurl + urllib.quote(link['href']))
            curl.setopt(pycurl.WRITEDATA, fp)
            #curl.setopt(pycurl.HEADERFUNCTION, headers.write)
            curl.perform()
            curl.close()
            fp.close()
            if changed('pdf/' + fname):
                change = True
                if crime_type == "victima":
                    to_csv(fname, 4, 'homicidio_doloso')
                    to_csv(fname, 5, 'homicidio_culposo')
                    to_csv(fname, 6, 'secuestro')
                    to_csv(fname, 7, 'extorsion')
                else:
                    to_csv(fname, 3, 'secuestro-federal')
    return change


getPDF("incidencia-delictiva-victimas.php", "victima")
getPDF("incidencia-delictiva-fuero-federal.php", "secuestro")

victimas = pd.DataFrame()
secuestros = pd.DataFrame()
for file in os.listdir("victimas-csv"):
    if "victima" in file:
        victimas = victimas.append(v.clean_comun(file))
    if "federal" in file:
        secuestros = secuestros.append(v.clean_federal(file))

crimes = victimas.append(secuestros).sort(['fuero', 'state',  'modalidad', 'tipo', 'subtipo', 'date'])  # .to_csv("clean-data/victimas.csv", index=False)

CLEANDIR = os.path.join('..', 'db')
conn = sq.connect(os.path.join(CLEANDIR, 'crimenmexico.db'))
pd_sql.to_sql(crimes, 'victimas', conn, if_exists='replace', index=False)

# df = victimas.append(secuestros).groupby(['state', 'state_code', 'crime', 'date'])['count'].aggregate(np.sum)
# population = pd.read_csv("data/pop_states.csv")
# df = pd.merge(pd.DataFrame(df).reset_index(), population, how='left')
# df['rate'] = (df['count'] * 12) / df['population'] * 100000
# df.to_csv("clean-data/victimas_grouped.csv", index=False)


#CLEANDIR = 'clean-data'
#conn = sq.connect(os.path.join(CLEANDIR, 'crimenmexico.db'))

crime_municipios = CrimeMunicipios('snsp-data/Incidencia Delictiva FC Municipal 2011 - 2015.csv')
conn.execute("delete from " + 'tipo_municipios')
conn.execute("delete from " + 'subtipo_municipios')
conn.execute("delete from " + 'modalidad_municipios')
conn.execute("delete from " + 'population_municipios')
conn.execute("delete from " + 'municipio_names')
conn.execute("delete from " + 'municipios_fuero_comun')
pd_sql.to_sql(crime_municipios.tipo, 'tipo_municipios', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_municipios.subtipo, 'subtipo_municipios', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_municipios.modalidad, 'modalidad_municipios', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_municipios.population, 'population_municipios', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_municipios.municipios, 'municipio_names', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_municipios.data, 'municipios_fuero_comun', conn, if_exists='append', index=False)

del crime_municipios

crime_states = CrimeStates('snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv')
conn.execute("delete from " + 'tipo_states')
conn.execute("delete from " + 'subtipo_states')
conn.execute("delete from " + 'modalidad_states')
conn.execute("delete from " + 'population_states')
conn.execute("delete from " + 'state_names')
conn.execute("delete from " + 'estados_fuero_comun')
pd_sql.to_sql(crime_states.tipo, 'tipo_states', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_states.subtipo, 'subtipo_states', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_states.modalidad, 'modalidad_states', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_states.population, 'population_states', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_states.state_codes, 'state_names', conn, if_exists='append', index=False)
pd_sql.to_sql(crime_states.data, 'estados_fuero_comun', conn, if_exists='append', index=False)
