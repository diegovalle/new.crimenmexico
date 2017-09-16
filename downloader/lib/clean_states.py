#!/usr/bin/env python # -*- coding: utf-8 -*-
# coding: utf-8

import sqlite3 as sq
import pandas as pd
import numpy as np
import os
import pandas.io.sql as pd_sql
import math


class CrimeStates:
    """"""
    _DATADIR = 'data'
    _columnNames = ['year', 'state',
                    'modalidad', 'tipo', 'subtipo',
                    '01', '02', '03', '04', '05', '06',
                    '07', '08', '09', '10', '11', '12']
    _cleanColumnNames = ['modalidad', 'tipo', 'subtipo', 'count', 'state_code', 'date']
    _columnOrder = ['state_code',
                    'modalidad', 'tipo', 'subtipo', 'date', 'count']
    _rawColumns = [u'AÑO', u'ENTIDAD',
                   u'MODALIDAD', u'TIPO', u'SUBTIPO',
                   u'ENERO', u'FEBRERO',
                   u'MARZO', u'ABRIL', u'MAYO', u'JUNIO',
                   u'JULIO', u'AGOSTO', u'SEPTIEMBRE',
                   u'OCTUBRE', u'NOVIEMBRE', u'DICIEMBRE']
    _ENTIDAD = [u'AGUASCALIENTES', u'BAJA CALIFORNIA', u'BAJA CALIFORNIA SUR',
                u'CAMPECHE', u'COAHUILA', u'COLIMA', u'CHIAPAS', u'CHIHUAHUA',
                u'CIUDAD DE MEXICO', u'DURANGO', u'GUANAJUATO', u'GUERRERO',
                u'HIDALGO', u'JALISCO', u'MEXICO', u'MICHOACAN', u'MORELOS',
                u'NAYARIT', u'NUEVO LEON', u'OAXACA', u'PUEBLA', u'QUERETARO',
                u'QUINTANA ROO', u'SAN LUIS POTOSI', u'SINALOA', u'SONORA',
                u'TABASCO', u'TAMAULIPAS', u'TLAXCALA', u'VERACRUZ', u'YUCATAN',
                u'ZACATECAS']
    _MODALIDAD = [u'DELITOS PATRIMONIALES', u'DELITOS SEXUALES (VIOLACION)',
                  u'HOMICIDIOS', u'LESIONES', u'OTROS DELITOS',
                  u'PRIV. DE LA LIBERTAD (SECUESTRO)', u'ROBO COMUN',
                  u'ROBO DE GANADO (ABIGEATO)', u'ROBO EN INSTITUCIONES BANCARIAS',
                  u'ROBO EN CARRETERAS']
    _TIPO = [u'ABUSO DE CONFIANZA', u'DA\xd1O EN PROPIEDAD AJENA', u'EXTORSION',
             u'FRAUDE', u'DESPOJO', u'VIOLACION', u'DOLOSOS', u'CULPOSOS',
             u'CULPOSAS', u'AMENAZAS', u'ESTUPRO', u'OTROS SEXUALES',
             u'RESTO DE LOS DELITOS (OTROS)', u'SECUESTRO', u'CON VIOLENCIA',
             u'SIN VIOLENCIA', u'ABIGEATO', u'DOLOSAS']
    _SUBTIPO = [u'ABUSO DE CONFIANZA', u'DA\xd1O EN PROPIEDAD AJENA', u'EXTORSION',
                u'FRAUDE', u'CON VIOLENCIA', u'SIN VIOLENCIA', u'SIN DATOS',
                u'VIOLACION', u'CON ARMA DE FUEGO', u'CON ARMA BLANCA', u'OTROS',
                u'AMENAZAS', u'ESTUPRO', u'OTROS SEXUALES',
                u'RESTO DE LOS DELITOS (OTROS)', u'SECUESTRO', u'A CASA HABITACION',
                u'A NEGOCIO', u'DE VEHICULOS', u'A TRANSPORTISTAS',
                u'A TRANSEUNTES', u'ABIGEATO', u'A BANCOS', u'A CASA DE BOLSA',
                u'A CASA DE CAMBIO', u'A EMPRESA DE TRASLADO DE VALORES',
                u'A CAMIONES DE CARGA', u'A AUTOBUSES', u'A VEHICULOS PARTICULARES']

    data = pd.DataFrame()
    modalidad = pd.DataFrame()
    tipo = pd.DataFrame()
    subtipo = pd.DataFrame()
    population = pd.DataFrame()
    state_codes = pd.DataFrame()

    def __init__(self, fname):
        self.clean_file(fname)

    def get_uniq_values(self, df, col):
        values = sorted(df[col].unique())
        values_codes = dict(zip(values, range(0, len(values))))
        return values_codes

    def get_uniq_df(self, df, col):
        values_codes = self.get_uniq_values(df, col)
        values_df = pd.DataFrame(values_codes.items(), columns=[col + '_text', col])
        return values_df.sort_values(col)

    def check_column(self, df, col, values):
        assert(all(item in values for item in  df[col].unique()))

    def check_file(self, df):
        assert (np.all(df.columns == self._rawColumns))
        self.check_column(df, 'ENTIDAD', self._ENTIDAD)
        self.check_column(df, 'MODALIDAD', self._MODALIDAD)
        self.check_column(df, 'TIPO', self._TIPO)
        self.check_column(df, 'SUBTIPO', self._SUBTIPO)

    def clean_file(self, fname):
        df = pd.read_csv(fname,  # 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'
                         encoding="windows-1252", thousands=",", dtype=object)
        if 'TOTAL' in [x.upper() for x in df.columns]:
            del df['TOTAL']
        if 'INEGI' in [x.upper() for x in df.columns]:
            del df['INEGI']
        df=df.dropna(axis=0, how='all')

        self.state_codes = pd.read_csv(os.path.join(self._DATADIR, "state_codes.csv"))
        population = pd.read_csv(os.path.join(self._DATADIR, "pop_states.csv"))
        population['date'] = population.date.str.slice(0, 7)
        self.population = population

        self.check_file(df)

        self.modalidad = self.get_uniq_df(df, 'MODALIDAD')
        self.tipo = self.get_uniq_df(df, 'TIPO')
        self.subtipo = self.get_uniq_df(df, 'SUBTIPO')

        df = df.replace({'MODALIDAD': self.get_uniq_values(df, 'MODALIDAD'),
                         'TIPO': self.get_uniq_values(df, 'TIPO'),
                         'SUBTIPO': self.get_uniq_values(df, 'SUBTIPO'),
                         })

        df.columns = self._columnNames
        #import pdb
        #pdb.set_trace()
        df = pd.melt(df, id_vars=['year', 'state', 'modalidad', 'tipo', 'subtipo'])
        df = pd.merge(df, self.state_codes)
        df['date'] = df["year"].map(int).map(str) + '-' + df['variable']
        del df['variable']  # delete month
        del df['year']
        del df['state']

        df.columns = self._cleanColumnNames

        df = df[self._columnOrder]
        df.is_copy = False
        # import pdb
        # pdb.set_trace()
        df['count'] = df['count'].map(str).replace(',', '')
        # df['count'] = df['count'].convert_objects(convert_numeric=True)
        df['count'] = pd.to_numeric(df['count'], errors='coerce')

        # The SNSP reports months in the future as NA so get rid of them
        bad_dates = []
        for date in reversed(sorted(df.date.unique())):
            if (all(df[df['date'] == date]['count'].map(np.isnan)) |
                    all(df[df['date'] == date]['count'] == 0)):
                print('removing state date: ' + date + ' because it consists of empty values')
                bad_dates.append(date)
                # df = df[df['date'] != date]
            else:
                break
        if len(bad_dates):
            df = df[~df['date'].isin(bad_dates)]

        self.data = df


