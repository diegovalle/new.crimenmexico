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

VICTIMAS_PDF = ["http://secretariadoejecutivo.gob.mx/docs/pdfs/victimas/Victimas2014_052015.pdf", "http://secretariadoejecutivo.gob.mx/docs/pdfs/victimas/Victimas2015_102015.pdf"]
SECUESTRO_PDF = ["http://secretariadoejecutivo.gob.mx/docs/pdfs/fuero_federal/estadisticas%20fuero%20federal/secuestrofederal102015.pdf"]

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

def page_changed(lines, fname):
    hasher = hashlib.md5()
    hasher.update(lines)
    md = hasher.hexdigest()
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




def getPDF(link, crime_type):
    #baseurl = "http://secretariadoejecutivo.gob.mx/incidencia-delictiva/"
    # page = "incidencia-delictiva-victimas.php"
    change = False
    #r = requests.get(baseurl + page)

    #data = r.text
    #soup = BeautifulSoup(data)

    #headers = StringIO()
    #for i, link in enumerate(soup.findAll('a', href=re.compile(crime_type + '.*pdf'))):
    for i, link in enumerate(link):
        #print link['href']
        #if link['href'] == '../docs/pdfs/victimas/Victimas2015_032015.pdf':
        #    continue
        #if link['href'] == '../docs/pdfs/victimas/Victimas2014_052015.pdf':
        #    continue
        year = re.findall('\d{4}', link)[0]
        fname = crime_type + '_' + year + '.pdf'
        with open('pdf/' + fname, "wb") as fp:
            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, link)
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

def get_filename_containing(files, string):
    return os.path.splitext( [x for x in files if string in x][0])[0] + '.csv'

def getXLSX(page, conn):
    baseurl = "http://secretariadoejecutivo.gob.mx/incidencia-delictiva/"
    # page = "incidencia-delictiva-fuero-comun.php"
    change = False
    crime_files = []
    print("Checking if page changed")
    r = requests.get(baseurl + page)
    
    data = r.text
    soup = BeautifulSoup(data)
    if page_changed(str(soup), os.path.join('page-checksums', page)):
        soup.find("div", {"id": "anois"})

        for i, link in enumerate(soup.find("div", {"id": "anios", "class": "excel"}).
                findAll('a', href=re.compile('.*pdf'))):
            print link['href']
            fname = ("estatal" if "Estatal" in link['href'] else "muncipal") + '.zip'
            with open('snsp-data/' + fname, "wb") as fp:
                curl = pycurl.Curl()
                curl.setopt(pycurl.URL, baseurl + urllib.quote(link['href']))
                curl.setopt(pycurl.WRITEDATA, fp)
                #curl.setopt(pycurl.HEADERFUNCTION, headers.write)
                curl.perform()
                curl.close()
                fp.close()
                if changed(os.path.join('snsp-data', fname)):
                    change = True
                    with zipfile.ZipFile(os.path.join('snsp-data', fname), "r") as z:
                        crime_files.append(z.namelist()[0])
                        for name in z.namelist():
                            outpath = 'snsp-data/'
                            z.extract(name, outpath)
                            os.system("cd 'snsp-data';libreoffice --headless --convert-to csv -env:UserInstallation=file:///tmp/foobar7665765 '" + name +"'")
        if change:
            #import pdb
            #pdb.set_trace()
	    print("writin state to db")
            write_state_db(conn, get_filename_containing(crime_files, "Estatal"))
            print("writin municipio to db")
            write_mun_db(conn, get_filename_containing(crime_files, "Municipal"))
    return change

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
    crime_municipios = CrimeMunicipios(os.path.join('snsp-data', CSV_MUNICIPIOS))
    print("preparing to write to db")
    pd_sql.to_sql(crime_municipios.tipo, 'tipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.subtipo, 'subtipo_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.modalidad, 'modalidad_municipios', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.municipios, 'municipio_names', conn, if_exists='append', index=False)
    pd_sql.to_sql(crime_municipios.population, 'population_municipios', conn, if_exists='append', index=False, chunksize=20000)
    print("writing municipio data to db")
    pd_sql.to_sql(crime_municipios.data, 'municipios_fuero_comun', conn, if_exists='append', index=False, chunksize=20000)
    print("end writing municipio data to db")

# Clean the PDFs with victim info
getPDF(VICTIMAS_PDF, "victima")
getPDF(SECUESTRO_PDF, "secuestro")

victimas = pd.DataFrame()
secuestros = pd.DataFrame()
for file in os.listdir("victimas-csv"):
    print(file)
    if "victima" in file:
        victimas = victimas.append(v.clean_comun(file))
    elif "federal" in file:
        secuestros = secuestros.append(v.clean_federal(file))

crimes = victimas.append(secuestros).sort(['fuero', 'state',  'modalidad', 'tipo', 'subtipo', 'date'])  # .to_csv("clean-data/victimas.csv", index=False)


#Clean the state and municipio fuero comun CSV files
CLEAN_DIR = os.path.join('..', 'db')
#CSV_MUNICIPIOS = 'snsp-data/Incidencia Delictiva FC Municipal 2011 - 2015.csv'
#CSV_ESTADOS = 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'

conn = sq.connect(os.path.join(CLEAN_DIR, 'crimenmexico.db'))
conn.execute('pragma foreign_keys=ON')
pd_sql.to_sql(crimes, 'victimas', conn, if_exists='replace', index=False)

getXLSX("incidencia-delictiva-fuero-comun.php", conn)

conn.close()
