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


def to_csv(fname, page, crime_name):
    if os.system('java -jar ./tabula-java/tabula-0.9.0-SNAPSHOT-jar-with-dependencies.jar --spreadsheet -p' + str(
        page) + ' -o victimas-csv/' + fname + '.' + crime_name + '.csv ' + 'pdf/' + fname):
      raise  Exception('Error converting the pdf to csv with tabula')


def filename_with_csv(file):
    return os.path.splitext(file)[0] + '.csv'

def getXLSX_fuero_comun(conn):
    baseurl = "https://www.gob.mx/sesnsp/acciones-y-programas/"
    page = "incidencia-delictiva-del-fuero-comun-nueva-metodologia"

    print("Processing State and Municipio Averiguaciones del Fuero Comun Files:")
    r = requests.get(baseurl + page)

    data = r.text
    soup = BeautifulSoup(data)


    for i, link in enumerate(soup.findAll("a", href=re.compile('(Estatal|Municipal).*zip', re.IGNORECASE))):
        print link['href']
        fname = ("estatal" if "Estatal" in link['href'] else "muncipal") + '.zip'
        with open('snsp-data/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, urllib.quote(link['href'], safe="%/:=&?~#+!$,;'@()*[]"))
            curl.setopt(pycurl.WRITEDATA, fp)
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
            quit()
    return True

def getXLSX_victimas(conn):
    baseurl = "https://www.gob.mx/sesnsp/acciones-y-programas/"
    page = "victimas-nueva-metodologia"

    print("Processing Victimas Files:")
    r = requests.get(baseurl + page)

    data = r.text
    soup = BeautifulSoup(data)

    for i, link in enumerate(soup.findAll("a", href=re.compile('(Estatal).*zip', re.IGNORECASE))):
        print  link['href'].encode('utf-8')
        fname = ("estatal_victimas" if "Estatal" in link['href'] else "unidades_robadas") + '.zip'

        with open('snsp-data/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, urllib.quote(link['href'].encode('utf-8'), safe="%/:=&?~#+!$,;'@()*[]"))
            curl.setopt(pycurl.WRITEDATA, fp)
            curl.perform()
            curl.close()
            fp.close()

            with zipfile.ZipFile(os.path.join('snsp-data', fname), "r") as z:
                crime_file = z.namelist()[0]
                for name in z.namelist():
                    outpath = 'snsp-data/'
                    with open(outpath + fname + '.xlsx', "wb") as outputfile:
                        shutil.copyfileobj(z.open(name), outputfile)
                    os.system("cd 'snsp-data';libreoffice --headless --convert-to csv -env:UserInstallation=file:///tmp/foobar9075765 '" + fname + '.xlsx' +"'")

        if "estatal" in crime_file.lower():
            print("writing state victimas to db")
            write_state_victimas_db(conn,
                                    fname + '.csv')
        #elif "municipal" in crime_file.lower():
        #    write_mun_db(conn,
        #                 fname + '.csv')
        #else:
        #    print "Can't determine which file is estatal and municipal. Something changed..."
    return True

def write_state_victimas_db(conn, CSV_ESTADOS):
    conn.execute("delete from " + 'municipios_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'estados_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'estados_victimas')
    conn.commit()
    conn.execute("delete from " + 'population_age_sex')
    conn.commit()
    conn.execute("delete from " + 'population_municipios')
    conn.commit()
    conn.execute("delete from " + 'municipio_names')
    conn.commit()
    conn.execute("delete from " + 'population_states')
    conn.commit()
    conn.execute("delete from " + 'state_names')
    conn.commit()
    conn.execute("delete from " + 'tipo_states_victimas')
    conn.commit()
    conn.execute("delete from " + 'subtipo_states_victimas')
    conn.commit()
    conn.execute("delete from " + 'modalidad_states_victimas')
    conn.commit()
    conn.execute("delete from " + 'bien_juridico_states_victimas')
    conn.commit()
    conn.execute("delete from " + 'age_group')
    conn.commit()
    conn.execute("delete from " + 'sex')
    conn.commit()
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
    conn.execute("delete from " + 'estados_fuero_comun')
    conn.commit()
    conn.execute("delete from " + 'tipo_states')
    conn.commit()
    conn.execute("delete from " + 'subtipo_states')
    conn.commit()
    conn.execute("delete from " + 'modalidad_states')
    conn.commit()
    conn.execute("delete from " + 'bien_juridico_states')
    conn.commit()
    conn.execute("delete from " + 'population_states')
    conn.commit()
    # conn.execute("delete from " + 'state_names')
    # conn.commit()
    crime_states = CrimeStates(os.path.join('snsp-data', CSV_ESTADOS))
    pd_sql.to_sql(crime_states.tipo, 'tipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.subtipo, 'subtipo_states', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.modalidad, 'modalidad_states', conn, if_exists='append', index=False)
    # pd_sql.to_sql(crime_states.state_codes, 'state_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_states.bien_juridico, 'bien_juridico_states', conn, if_exists='append', index=False)
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
    conn.execute("delete from " + 'bien_juridico_municipios')
    conn.commit()
    conn.execute("delete from " + 'modalidad_municipios')
    conn.commit()
    print("Cleaning municipio data")
    crime_municipios = CrimeMunicipios(os.path.join('snsp-data', CSV_MUNICIPIOS))
    print("writing metada to db")
    pd_sql.to_sql(crime_municipios.tipo, 'tipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.subtipo, 'subtipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.modalidad, 'modalidad_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.bien_juridico, 'bien_juridico_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.municipios, 'municipio_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.population, 'population_municipios', conn, if_exists='append', index=False, chunksize=20000)
    print("writing municipio data to db")

    # Temporary fix because the SNSP duplicated (with different values sometimes) the data for 2055 TRINIDAD ZAACHILA
    #crime_municipios.data = crime_municipios.data[(crime_municipios.data['state_code'] != 22) & (crime_municipios.data['mun_code'] != 555)]

    pd_sql.to_sql(crime_municipios.data, 'municipios_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)
    print("end writing municipio data to db")




#victimas = v.clean_comun_xls(VICTIMAS_XLS)

#crimes = victimas.sort_values(['fuero', 'state',  'modalidad', 'tipo', 'subtipo', 'date'])  # .to_csv("clean-data/victimas.csv", index=False)


#Clean the state and municipio fuero comun CSV files
CLEAN_DIR = os.path.join('..', 'db')
#CSV_MUNICIPIOS = 'snsp-data/Incidencia Delictiva FC Municipal 2011 - 2015.csv'
#CSV_ESTADOS = 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'

conn = sq.connect(os.path.join(CLEAN_DIR, 'crimenmexico.db'))
conn.execute('pragma foreign_keys=ON')
#pd_sql.to_sql(crimes, 'victimas', conn, if_exists='replace', index=False)
getXLSX_victimas(conn)
getXLSX_fuero_comun(conn)

conn.close()
