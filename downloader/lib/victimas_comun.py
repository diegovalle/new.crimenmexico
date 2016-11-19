#!/usr/bin/env python # -*- coding: utf-8 -*-
from __future__ import print_function
from titlecase import titlecase
import pandas as pd
import glob
import os
import pdb
import unicodedata
import numpy as np

def strip_accents(input_str):
    nkfd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nkfd_form if not unicodedata.combining(c)])

def toupper(s):
    return s.decode( 'utf-8' ).upper()


columnNames = ['state', 'month', 'count',
               'year', 'date', 'modalidad', 'tipo', 'subtipo']
columnOrder = ['state', 'state_code', 'modalidad', 'tipo', 'subtipo', 'date', 'year', 'month', 'count', 'population']
mapping = [('Enero', '01'), ('Febrero', '02'),
           ('Marzo', '03'), ('Abril', '04'),
           ('Mayo', '05'), ('Junio', '06'),
           ('Julio', '07'), ('Agosto', '08'),
           ('Septiembre', '09'), ('Octubre', '10'),
           ('Noviembre', '11'), ('Diciembre', '12')]
months = ['Enero','Febrero',
          'Marzo','Abril',
          'Mayo', 'Junio',
          'Julio', 'Agosto',
          'Septiembre', 'Octubre',
          'Noviembre','Diciembre']



def clean_comun(file):
    print(file)
    victimas = pd.DataFrame()
    state_codes = pd.read_csv("data/state_codes.csv")
    population = pd.read_csv("data/pop_states.csv")
    df = pd.read_csv("victimas-csv/" + file)

    #assert structure of file
    assert(all(df.columns == [u'Entidad federativa', u'Enero', u'Febrero', u'Marzo',
                              u'Abril', u'Mayo', u'Junio', u'Julio', u'Agosto',
                              u'Septiembre', u'Octubre', u'Noviembre', u'Diciembre',
                              u'Total']))


    # If the column is all 0s treat is as if it were data that hasn't happened
    for month in reversed(months):
        col = (df[month] == 0)
        if col.count() == col.sum():
            df = df.drop(month, 1)
            print("Warning: Deleteing column -" + month + "- containg all 0")
        else:
            break


    df["Entidad federativa"] = df["Entidad federativa"].map(toupper)
    df["Entidad federativa"] = df["Entidad federativa"].map(strip_accents)
    df = df[df["Entidad federativa"] != 'NACIONAL']
    # If the column is all NaNs drop it
    df = df.dropna(axis=1, how='all')
    
    assert(all(df["Entidad federativa"].unique() == [u'AGUASCALIENTES', u'BAJA CALIFORNIA', u'BAJA CALIFORNIA SUR',
                                                   u'CAMPECHE', u'CHIAPAS', u'CHIHUAHUA', u'COAHUILA', u'COLIMA',
                                                   u'DISTRITO FEDERAL', u'DURANGO', u'GUANAJUATO', u'GUERRERO',
                                                   u'HIDALGO', u'JALISCO', u'MEXICO', u'MICHOACAN', u'MORELOS',
                                                   u'NAYARIT', u'NUEVO LEON', u'OAXACA', u'PUEBLA', u'QUERETARO',
                                                   u'QUINTANA ROO', u'SAN LUIS POTOSI', u'SINALOA', u'SONORA',
                                                   u'TABASCO', u'TAMAULIPAS', u'TLAXCALA', u'VERACRUZ', u'YUCATAN',
                                                   u'ZACATECAS']))
    
    df = pd.melt(df, id_vars = "Entidad federativa")
    df = df[df.variable != "Total"].copy()
    #pdb.set_trace()
    if "victima_2014" in file:
        df["year"] = 2014
    if "victima_2015" in file:
        df["year"] = 2015
    if "victima_2016" in file:
        df["year"] = 2016
    if "victima_2017" in file:
        df["year"] = 2017
    for k, v in mapping:
        df['variable'] = df['variable'].replace(k, v)
    #import pdb
    #pdb.set_trace()
    df['date'] = df["year"].map(str) + '-' + df['variable'] + '-01'
    if "homicidio_doloso" in file:
        df["modalidad"] = "HOMICIDIOS"
        df['tipo'] = "DOLOSOS"
        df['subtipo'] = "TOTAL"
    if "homicidio_culposo" in file:
        df["modalidad"] = "HOMICIDIOS"
        df['tipo'] = "CULPOSOS"
        df['subtipo'] = "TOTAL"
    if "secuestro" in file:
        df["modalidad"] = "PRIV. DE LA LIBERTAD (SECUESTRO)"
        df['tipo'] = "SECUESTRO"
        df['subtipo'] = "SECUESTRO"
    if "extorsion" in file:
        df["modalidad"] = "DELITOS PATRIMONIALES"
        df['tipo'] = "EXTORSION"
        df['subtipo'] = "EXTORSION"
    df.columns = columnNames
    victimas = victimas.append(df)


    victimas = pd.merge(victimas, state_codes, how = 'left')

    victimas = pd.merge(victimas, population, how = 'left')


    victimas = victimas.sort_values(['state',  'modalidad', 'tipo', 'subtipo', 'date'])
    victimas = victimas[columnOrder]
    #victimas.count = victimas['count'].str.replace(',', '')
    #victimas.state = victimas["state"].map(titlecase)
    victimas["fuero"] = "COMUN"
    victimas['state_code'] = victimas.state_code.map(int)
    victimas['count'] = victimas['count'].map(int)
    assert(len(victimas['state'].unique()) == 32)
    assert(len(victimas['modalidad'].unique()) == 1)
    victimas['date'] = victimas['date'].str.slice(0, 7)
    del victimas['year']
    del victimas['month']
    return victimas


