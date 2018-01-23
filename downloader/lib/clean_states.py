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
    _columnNames = ['year', 'state_code', 'state',
                    'bien_juridico', 'tipo', 'subtipo', 'modalidad',
                    '01', '02', '03', '04', '05', '06',
                    '07', '08', '09', '10', '11', '12']
    _cleanColumnNames = ['state_code', 'modalidad', 'tipo', 'subtipo', 'bien_juridico', 'count',  'date']
    _columnOrder = ['state_code', 'bien_juridico',
                    'tipo', 'subtipo', 'modalidad', 'date', 'count']
    _rawColumns = [u'A\xd1O', u'CLAVE_ENT', u'ENTIDAD', u'BIEN JUR\xcdDICO AFECTADO',
                   u'TIPO DE DELITO', u'SUBTIPO DE DELITO', u'MODALIDAD', u'ENERO',
                   u'FEBRERO', u'MARZO', u'ABRIL', u'MAYO', u'JUNIO', u'JULIO', u'AGOSTO',
                   u'SEPTIEMBRE', u'OCTUBRE', u'NOVIEMBRE', u'DICIEMBRE']
    _ENTIDAD = [u'AGUASCALIENTES', u'BAJA CALIFORNIA', u'BAJA CALIFORNIA SUR',
       u'CAMPECHE', u'CHIAPAS', u'CHIHUAHUA', u'CIUDAD DE M\xc9XICO',
       u'COAHUILA DE ZARAGOZA', u'COLIMA', u'DURANGO', u'GUANAJUATO',
       u'GUERRERO', u'HIDALGO', u'JALISCO', u'M\xc9XICO',
       u'MICHOAC\xc1N DE OCAMPO', u'MORELOS', u'NAYARIT', u'NUEVO LE\xd3N',
       u'PUEBLA', u'QUER\xc9TARO', u'QUINTANA ROO', u'SAN LUIS POTOS\xcd',
       u'SINALOA', u'SONORA', u'TABASCO', u'TAMAULIPAS', u'TLAXCALA',
       u'VERACRUZ DE IGNACIO DE LA LLAVE', u'YUCAT\xc1N', u'ZACATECAS',
       u'OAXACA']
    _MODALIDAD = [u'ABUSO DE CONFIANZA', u'DA\xd1O A LA PROPIEDAD', u'DESPOJO',
       u'EXTORSI\xd3N', u'FRAUDE', u'OTROS DELITOS CONTRA EL PATRIMONIO',
       u'CON VIOLENCIA', u'SIN VIOLENCIA',
       u'ROBO DE CABLES, TUBOS Y OTROS OBJETOS DESTINADOS A SERVICIOS P\xdaBLICOS CON VIOLENCIA',
       u'ROBO DE CABLES, TUBOS Y OTROS OBJETOS DESTINADOS A SERVICIOS P\xdaBLICOS SIN VIOLENCIA',
       u'ROBO DE HERRAMIENTA INDUSTRIAL O AGR\xcdCOLA CON VIOLENCIA',
       u'ROBO DE HERRAMIENTA INDUSTRIAL O AGR\xcdCOLA SIN VIOLENCIA',
       u'ROBO DE TRACTORES CON VIOLENCIA',
       u'ROBO DE TRACTORES SIN VIOLENCIA',
       u'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA',
       u'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA',
       u'ROBO DE EMBARCACIONES PEQUE\xd1AS Y GRANDES CON VIOLENCIA',
       u'ROBO DE EMBARCACIONES PEQUE\xd1AS Y GRANDES SIN VIOLENCIA',
       u'ROBO DE MOTOCICLETA CON VIOLENCIA',
       u'ROBO DE MOTOCICLETA SIN VIOLENCIA',
       u'INCUMPLIMIENTO DE OBLIGACIONES DE ASISTENCIA FAMILIAR',
       u'OTROS DELITOS CONTRA LA FAMILIA',
       u'VIOLENCIA DE G\xc9NERO EN TODAS SUS MODALIDADES DISTINTA A LA VIOLENCIA FAMILIAR',
       u'VIOLENCIA FAMILIAR', u'ABUSO SEXUAL', u'ACOSO SEXUAL',
       u'HOSTIGAMIENTO SEXUAL', u'INCESTO',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD Y LA SEGURIDAD SEXUAL',
       u'VIOLACI\xd3N EQUIPARADA', u'VIOLACI\xd3N SIMPLE',
       u'CORRUPCI\xd3N DE MENORES', u'OTROS DELITOS CONTRA LA SOCIEDAD',
       u'TRATA DE PERSONAS', u'ABORTO', u'CON ARMA BLANCA',
       u'CON ARMA DE FUEGO', u'CON OTRO ELEMENTO', u'NO ESPECIFICADO',
       u'EN ACCIDENTE DE TR\xc1NSITO',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'OTRO TIPO DE SECUESTROS', u'SECUESTRO CON CALIDAD DE REH\xc9N',
       u'SECUESTRO EXPR\xc9S', u'SECUESTRO EXTORSIVO',
       u'SECUESTRO PARA CAUSAR DA\xd1O', u'TR\xc1FICO DE MENORES',
       u'ALLANAMIENTO DE MORADA', u'AMENAZAS', u'CONTRA EL MEDIO AMBIENTE',
       u'DELITOS COMETIDOS POR SERVIDORES P\xdaBLICOS', u'ELECTORALES',
       u'EVASI\xd3N DE PRESOS', u'FALSEDAD', u'FALSIFICACI\xd3N',
       u'NARCOMENUDEO', u'OTROS DELITOS DEL FUERO COM\xdaN']
    _TIPO = [u'ABUSO DE CONFIANZA', u'DA\xd1O A LA PROPIEDAD', u'DESPOJO',
       u'EXTORSI\xd3N', u'FRAUDE', u'OTROS DELITOS CONTRA EL PATRIMONIO',
       u'ROBO', u'INCUMPLIMIENTO DE OBLIGACIONES DE ASISTENCIA FAMILIAR',
       u'OTROS DELITOS CONTRA LA FAMILIA',
       u'VIOLENCIA DE G\xc9NERO EN TODAS SUS MODALIDADES DISTINTA A LA VIOLENCIA FAMILIAR',
       u'VIOLENCIA FAMILIAR', u'ABUSO SEXUAL', u'ACOSO SEXUAL',
       u'HOSTIGAMIENTO SEXUAL', u'INCESTO',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD Y LA SEGURIDAD SEXUAL',
       u'VIOLACI\xd3N EQUIPARADA', u'VIOLACI\xd3N SIMPLE',
       u'CORRUPCI\xd3N DE MENORES', u'OTROS DELITOS CONTRA LA SOCIEDAD',
       u'TRATA DE PERSONAS', u'ABORTO', u'FEMINICIDIO',
       u'HOMICIDIO', u'LESIONES',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'SECUESTRO', u'TR\xc1FICO DE MENORES', u'ALLANAMIENTO DE MORADA',
       u'AMENAZAS', u'CONTRA EL MEDIO AMBIENTE',
       u'DELITOS COMETIDOS POR SERVIDORES P\xdaBLICOS', u'ELECTORALES',
       u'EVASI\xd3N DE PRESOS', u'FALSEDAD', u'FALSIFICACI\xd3N',
       u'NARCOMENUDEO', u'OTROS DELITOS DEL FUERO COM\xdaN']
    _SUBTIPO = [u'ABUSO DE CONFIANZA', u'DA\xd1O A LA PROPIEDAD', u'DESPOJO',
       u'EXTORSI\xd3N', u'FRAUDE', u'OTROS DELITOS CONTRA EL PATRIMONIO',
       u'OTROS ROBOS', u'ROBO A CASA HABITACI\xd3N',
       u'ROBO A INSTITUCI\xd3N BANCARIA', u'ROBO A NEGOCIO',
       u'ROBO A TRANSE\xdaNTE EN ESPACIO ABIERTO AL P\xdaBLICO',
       u'ROBO A TRANSE\xdaNTE EN V\xcdA P\xdaBLICA',
       u'ROBO A TRANSPORTISTA', u'ROBO DE AUTOPARTES', u'ROBO DE GANADO',
       u'ROBO DE MAQUINARIA', u'ROBO DE VEH\xcdCULO AUTOMOTOR',
       u'ROBO EN TRANSPORTE INDIVIDUAL',
       u'ROBO EN TRANSPORTE P\xdaBLICO COLECTIVO',
       u'ROBO EN TRANSPORTE P\xdaBLICO INDIVIDUAL',
       u'INCUMPLIMIENTO DE OBLIGACIONES DE ASISTENCIA FAMILIAR',
       u'OTROS DELITOS CONTRA LA FAMILIA',
       u'VIOLENCIA DE G\xc9NERO EN TODAS SUS MODALIDADES DISTINTA A LA VIOLENCIA FAMILIAR',
       u'VIOLENCIA FAMILIAR', u'ABUSO SEXUAL', u'ACOSO SEXUAL',
       u'HOSTIGAMIENTO SEXUAL', u'INCESTO',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD Y LA SEGURIDAD SEXUAL',
       u'VIOLACI\xd3N EQUIPARADA', u'VIOLACI\xd3N SIMPLE',
       u'CORRUPCI\xd3N DE MENORES', u'OTROS DELITOS CONTRA LA SOCIEDAD',
       u'TRATA DE PERSONAS', u'ABORTO', u'FEMINICIDIO',
       u'HOMICIDIO CULPOSO', u'HOMICIDIO DOLOSO', u'LESIONES CULPOSAS',
       u'LESIONES DOLOSAS',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'SECUESTRO', u'TR\xc1FICO DE MENORES', u'ALLANAMIENTO DE MORADA',
       u'AMENAZAS', u'CONTRA EL MEDIO AMBIENTE',
       u'DELITOS COMETIDOS POR SERVIDORES P\xdaBLICOS', u'ELECTORALES',
       u'EVASI\xd3N DE PRESOS', u'FALSEDAD', u'FALSIFICACI\xd3N',
       u'NARCOMENUDEO', u'OTROS DELITOS DEL FUERO COM\xdaN']
    _BIEN_JURIDICO = [u'EL PATRIMONIO', u'LA FAMILIA',
       u'LA LIBERTAD Y LA SEGURIDAD SEXUAL', u'LA SOCIEDAD',
       u'LA VIDA Y LA INTEGRIDAD CORPORAL', u'LIBERTAD PERSONAL',
       u'OTROS BIENES JUR\xcdDICOS AFECTADOS (DEL FUERO COM\xdaN)']

    data = pd.DataFrame()
    modalidad = pd.DataFrame()
    tipo = pd.DataFrame()
    subtipo = pd.DataFrame()
    bien_juridico = pd.DataFrame()
    population = pd.DataFrame()
    state_codes = pd.DataFrame()

    def __init__(self, fname):
        self.clean_file(fname)

    def get_uniq_values(self, df, col):
        values = sorted(df[col].unique())
        values_codes = dict(zip(values, range(0, len(values))))
        return values_codes

    def get_uniq_df(self, df, col, col_name):
        values_codes = self.get_uniq_values(df, col)
        values_df = pd.DataFrame(values_codes.items(), columns=[col_name + '_text', col_name])
        return values_df.sort_values(col_name)

    def check_column(self, df, col, values):
        assert(all(item in values for item in df[col].unique()))

    def check_file(self, df):
        assert (np.all(df.columns == self._rawColumns))
        df.rename(columns={u'BIEN JUR\xcdDICO AFECTADO' : u'BIEN JURIDICO'}, inplace=True)
        df[u'ENTIDAD'] = df[u'ENTIDAD'].str.upper()
        df[u'BIEN JURIDICO'] = df[u'BIEN JURIDICO'].str.upper()
        df[u'TIPO DE DELITO'] = df[u'TIPO DE DELITO'].str.upper()
        df[u'SUBTIPO DE DELITO'] = df[u'SUBTIPO DE DELITO'].str.upper()
        df[u'MODALIDAD'] = df[u'MODALIDAD'].str.upper()
        if u'SEXO' in df.columns:
            df[u'SEXO'] = df[u'SEXO'].str.upper()
            self.check_column(df, 'SEXO', self._SEXO)
        if u'RANGO DE EDAD' in df.columns:
            df[u'RANGO DE EDAD'] = df[u'RANGO DE EDAD'].str.upper()
            self.check_column(df, 'RANGO DE EDAD', self._AGE_GROUP)
        self.check_column(df, 'ENTIDAD', self._ENTIDAD)
        self.check_column(df, 'MODALIDAD', self._MODALIDAD)
        self.check_column(df, 'TIPO DE DELITO', self._TIPO)
        self.check_column(df, 'SUBTIPO DE DELITO', self._SUBTIPO)
        self.check_column(df, u'BIEN JURIDICO', self._BIEN_JURIDICO)

    def clean_file(self, fname):
        df = pd.read_csv(fname, 
                         encoding="windows-1252", thousands=",", dtype=object)
        df.columns = map(unicode.upper, df.columns)
        df.columns = df.columns.str.replace(u'ANO', u'AÑO')
        
        if 'TOTAL' in [x.upper() for x in df.columns]:
            del df['TOTAL']
        df = df.dropna(axis=0, how='all')

        self.state_codes = pd.read_csv(os.path.join(self._DATADIR, "state_codes.csv"),
                                      encoding='windows-1252')
        population = pd.read_csv(os.path.join(self._DATADIR, "pop_states.csv"))
        population['date'] = population.date.str.slice(0, 7)
        self.population = population
        self.check_file(df)

        self.modalidad = self.get_uniq_df(df, 'MODALIDAD', 'modalidad')
        self.tipo = self.get_uniq_df(df, 'TIPO DE DELITO', 'tipo')
        self.subtipo = self.get_uniq_df(df, 'SUBTIPO DE DELITO', 'subtipo')
        self.bien_juridico = self.get_uniq_df(df, 'BIEN JURIDICO', 'bien_juridico')

        df = df.replace({'MODALIDAD': self.get_uniq_values(df, 'MODALIDAD'),
                         'TIPO DE DELITO': self.get_uniq_values(df, 'TIPO DE DELITO'),
                         'SUBTIPO DE DELITO': self.get_uniq_values(df, 'SUBTIPO DE DELITO'),
                         'BIEN JURIDICO': self.get_uniq_values(df, 'BIEN JURIDICO')
                         })

        df.columns = self._columnNames

        df = pd.melt(df, id_vars=['year', 'state_code', 'state', 'modalidad', 'tipo', 'subtipo', 'bien_juridico'])
        df['date'] = df["year"].map(int).map(str) + '-' + df['variable']
        del df['variable']  # delete month
        del df['year']
        del df['state']

        df.columns = self._cleanColumnNames

        df = df[self._columnOrder]
        df.is_copy = False
        df['count'] = df['count'].map(str).replace(',', '')
        df['count'] = pd.to_numeric(df['count'], errors='coerce')
        df['state_code'] = pd.to_numeric(df['state_code'])

        # The SNSP reports months in the future as NA so get rid of them
        bad_dates = []
        for date in reversed(sorted(df.date.unique())):
            if (all(df[df['date'] == date]['count'].map(np.isnan)) |
                    all(df[df['date'] == date]['count'] == 0)):
                print('removing state date: ' + date + ' because it consists of empty values')
                bad_dates.append(date)
            else:
                break
        if len(bad_dates):
            df = df[~df['date'].isin(bad_dates)]

        # Oaxaca didn't report any crimes in 2015, copy over CDMX info with all values set to NA
        if len(df[(df.state_code == 20) & (df.date.str.startswith('2015'))]) == 0:
            cdmx = df[(df.state_code == 8) & (df.date.str.startswith('2015'))]
            cdmx[:]['state_code'] = 20
            cdmx[:]['count'] = np.nan
            df = df.append(cdmx)
        self.data = df


