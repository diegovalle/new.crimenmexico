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
import zipfile
import re

#SECUESTRO_PDF =
#["http://secretariadoejecutivo.gob.mx/docs/pdfs/fuero_federal/estadisticas%20fuero%20federal/secuestrofederal122015.pdf",
#"http://secretariadoejecutivo.gob.mx/docs/pdfs/fuero_federal/estadisticas%20fuero%20federal/secuestrofederal042016.pdf"]
VICTIMAS_XLS = "http://secretariadoejecutivo.gob.mx/docs/datos_abiertos/Datos_abiertos_Victimas_Fuero_comun.xls"

def write_file(fileName, md):
    f = open(fileName, 'w')
    f.write(md)
    f.close()


def to_csv(fname, page, crime_name):
    if os.system('java -jar ./tabula-java/tabula-0.9.0-SNAPSHOT-jar-with-dependencies.jar --spreadsheet -p' + str(
        page) + ' -o victimas-csv/' + fname + '.' + crime_name + '.csv ' + 'pdf/' + fname):
      raise  Exception('Error converting the pdf to csv with tabula')


def download_secuestro_pdf():
    baseurl = "http://secretariadoejecutivo.gob.mx/incidencia-delictiva/"
    page = "incidencia-delictiva-fuero-federal.php"
    change = False
    r = requests.get(baseurl + page)

    data = r.text
    soup = BeautifulSoup(data)

    for i, link in enumerate(soup.findAll('a',
                                          href=re.compile('.*secuestrofederal.*'))):
        print "Downloading: " + link['href']
        year = re.findall('(?:[a-z]|\d{2})(\d{4})(?:_|\.)', link['href'])[0]
        fname = "secuestro" + '_' + year + '.pdf'
        with open('pdf/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, baseurl + urllib.quote(link['href']))
            curl.setopt(pycurl.WRITEDATA, fp)
            curl.perform()
            curl.close()
            fp.close()
            
            to_csv(fname, 3, 'secuestro-federal')


    return True

def filename_with_csv(file):
    return os.path.splitext(file)[0] + '.csv'

def getXLSX(page, conn):
    baseurl = "http://secretariadoejecutivo.gob.mx/incidencia-delictiva/"
    # page = "incidencia-delictiva-fuero-comun.php"

    print("Processing State and Municipio Averiguaciones del Fuero Comun Files")
    r = requests.get(baseurl + page)

    data = r.text
    soup = BeautifulSoup(data)

    soup.find("div", {"id": "anois"})

    for i, link in enumerate(soup.find("div",
                                       {"id": "anios", "class": "excel"}).
                             findAll('a', href=re.compile('.*pdf'))):
        print link['href']
        fname = ("estatal" if "Estatal" in link['href'] else "muncipal") + '.zip'
        with open('snsp-data/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, baseurl + urllib.quote(link['href']))
            curl.setopt(pycurl.WRITEDATA, fp)
            # curl.setopt(pycurl.HEADERFUNCTION, headers.write)
            curl.perform()
            curl.close()
            fp.close()

            with zipfile.ZipFile(os.path.join('snsp-data', fname), "r") as z:
                crime_file = z.namelist()[0]
                for name in z.namelist():
                    outpath = 'snsp-data/'
                    z.extract(name, outpath)
                    os.system("cd 'snsp-data';libreoffice --headless --convert-to csv -env:UserInstallation=file:///tmp/foobar7665765 '" + name +"'")

        if "estatal" in crime_file.lower():
            print("writing state to db")
            write_state_db(conn,
                           filename_with_csv(crime_file))
        elif "municipal" in crime_file.lower():
            write_mun_db(conn,
                         filename_with_csv(crime_file))
        else:
            print "Can't determine which file is estatal and municipal. Something changed..."
    return True


def get_victimas():
    with open('snsp-data/victimas_fuerocomun.xls', "wb") as fp:
        curl = pycurl.Curl()
        curl.setopt(pycurl.URL, "http://secretariadoejecutivo.gob.mx/docs/datos_abiertos/Datos_abiertos_Victimas_Fuero_comun.xls")
        curl.setopt(pycurl.WRITEDATA, fp)
        curl.perform()
        curl.close()


def write_state_db(conn, CSV_ESTADOS):
    conn.execute("delete from " + 'municipios_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'population_municipios')
    conn.commit()
    conn.execute("delete from " + 'municipio_names')
    conn.commit()
    conn.execute("delete from " + 'tipo_municipios')
    conn.commit()
    conn.execute("delete from " + 'subtipo_municipios')
    conn.commit()
    conn.execute("delete from " + 'modalidad_municipios')
    conn.commit()


    conn.execute("delete from " + 'estados_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'tipo_states')
    conn.commit()
    conn.execute("delete from " + 'subtipo_states')
    conn.commit()
    conn.execute("delete from " + 'modalidad_states')
    conn.commit()
    conn.execute("delete from " + 'population_states')
    conn.commit()
    conn.execute("delete from " + 'state_names')
    conn.commit()
    crime_states = CrimeStates(os.path.join('snsp-data', CSV_ESTADOS))
    pd_sql.to_sql(crime_states.tipo, 'tipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.subtipo, 'subtipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.modalidad, 'modalidad_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.state_codes, 'state_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.population, 'population_states', conn, if_exists='append', index=False, chunksize=20000)
    pd_sql.to_sql(crime_states.data, 'estados_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)


def write_mun_db(conn, CSV_MUNICIPIOS):
    conn.execute("delete from " + 'municipios_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'population_municipios')
    conn.commit()
    conn.execute("delete from " + 'municipio_names')
    conn.commit()
    conn.execute("delete from " + 'tipo_municipios')
    conn.commit()
    conn.execute("delete from " + 'subtipo_municipios')
    conn.commit()
    conn.execute("delete from " + 'modalidad_municipios')
    conn.commit()
    print("Cleaning municipio data")
    crime_municipios = CrimeMunicipios(os.path.join('snsp-data', CSV_MUNICIPIOS))
    print("writing metada to db")
    pd_sql.to_sql(crime_municipios.tipo, 'tipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.subtipo, 'subtipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.modalidad, 'modalidad_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.municipios, 'municipio_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.population, 'population_municipios', conn, if_exists='append', index=False, chunksize=20000)
    print("writing municipio data to db")

    # Temporary fix because the SNSP duplicated (with different values sometimes) the data for 2055 TRINIDAD ZAACHILA
    #crime_municipios.data = crime_municipios.data[(crime_municipios.data['state_code'] != 22) & (crime_municipios.data['mun_code'] != 555)]

    pd_sql.to_sql(crime_municipios.data, 'municipios_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)
    print("end writing municipio data to db")



# Clean the PDFs with victim info
download_secuestro_pdf()

victimas = v.clean_comun_xls(VICTIMAS_XLS)
secuestros = pd.DataFrame()
for file in os.listdir("victimas-csv"):
    if "federal" in file:
        print('Processing: ' + file)
        secuestros = secuestros.append(v.clean_federal(file))

crimes = victimas.append(secuestros).sort_values(['fuero', 'state',  'modalidad', 'tipo', 'subtipo', 'date'])  # .to_csv("clean-data/victimas.csv", index=False)


#Clean the state and municipio fuero comun CSV files
CLEAN_DIR = os.path.join('..', 'db')
#CSV_MUNICIPIOS = 'snsp-data/Incidencia Delictiva FC Municipal 2011 - 2015.csv'
#CSV_ESTADOS = 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'

conn = sq.connect(os.path.join(CLEAN_DIR, 'crimenmexico.db'))
conn.execute('pragma foreign_keys=ON')
pd_sql.to_sql(crimes, 'victimas', conn, if_exists='replace', index=False)

getXLSX("incidencia-delictiva-fuero-comun.php", conn)

conn.close()
