db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns <- dbGetQuery(db, "SELECT state_code, state, mun_code, municipio, 
                   tipo_text as tipo, subtipo_text as subtipo, modalidad_text as modalidad,
                   date, count, population
                   FROM municipios_fuero_comun 
                   NATURAL JOIN modalidad_municipios 
                   NATURAL JOIN tipo_municipios  
                   NATURAL JOIN subtipo_municipios 
                   NATURAL JOIN state_names 
                   NATURAL JOIN municipio_names  
                   NATURAL JOIN population_municipios t1
WHERE count is not NULL and (((modalidad_text = 'ROBO COMUN' and 
                  (tipo_text ='SIN VIOLENCIA' or tipo_text ='CON VIOLENCIA') 
                  and subtipo_text = 'DE VEHICULOS') or
(
                   tipo_text = 'SECUESTRO') or
(tipo_text = 'EXTORSION') or
(tipo_text = 'VIOLACION') or
(
modalidad_text  = 'HOMICIDIOS'
                   AND tipo_text = 'DOLOSOS'))
                   AND ( 

(EXISTS (select state_code, mun_code from population_municipios t2 where population > 500000 and 
date = '2010-06' and t1.state_code = t2.state_code and t1.mun_code = t2.mun_code)) or


((state_code = 15 and mun_code = 58) or
                   (state_code = 15 and mun_code = 33) or
                   (state_code = 15 and mun_code = 25) or
                   (state_code = 15 and mun_code = 57) or
                   (state_code = 9 and mun_code = 7) or
                   (state_code = 9 and mun_code = 17) or
                   (state_code = 9 and mun_code = 5) or
                   (state_code = 25 and mun_code = 12) or
                   (state_code = 25 and mun_code = 6) or
                   (state_code = 25 and mun_code = 1) or
(state_code = 12 and mun_code = 35) or
(state_code = 6 and mun_code = 2) or
(state_code = 6 and mun_code = 19) or
(state_code = 8 and mun_code = 32) or
                   (state_code = 6 and mun_code = 7) or
                   (state_code = 6 and mun_code = 9) or
                   (state_code = 8 and mun_code = 19) or
                   (state_code = 8 and mun_code = 37) or
(state_code = 19 and mun_code = 39) or
                   (state_code = 5 and mun_code = 30) or
                   (state_code = 5 and mun_code = 25) or
                   (state_code = 2 and mun_code = 4) or
(state_code = 10 and mun_code = 7) or
(state_code = 10 and mun_code = 12) or
                   (state_code = 14 and mun_code = 39) or
                   (state_code = 14 and mun_code = 120) or
(state_code = 2 and mun_code = 4) or
(state_code = 3 and mun_code = 3) or
                   (state_code = 12 and mun_code = 1) or
                   (state_code = 12 and mun_code = 29) or
(state_code = 30 and mun_code = 193) or
                   (state_code = 30 and mun_code = 28) or
                   (state_code = 28 and mun_code = 38) or
                   (state_code = 28 and mun_code = 22) or
                   (state_code = 28 and mun_code = 27) or
                   (state_code = 28 and mun_code = 32) or
                   (state_code = 17 and mun_code = 7) or
                   (state_code = 32 and mun_code = 56) or
                   (state_code = 32 and mun_code = 10) or
                   (state_code = 18 and mun_code = 17) or
                   (state_code = 16 and mun_code = 53) or
                   (state_code = 16 and mun_code = 6) or
                   (state_code = 16 and mun_code = 52) or
                   (state_code = 16 and mun_code = 102)
                   )))")
dbDisconnect(db)

#select * from municipios_fuero_comun natural join population_municipios where (state_code in (select state_code from population_municipios where population > 300000 and date = '2015-01') and mun_code in (select mun_code from population_municipios where population > 300000 and date = '2015-01'))

muns <- muns %>% 
  mutate(tipo = str_replace(tipo, "CON VIOLENCIA","Car Robbery with Violence"),
         tipo = str_replace(tipo, "SIN VIOLENCIA", "Car Robbery without Violence"),
         tipo = str_replace(tipo, "CULPOSOS", "Accidental Homicide"),
         tipo = str_replace(tipo, "DOLOSOS", "Intentional Homicide"),
         tipo = str_replace(tipo, "EXTORSION", "Extortion"),
         tipo = str_replace(tipo, "SECUESTRO", "Kidnapping")) %>%
  group_by(date, tipo, state, state_code, municipio, mun_code) %>%
  summarise(count = sum(count, na.rm = TRUE), population = population[1]) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) #%>%
#   mutate(code = str_c(
#     str_pad(state_code, width = 2, pad = "0"), 
#     str_pad(mun_code, width = 3, pad = "0"))) 

muns <- inner_join(muns, abbrev) %>%
  mutate(name = str_c(str_sub(municipio, 1, 21), ", ", state_abbrv))
muns$date %<>% as.yearmon  %>% as.Date %>% as.character 


muns.inegi <- injury.intent %>%
  filter(year_reg >= 2011 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32) &
           mun_occur_death < 900) %>%
  group_by(year_reg, month_reg, state_occur_death, mun_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.character(as.Date(str_c(year_reg, "-", month_reg, "-01")))) %>%
  right_join(subset(muns, tipo == "Intentional Homicide")
             [,c('date', 'tipo', 'name', 'state_code', 'mun_code', 'population')], 
             by = c("date" = "date", 
                    "state_occur_death" = "state_code", 
                    "mun_occur_death" = "mun_code")) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  ungroup() %>% 
  rename(state_code = state_occur_death,
         mun_code = mun_occur_death) %>%
  dplyr::select(-year_reg, -month_reg)

muns.inegi$rate[(is.na(muns.inegi$count) & muns.inegi$date < max(muns.inegi$date[!(is.na(muns.inegi$count))]))] <- 0
muns.inegi$count[(is.na(muns.inegi$count) & muns.inegi$date < max(muns.inegi$date[!(is.na(muns.inegi$count))]))] <- 0



municipios <- list()
municipios$hd <- list(filter(muns, tipo == "Intentional Homicide")[,c('date', 'tipo', 'name', 'count', 'rate')],
                      muns.inegi)
municipios$ext <- filter(muns, tipo == "Extortion")[,c('date', 'tipo', 'name', 'count', 'rate')]
municipios$sec <- filter(muns, tipo == "Kidnapping")[,c('date', 'tipo', 'name', 'count', 'rate')]
municipios$rvcv <- filter(muns, tipo == "Car Robbery without Violence")[,c('date', 'tipo', 'name', 'count', 'rate')]
municipios$rvsv <- filter(muns, tipo == "Car Robbery with Violence")[,c('date', 'tipo', 'name', 'count', 'rate')]
#municipios$viol <- filter(muns, tipo == "VIOLACION")[,c('date', 'tipo', 'name', 'count', 'rate')]
write(toJSON(municipios, na = "null"), "json/municipios.json")