class CrimeStatesVictimas(CrimeStates):
    """
    """
    _rawColumns = [u'A\xd1O', u'CLAVE_ENT', u'ENTIDAD', u'BIEN JUR\xcdDICO AFECTADO',
                   u'TIPO DE DELITO', u'SUBTIPO DE DELITO', u'MODALIDAD', u'SEXO', u'RANGO DE EDAD',
                   u'ENERO',
                   u'FEBRERO', u'MARZO', u'ABRIL', u'MAYO', u'JUNIO', u'JULIO', u'AGOSTO',
                   u'SEPTIEMBRE', u'OCTUBRE', u'NOVIEMBRE', u'DICIEMBRE']
    _columnNames = ['year', 'state_code', 'state', 'bien_juridico',
                    'tipo', 'subtipo', 'modalidad', 'sex', 'age_group',
                    '01', '02', '03', '04', '05', '06',
                    '07', '08', '09', '10', '11', '12']
    _cleanColumnNames = ['state_code', 'modalidad', 'tipo', 'subtipo', 'bien_juridico',
                         'sex', 'age_group', 'count',  'date']
    _columnOrder = ['date', 'state_code', 'bien_juridico',
                     'tipo', 'subtipo', 'modalidad', 'sex', 'age_group', 'count']
    _MODALIDAD = [u'EXTORSI\xd3N', u'CORRUPCI\xd3N DE MENORES',
       u'OTROS DELITOS CONTRA LA SOCIEDAD', u'TRATA DE PERSONAS',
       u'ABORTO', u'CON ARMA BLANCA', u'CON ARMA DE FUEGO',
       u'CON OTRO ELEMENTO', u'NO ESPECIFICADO',
       u'EN ACCIDENTE DE TR\xc1NSITO',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'OTRO TIPO DE SECUESTROS', u'SECUESTRO CON CALIDAD DE REH\xc9N',
       u'SECUESTRO EXPR\xc9S', u'SECUESTRO EXTORSIVO',
       u'SECUESTRO PARA CAUSAR DA\xd1O', u'TR\xc1FICO DE MENORES']
    _TIPO = [u'EXTORSI\xd3N', u'CORRUPCI\xd3N DE MENORES',
       u'OTROS DELITOS CONTRA LA SOCIEDAD', u'TRATA DE PERSONAS',
       u'ABORTO', u'FEMINICIDIO', u'HOMICIDIO', u'LESIONES',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'SECUESTRO', u'TR\xc1FICO DE MENORES']
    _SUBTIPO = [u'EXTORSI\xd3N', u'CORRUPCI\xd3N DE MENORES',
       u'OTROS DELITOS CONTRA LA SOCIEDAD', u'TRATA DE PERSONAS',
       u'ABORTO', u'FEMINICIDIO', u'HOMICIDIO CULPOSO',
       u'HOMICIDIO DOLOSO', u'LESIONES CULPOSAS', u'LESIONES DOLOSAS',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA VIDA Y LA INTEGRIDAD CORPORAL',
       u'OTROS DELITOS QUE ATENTAN CONTRA LA LIBERTAD PERSONAL', u'RAPTO',
       u'SECUESTRO', u'TR\xc1FICO DE MENORES']
    _BIEN_JURIDICO = [u'EL PATRIMONIO', u'LA SOCIEDAD',
       u'LA VIDA Y LA INTEGRIDAD CORPORAL', u'LIBERTAD PERSONAL']
    _SEXO = [u'HOMBRE', u'MUJER', u'NO IDENTIFICADO', u'NO ESPECIFICADO']
    _AGE_GROUP = [u'ADULTOS (18 Y M\xc1S)', u'MENORES DE EDAD (0-17)',
       u'NO ESPECIFICADO', u'NO IDENTIFICADO']
    sex = pd.DataFrame({'sex': ["1", "0", np.nan], 'sex_text': ['HOMBRE', 'MUJER', 'NA']})
    age_groups = pd.DataFrame({'age_group': ["0", "1", np.nan], 'age_group_text': ['0-17', '18+', 'NA']})

    def clean_file(self, fname):
        df = pd.read_csv(fname,
                         encoding="windows-1252", thousands=",", dtype=object)
        df.columns = map(unicode.upper, df.columns)
        df.columns = df.columns.str.replace(u'ANO', u'AÑO')

        if 'TOTAL' in [x.upper() for x in df.columns]:
            del df['TOTAL']
        df = df.dropna(axis=0, how='all')

        self.state_codes = pd.read_csv(os.path.join(self._DATADIR, "state_codes.csv"),
                                      encoding='windows-1252')
        population = pd.read_csv(os.path.join(self._DATADIR, "pop_states_age_sex.csv"))
        population['date'] = population.date.str.slice(0, 7)
        self.population = population
        self.check_file(df)

        df = df.replace({'SEXO': {u'NO IDENTIFICADO': np.nan, u'NO ESPECIFICADO' : np.nan}})
        df = df.replace({'RANGO DE EDAD': {u'NO IDENTIFICADO': np.nan, u'NO ESPECIFICADO': np.nan}})
        df = df.replace({'RANGO DE EDAD': {u'ADULTOS (18 Y M\xc1S)': 1, u'MENORES DE EDAD (0-17)': 0}})
        df = df.replace({'SEXO': {u'HOMBRE': 1, u'MUJER': 0}})

        self.modalidad = self.get_uniq_df(df, 'MODALIDAD', 'modalidad')
        self.tipo = self.get_uniq_df(df, 'TIPO DE DELITO', 'tipo')
        self.subtipo = self.get_uniq_df(df, 'SUBTIPO DE DELITO', 'subtipo')
        self.bien_juridico = self.get_uniq_df(df, 'BIEN JURIDICO', 'bien_juridico')

        df = df.replace({'MODALIDAD': self.get_uniq_values(df, 'MODALIDAD'),
                         'TIPO DE DELITO': self.get_uniq_values(df, 'TIPO DE DELITO'),
                         'SUBTIPO DE DELITO': self.get_uniq_values(df, 'SUBTIPO DE DELITO'),
                         'BIEN JURIDICO': self.get_uniq_values(df, 'BIEN JURIDICO'),
                         })

        df.columns = self._columnNames

        df = pd.melt(df, id_vars=['year', 'state_code', 'state', 'modalidad', 'tipo', 'subtipo',
                                  'bien_juridico', 'sex', 'age_group'])
        df['date'] = df["year"].map(int).map(str) + '-' + df['variable']
        del df['variable']  # delete month
        del df['year']
        del df['state']

        df.columns = self._cleanColumnNames

        df = df[self._columnOrder]
        df.is_copy = False
        df['count'] = df['count'].map(str).replace(',', '')
        df['count'] = pd.to_numeric(df['count'], errors='coerce')
        df['state_code'] = pd.to_numeric(df['state_code'])

        # The SNSP reports months in the future as NA so get rid of them
        bad_dates = []
        for date in reversed(sorted(df.date.unique())):
            if (all(df[df['date'] == date]['count'].map(np.isnan)) |
                    all(df[df['date'] == date]['count'] == 0)):
                print('removing state date: ' + date + ' because it consists of empty values')
                bad_dates.append(date)
            else:
                break
        if len(bad_dates):
            df = df[~df['date'].isin(bad_dates)]

        # Oaxaca didn't report any crimes in 2015, copy over CDMX info with all values set to NA
        if len(df[(df.state_code == 20) & (df.date.str.startswith('2015'))]) == 0:
            cdmx = df[(df.state_code == 8) & (df.date.str.startswith('2015'))]
            cdmx[:]['state_code'] = 20
            cdmx[:]['count'] = np.nan
            df = df.append(cdmx)
        self.data = df