def clean_comun_xls(url):
    victimas = pd.DataFrame()
    state_codes = pd.read_csv("data/state_codes.csv")
    population = pd.read_csv("data/pop_states.csv")
    df = pd.read_excel(url)
    
    if 'TOTAL' in df.columns:
      del df['TOTAL']
    #assert structure of file
    assert(all(df.columns == [u'AÑO', u'INEGI', u'ENTIDAD', u'DELITO', u'MODALIDAD',
                              u'ENERO', u'FEBRERO', u'MARZO',
                              u'ABRIL', u'MAYO', u'JUNIO', u'JULIO', u'AGOSTO',
                              u'SEPTIEMBRE', u'OCTUBRE', u'NOVIEMBRE', u'DICIEMBRE']))


    # If the column is all 0s treat is as if it were data that hasn't happened
    for month in reversed(months):
        month = toupper(month)
        col = (df[month] == 0)
        if col.count() == col.sum():
            df = df.drop(month, 1)
            print("Warning: Deleteing column -" + month + "- containg all 0")
        else:
            break


    df["ENTIDAD"] = df["ENTIDAD"].map(toupper)
    df["ENTIDAD"] = df["ENTIDAD"].map(strip_accents)
    df = df[df["ENTIDAD"] != 'NACIONAL']
    # If the column is all NaNs drop it
    df = df.dropna(axis=1, how='all')

    assert(all(df["ENTIDAD"].unique() == [u'AGUASCALIENTES', u'BAJA CALIFORNIA', u'BAJA CALIFORNIA SUR',
                                                   u'CAMPECHE', u'CHIAPAS', u'CHIHUAHUA', u'COAHUILA', u'COLIMA',
                                                   u'CIUDAD DE MEXICO', u'DURANGO', u'GUANAJUATO', u'GUERRERO',
                                                   u'HIDALGO', u'JALISCO', u'MEXICO', u'MICHOACAN', u'MORELOS',
                                                   u'NAYARIT', u'NUEVO LEON', u'OAXACA', u'PUEBLA', u'QUERETARO',
                                                   u'QUINTANA ROO', u'SAN LUIS POTOSI', u'SINALOA', u'SONORA',
                                                   u'TABASCO', u'TAMAULIPAS', u'TLAXCALA', u'VERACRUZ', u'YUCATAN',
                                                   u'ZACATECAS']))

    df = pd.melt(df, id_vars=[u'ENTIDAD', u'INEGI', u'DELITO', u'MODALIDAD', u'AÑO'])
    df = df[df.variable != "TOTAL"].copy()

    for k, v in mapping:
        df[u'variable'] = df[u'variable'].replace(toupper(k), v)

    df["SUBTIPO"] = "TOTAL"
    
    df["TIPO"] = df["MODALIDAD"]
    del df["MODALIDAD"]
    df.rename(columns={'DELITO': 'MODALIDAD'}, inplace=True)
    
    df.loc[df['MODALIDAD'] == "HOMICIDIO", "SUBTIPO"] = "TOTAL"
    df.loc[df['MODALIDAD'] == "SECUESTRO", "SUBTIPO"] = "SECUESTRO"
    df.loc[df['MODALIDAD'] == "EXTORSION", "SUBTIPO"] = "EXTORSION"
    df.loc[df['MODALIDAD'] == "SECUESTRO", "MODALIDAD"] = "PRIV. DE LA LIBERTAD (SECUESTRO)"
    df.loc[df['MODALIDAD'] == "EXTORSION", "MODALIDAD"] = "DELITOS PATRIMONIALES"
    
    df.loc[df['MODALIDAD'] == "HOMICIDIO", "MODALIDAD"] = "HOMICIDIOS"
    df.loc[df['TIPO'] == "DOLOSO", "TIPO"] = "DOLOSOS"
    df.loc[df['TIPO'] == "CULPOSO", "TIPO"] = "CULPOSOS"


    assert(all(df["MODALIDAD"].unique() == ['HOMICIDIOS', 'PRIV. DE LA LIBERTAD (SECUESTRO)',
       'DELITOS PATRIMONIALES']))
    assert(all(df["TIPO"].unique() == ['DOLOSOS', 'CULPOSOS', u'SECUESTRO', u'EXTORSION']))
    assert(all(df["SUBTIPO"].unique() == ['TOTAL', 'SECUESTRO', 'EXTORSION']))
    
    df['date'] = df[u"AÑO"].map(str) + '-' + df['variable'] + '-01'

    df.columns = ['state', 'inegi',  'modalidad',  'year','month',
               'count', 'subtipo', 'tipo', 'date']
    victimas = df
    del victimas["inegi"]

    victimas = pd.merge(victimas, state_codes, how = 'left')

    victimas = pd.merge(victimas, population, how = 'left')


    victimas = victimas.sort_values(['state',  'modalidad', 'tipo', 'subtipo', 'date'])
    victimas = victimas[columnOrder]


    # The SNSP reports months in the future as NA so get rid of them
    bad_dates = []
    for date in reversed(sorted(victimas.date.unique())):
        if (all(victimas[victimas['date'] == date]['count'].map(np.isnan)) |
                all(victimas[victimas['date'] == date]['count'] == 0)):
            print('removing state date: ' + date + ' because it consists of empty values')
            bad_dates.append(date)
            # df = df[df['date'] != date]
        else:
            break
    if len(bad_dates):
        victimas = victimas[~victimas['date'].isin(bad_dates)]


    #victimas.count = victimas['count'].str.replace(',', '')
    #victimas.state = victimas["state"].map(titlecase)
    victimas["fuero"] = "COMUN"
    victimas['state_code'] = victimas.state_code.map(int)
    victimas['count'] = victimas['count'].map(int)
    assert(len(victimas['state'].unique()) == 32)
    assert(len(victimas['modalidad'].unique()) == 3)
    victimas['date'] = victimas['date'].str.slice(0, 7)
    del victimas['year']
    del victimas['month']
    return victimas