class CrimeMunicipios(CrimeStates):
    """
    """
    _rawColumns = [u'AÑO', u'INEGI', u'ENTIDAD', u'MUNICIPIO', u'MODALIDAD', u'TIPO',
                   u'SUBTIPO', u'ENERO', u'FEBRERO', u'MARZO', u'ABRIL', u'MAYO', u'JUNIO',
                   u'JULIO', u'AGOSTO', u'SEPTIEMBRE', u'OCTUBRE', u'NOVIEMBRE', u'DICIEMBRE']
    _columnNames = ['year', 'inegi', 'state', 'municipio',
                    'modalidad', 'tipo', 'subtipo',
                    '01', '02', '03', '04', '05', '06',
                    '07', '08', '09', '10', '11', '12']
    _cleanColumnNames = ['modalidad', 'tipo', 'subtipo', 'count', 'state_code', 'mun_code', 'date']
    _columnOrder = ['state_code', 'mun_code',
                    'modalidad', 'tipo', 'subtipo', 'date', 'count']
    municipios = pd.DataFrame()

    def clean_file(self, fname):
        df = pd.read_csv(fname,  # 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'
                         encoding="windows-1252", thousands=",", dtype=object)
        if 'TOTAL' in [x.upper() for x in df.columns]:
            del df['TOTAL']

        self.municipios = pd.read_csv(os.path.join(self._DATADIR, "municipio_names.csv"),
                                      encoding='windows-1252')
        population = pd.read_csv(os.path.join(self._DATADIR, "pop_muns.csv"))
        population['date'] = population.date.str.slice(0, 7)
        self.population = population

        # There's an error in the SNSP data
        df['SUBTIPO'] = df['SUBTIPO'].replace(u'POR ARMA DE FUEGO', u'CON ARMA DE FUEGO')
        df['SUBTIPO'] = df['SUBTIPO'].replace(u'POR ARMA BLANCA', u'CON ARMA BLANCA')
        self.check_file(df)

        self.modalidad = self.get_uniq_df(df, 'MODALIDAD')
        self.tipo = self.get_uniq_df(df, 'TIPO')
        self.subtipo = self.get_uniq_df(df, 'SUBTIPO')

        df = df.replace({'MODALIDAD': self.get_uniq_values(df, 'MODALIDAD'),
                         'TIPO': self.get_uniq_values(df, 'TIPO'),
                         'SUBTIPO': self.get_uniq_values(df, 'SUBTIPO'),
                         })



        df.columns = self._columnNames

        del df['municipio']
        del df['state']

        df = pd.melt(df, id_vars=['year', 'inegi', 'modalidad', 'tipo', 'subtipo'])
        df['inegi'] = pd.to_numeric(df['inegi'])
        df['state_code'] = df['inegi'].apply(lambda x: math.floor(x / 1000)).astype(int)
        df['mun_code'] = df['inegi'].apply(lambda x: x % 1000)

        # Check that no weird mun codes have been added
        assert(df.query('mun_code > 570 & mun_code < 998').empty)
        # Check that all states exist (sometimes Queretaro is missing)
        for i in range(1, 33):
            print(df[df.state_code == i].count)
        # The SNSP uses different municipio names in the same db
        #self.municipios = pd.concat([df['state_code'], df['mun_code'], df['municipio']], axis=1).drop_duplicates()


        del df['inegi']
        
        df['date'] = df["year"].map(int).map(str) + '-' + df['variable']
        del df['variable']  # delete month
        del df['year']

        df.columns = self._cleanColumnNames

        df = df[self._columnOrder]

        df.is_copy = False
        df['count'] = df['count'].map(str).replace(',', '')
        df['count'] = pd.to_numeric(df['count'], errors='coerce')
        # mport pdb
        # pdb.set_trace()
        # The SNSP reports months in the future as NA so get rid of them
        bad_dates = []
        for date in reversed(sorted(df.date.unique())):
            if (all(df[df['date'] == date]['count'].map(np.isnan)) |
                    all(df[df['date'] == date]['count'] == 0)):
                print('removing municipio date: ' + date + ' because it consists of empty values')
                bad_dates.append(date)
                # df = df[df['date'] != date]
            else:
                break
        if len(bad_dates):
            df = df[~df['date'].isin(bad_dates)]

        self.data = df
