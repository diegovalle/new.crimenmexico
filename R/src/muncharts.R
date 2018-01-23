source(file.path("src", "sql.R"))
db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns <- dbGetQuery(db, 
                   str_c(sql_query_hom,
                         " UNION",
                         sql_query_sec,
                         " UNION",
                         sql_query_ext,
                         " UNION",
                         # sql_query_viol,
                         # " UNION",
                         sql_query_rvsv,
                         " UNION",
                         sql_query_rvcv)
                   )
dbDisconnect(db)

#select * from municipios_fuero_comun natural join population_municipios where (state_code in (select state_code from population_municipios where population > 300000 and date = '2015-01') and mun_code in (select mun_code from population_municipios where population > 300000 and date = '2015-01'))

muns <- muns %>% 
  mutate(tipo = subtipo) %>%
  mutate(tipo = str_replace(tipo, "CON VIOLENCIA","Car Robbery with Violence")) %>%
  mutate(tipo = str_replace(tipo, "SIN VIOLENCIA", "Car Robbery without Violence")) %>%
  mutate(tipo = str_replace(tipo, "HOMICIDIO DOLOSO", "Intentional Homicide")) %>%
  mutate(tipo = str_replace(tipo, "FEMINICIDIO", "Intentional Homicide")) %>%
  mutate(tipo = str_replace(tipo, "EXTORSIÓN", "Extortion")) %>%
  mutate(tipo = str_replace(tipo, "SECUESTRO", "Kidnapping")) %>%
  group_by(date, tipo, state, state_code, municipio, mun_code) %>%
  summarise(count = sum(count), population = population[1]) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) #%>%
#   mutate(code = str_c(
#     str_pad(state_code, width = 2, pad = "0"), 
#     str_pad(mun_code, width = 3, pad = "0"))) 

muns <- inner_join(muns, abbrev, by = "state_code") %>%
  mutate(name = str_c(str_sub(municipio, 1, 21), ", ", state_abbrv))
muns$date %<>% as.yearmon  %>% as.Date %>% as.character 


fullmuns <- expand.grid(id = unique(str_c(str_mxmunicipio(muns$state_code, muns$mun_code), 
                                          "#", muns$tipo,
                                          "#", muns$name)),
           date = unique(muns$date))
fullmuns$date <- as.character(fullmuns$date)
fullmuns$state_code <- as.integer(str_sub(fullmuns$id, 1, 2))
fullmuns$mun_code <- as.integer(str_sub(fullmuns$id, 3, 5))
fullmuns$tipo <- str_split(fullmuns$id, "#", simplify = TRUE)[ ,2]
fullmuns$name <- str_split(fullmuns$id, "#", simplify = TRUE)[ ,3]
fullmuns$id <- NULL
muns <- full_join(muns, fullmuns, by = c("date", "tipo", "state_code", "mun_code", "name"))
rm(fullmuns)

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
municipios$rvcv <- filter(muns, tipo == "Car Robbery with Violence")[,c('date', 'tipo', 'name', 'count', 'rate')]
municipios$rvsv <- filter(muns, tipo == "Car Robbery without Violence")[,c('date', 'tipo', 'name', 'count', 'rate')]
#municipios$viol <- filter(muns, tipo == "VIOLACION")[,c('date', 'tipo', 'name', 'count', 'rate')]
write(toJSON(municipios, na = "null"), "json/municipios.json")