class CrimeMunicipios(CrimeStates):
    """
    """
    _rawColumns = [u'AÑO', u'CLAVE_ENT', u'ENTIDAD', u'CVE_MUNICIPIO', u'MUNICIPIO',
       u'BIEN JUR\xcdDICO AFECTADO', u'TIPO DE DELITO', u'SUBTIPO DE DELITO',
       u'MODALIDAD', u'ENERO', u'FEBRERO', u'MARZO', u'ABRIL', u'MAYO',
       u'JUNIO', u'JULIO', u'AGOSTO', u'SEPTIEMBRE', u'OCTUBRE', u'NOVIEMBRE',
       u'DICIEMBRE']
    _columnNames = ['year', 'state_code', 'state', 'inegi', 'municipio', 'bien_juridico',
                    'tipo', 'subtipo', 'modalidad',
                    '01', '02', '03', '04', '05', '06',
                    '07', '08', '09', '10', '11', '12']
    _cleanColumnNames = ['bien_juridico', 'modalidad', 'tipo', 'subtipo', 'count', 'state_code', 'mun_code', 'date']
    _columnOrder = ['date', 'state_code', 'mun_code', 'bien_juridico',
                     'tipo', 'subtipo', 'modalidad',  'count']
    municipios = pd.DataFrame()

    def clean_file(self, fname):
        df = pd.read_csv(fname,  # 'snsp-data/IncidenciaDelictiva_FueroComun_Estatal_1997-2015.csv'
                         encoding="windows-1252", thousands=",", dtype=object)
        df.columns = map(unicode.upper, df.columns)
        df.columns = df.columns.str.replace(u'ANO', u'AÑO')
        df.columns = df.columns.str.replace(u'CVE. MUNICIPIO', u'CVE_MUNICIPIO')
        

        if 'TOTAL' in [x.upper() for x in df.columns]:
            del df['TOTAL']
        df = df.dropna(axis=0, how='all')

        self.municipios = pd.read_csv(os.path.join(self._DATADIR, "municipio_names.csv"),
                                      encoding='windows-1252')
        population = pd.read_csv(os.path.join(self._DATADIR, "pop_muns.csv"))
        population['date'] = population.date.str.slice(0, 7)
        self.population = population

        self.check_file(df)

        self.modalidad = self.get_uniq_df(df, 'MODALIDAD', 'modalidad')
        self.tipo = self.get_uniq_df(df, 'TIPO DE DELITO', 'tipo')
        self.subtipo = self.get_uniq_df(df, 'SUBTIPO DE DELITO', 'subtipo')
        self.bien_juridico = self.get_uniq_df(df, 'BIEN JURIDICO', 'bien_juridico')

        df = df.replace({'MODALIDAD': self.get_uniq_values(df, 'MODALIDAD'),
                         'TIPO DE DELITO': self.get_uniq_values(df, 'TIPO DE DELITO'),
                         'SUBTIPO DE DELITO': self.get_uniq_values(df, 'SUBTIPO DE DELITO'),
                         'BIEN JURIDICO': self.get_uniq_values(df, 'BIEN JURIDICO')
                         })

        df.columns = self._columnNames

        del df['municipio']
        del df['state']
        del df['state_code']

        df = pd.melt(df, id_vars=['year', 'inegi', 'bien_juridico', 'modalidad', 'tipo', 'subtipo'])
        df['inegi'] = pd.to_numeric(df['inegi'])
        df['state_code'] = df['inegi'].apply(lambda x: math.floor(x / 1000)).astype(int)
        df['mun_code'] = df['inegi'].apply(lambda x: x % 1000)

        # Check that no weird mun codes have been added
        assert(df.query('mun_code > 570 & mun_code < 998').empty)
        # Check that all states exist (sometimes Queretaro is missing)
        for i in range(1, 33):
            print(df[df.state_code == i]['state_code'].head(1))
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
        df['state_code'] = pd.to_numeric(df['state_code'])
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

        # Oaxaca didn't report any crimes in 2015, fill them with NA
        if len(df[(df.state_code == 20) & (df.date.str.startswith('2015'))]) == 0:
            oax = df[(df.state_code == 20) & (df.date.str.startswith('2016'))]
            oax[:]['date'] = oax[:]['date'].str.replace('2016', '2015')
            oax[:]['count'] = np.nan
            df = df.append(oax)
            
        self.data = df