def clean_federal(file):
    state_codes = pd.read_csv("data/state_codes.csv")
    population = pd.read_csv("data/pop_states.csv")
    df = pd.read_csv("victimas-csv/" +  file, skiprows=0, encoding = 'utf-8')

    df = df.drop(df.columns[14], axis=1)
    #df = df.drop(df.columns[0], axis=1)


    #del df['Unnamed: 0']
    assert(all(df.columns == [u'V\xedctimas', u'Enero', u'Febrero', u'Marzo',
                                 u'Abril', u'Mayo', u'Junio', u'Julio', u'Agosto',
                                 u'Septiembre', u'Octubre', u'Noviembre', u'Diciembre',
                                 u'Total']))
    del df['Total']
    

    df = df[0:33]
    df[u"V\xedctimas"] = df[u"V\xedctimas"].map(strip_accents)
    df[u"V\xedctimas"] = df[u"V\xedctimas"].map(toupper)
    df = df[df[u"V\xedctimas"] != 'NACIONAL']
    df = df[df[u"V\xedctimas"] != 'NO ESPECIFICADO']
    df = df[df[u"V\xedctimas"] != 'OTRO PAIS']
    df=df.dropna(axis=1, how='all')
    df=df.dropna(axis=0, how='all')

    # DISTRITO FEDERAL changed to CIUDAD DE MEXICO in some files but not others
    df.loc[df[u'V\xedctimas'] == "DISTRITO FEDERAL", u'V\xedctimas'] = "CIUDAD DE MEXICO"
    import pdb; pdb.set_trace()

    assert(all(df[u'V\xedctimas'].sort_values().unique() == [u'AGUASCALIENTES', u'BAJA CALIFORNIA', u'BAJA CALIFORNIA SUR',
       u'CAMPECHE', u'CHIAPAS', u'CHIHUAHUA', 'CIUDAD DE MEXICO',
       u'COAHUILA', u'COLIMA', u'DURANGO', u'GUANAJUATO', u'GUERRERO',
       u'HIDALGO', u'JALISCO', u'MEXICO', u'MICHOACAN', u'MORELOS',
       u'NAYARIT', u'NUEVO LEON', u'OAXACA', u'PUEBLA', u'QUERETARO',
       u'QUINTANA ROO', u'SAN LUIS POTOSI', u'SINALOA', u'SONORA',
       u'TABASCO', u'TAMAULIPAS', u'TLAXCALA', u'VERACRUZ', u'YUCATAN',
       u'ZACATECAS']))
    df = pd.melt(df, id_vars=u"V\xedctimas")
    

    for k, v in mapping:
        df['variable'] = df['variable'].replace(k, v)
    df.columns = ['state', 'month', 'count']
    if "secuestro_2014" in file:
        df["year"] = 2014
    if "secuestro_2015" in file:
        df["year"] = 2015
    if "secuestro_2016" in file:
        df["year"] = 2016
    if "secuestro_2017" in file:
        df["year"] = 2017
    df['date'] = df['year'].map(str) + '-' + df['month'] + '-01'

    df = df[df['state'] != 'NACIONAL']
    df = df[df['state'] != '']
    df["modalidad"] = "PRIV. DE LA LIBERTAD (SECUESTRO)"
    df['tipo'] = "SECUESTRO"
    df['subtipo'] = "SECUESTRO"
    df = pd.merge(df, state_codes, how = 'left')
    df = pd.merge(df, population, how = 'left')
    #df.count = df['count'].str.replace(',', '')
    #df.state = df["state"].map(titlecase)
    df = df[columnOrder]
    df['fuero'] = 'FEDERAL'
    df['state_code'] = df.state_code.apply(int)
    df['count'] = df['count'].apply(int)
    df['date'] = df['date'].str.slice(0, 7)
    del df['year']
    del df['month']
    return df


    


