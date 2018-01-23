
mx <- readOGR("maps", "estatal")
bb <- bbox(as(extent(mx) , "SpatialPolygons"))
mx <- fortify(mx, region="CVEGEO")
mx$state_code <- as.numeric(as.character(mx$id))


abbrev <- read.csv(file.path("data", "state_abbreviations.csv"))

db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
dbListTables(db) 
#vic <- dbReadTable(db, "victimas") 
vic <- dbGetQuery(db, "select state, 
state_code,
                  'TOTAL' as modalidad, 
                  subtipo  as tipo, 
                  subtipo, 
                  date, 
                  count, 
                  population, 
                  'COMUN' as fuero, 
                  'victimas'as type
                  FROM (select  state, v.state_code, 
                  CASE subtipo_text
                  WHEN 'HOMICIDIO DOLOSO' THEN 'DOLOSOS'
                  WHEN 'FEMINICIDIO' THEN 'DOLOSOS'
                  WHEN 'HOMICIDIO CULPOSO' THEN 'CULPOSOS'
                  WHEN 'EXTORSIÓN' THEN 'EXTORSIÓN'
                  WHEN 'SECUESTRO' THEN 'SECUESTRO'
                  END subtipo,
                  v.date, 
                  sum(count) as count
                  from estados_victimas v
                  NATURAL JOIN state_names
                  NATURAL JOIN subtipo_states_victimas
                  where subtipo_text = 'HOMICIDIO DOLOSO' or 
                  subtipo_text = 'FEMINICIDIO' or 
                  subtipo_text = 'HOMICIDIO CULPOSO' or 
                  subtipo_text = 'SECUESTRO' or 
                  subtipo_text = 'EXTORSIÓN'
                  group by v.state_code, v.date, subtipo_text)
                  NATURAL JOIN population_states
                  UNION ALL
                  select state, 
                  state_code,
                  'TOTAL' as modalidad, 
                  tipo  as tipo, 
                  'ROBO DE VEHÍCULO AUTOMOTOR' as subtipo,
                  date, 
                  count, 
                  population, 
                  'COMUN' as fuero, 
                  'averiguaciones'as type
                  FROM (select  state, v.state_code, 
                  CASE modalidad_text
                  WHEN 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA' THEN 'CON VIOLENCIA'
                  WHEN 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA' THEN 'SIN VIOLENCIA'
                  END tipo,
                  v.date, 
                  sum(count) as count
                  from estados_fuero_comun v
                  NATURAL JOIN state_names
                  NATURAL JOIN modalidad_states
                  where modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA' or 
                  modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA'
                  group by v.state_code, v.date, modalidad_text)
                  NATURAL JOIN population_states")
dbDisconnect(db)

vic %<>%
  mutate(date = as.Date(as.yearmon(date))) %>%
  mutate(tipo = str_replace(tipo, "CON VIOLENCIA","Car Robbery with Violence"),
         tipo = str_replace(tipo, "SIN VIOLENCIA", "Car Robbery without Violence"),
         tipo = str_replace(tipo, "CULPOSOS", "Negligent Homicide"),
         tipo = str_replace(tipo, "DOLOSOS", "Intentional Homicide"),
         tipo = str_replace(tipo, "EXTORSIÓN", "Extortion"),
         tipo = str_replace(tipo, "SECUESTRO", "Kidnapping")) %>%
  group_by(date, modalidad, tipo, subtipo, state, state_code) %>%
  summarise(count = sum(count), population = population[1]) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) %>%
  mutate(rate = round(rate, 1))

# Before 2015 kidnappings didn't include federal crimes
#vic[(vic$date <= as.Date("2014-12-31") & vic$tipo == "Kidnapping"),]$count <- NA
#vic[(vic$date <= as.Date("2014-12-31") & vic$tipo == "Kidnapping"),]$rate <- NA

vic <- inner_join(vic, abbrev, by = "state_code")
# 
# year  <- vic %>%
#   group_by(year(date), modalidad, tipo, subtipo) %>%
#   summarise(count = sum(count), population = sum(population) / 12) %>%
#   mutate(rate = count / population * 10^5 )

max_date = vic$date %>% max(., na.rm = TRUE) %>% as.yearmon  %>% as.character 
min_date = vic$date %>% min(., na.rm = TRUE) %>% as.yearmon  %>% as.character 


homicide.map <- bigBins(vic, max_date, 
                        "Annualized\nIntentional Homicide\nVictimization Rate",
                        "HOMICIDE RATES IN MEXICO",
                        "Intentional Homicide")
national.chart <- smNational(na.omit(vic), "annualized crime rate",
                             "VICTIMIZATION RATES AT THE NATIONAL LEVEL", "date",
                             toupper(max_date), toupper(min_date))
# homicide.map <- bigMapHom(vic, "Intentional Homicide", "Annualized Homicide Victimization Rates",
#                           "HOMICIDE RATES IN MEXICO", max_date)

hom.sm <- smallMultiple(vic, "Intentional Homicide", "annualized homicide rate",
                        "number of victims")
sec.sm <- smallMultiple(vic, "Kidnapping", "annualized kidnapping rate",
                        "number of victims")
rvcv.sm <- smallMultiple(vic, "Car Robbery with Violence", 
                         "annualized car robbery w/ v. rate",
                         "number of reports")
rvsv.sm <- smallMultiple(vic, "Car Robbery without Violence", 
                         "annualized car robbery w/o v. rate",
                         "number of reports")


# sec.bub <- bubblePlot("Kidnapping","number of\nkidnappings",
#                       low = "#f7fcfd", high = "#00441b", mid = "#66c2a4")
# 
# 
# rvcv.bub <- bubblePlot("Car Robbery with Violence", 
#                        "number of\ncar robberies\nwith violence", 
#                        low = "#f7fcfd", high = "#4d004b", mid = "#8c96c6")
# rvsv.bub <- bubblePlot("Car Robbery without Violence", 
#                        "number of\ncar robberies\nwithout violence", 
#                        low = "#fff7fb", high = "#023858", mid = "#74a9cf")


sec.map <- bottomMap(vic, "Kidnapping", "Annualized\nKidnapping Rates", 
                     low = "#f7fcfd", high = "#00441b", mid = "#66c2a4", "KIDNAPPING",
                     max_date)
rvcv.map <- bottomMap(vic, "Car Robbery with Violence", 
                      "Annualized Car\nRobbery with\nViolence Rates", 
                      low = "#f7fcfd", high = "#4d004b", mid = "#8c96c6", "CAR ROBBERY W/ V.",
                      max_date)
rvsv.map <- bottomMap(vic, "Car Robbery without Violence", 
                      "Annualized Car\nRobbery without\nViolence Rates", 
                      low = "#fff7fb", high = "#023858", mid = "#74a9cf", "CAR ROBBERY W/O V.",
                      max_date)

note <- "Kidnappings, homicides, and extortions refer to victims; car robberies to police reports. Car robberies include ROBO DE COCHE DE 4 RUEDAS under 
the new methodology. Homicides include HOMICIDIOS DOLOSOS and FEMINICIDIO.
According to the National Crime Victimization Survey (ENVIPE) extortions have remained roughly stabe, the same as according to the SNSP. Car Robberies 
do match the stable ENVIPE trend (2015-2016), and homicides follow the trend reported by the INEGI"

attribution <- paste(
  "Website: https://elcri.men/en/",
  "Author: Diego Valle-Jones @diegovalle",
  "Data Source: Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública (secretariadoejecutivo.gob.mx) and CONAPO",
  sep = "\n")


toSvg(str_c("graphs/infographic_", tolower(str_replace(max_date, " ", "_")), ".svg"), 
      "CRIME in MEXICO", max_date, note, attribution)

## system(str_replace_all("convert graphs/infographic_XXX.svg graphs/infographic_XXX.png; 
##        optipng graphs/infographic_XXX.png;", "XXX",
##                        tolower(str_replace(max_date, " ", "_"))))

## Chart in Spanish

vic  <- 
  mutate(as.data.frame(vic), tipo = str_replace(tipo, "Car Robbery with Violence","Robo de vehículo con violencia"),
         tipo = str_replace(tipo, "Car Robbery without Violence", "Robo de vehículo sin violencia"),
         tipo = str_replace(tipo, "Negligent Homicide", "Homicidio con Negligencia"),
         tipo = str_replace(tipo, "Intentional Homicide", "Homicidio Doloso"),
         tipo = str_replace(tipo, "Extortion", "Extorsión"),
         tipo = str_replace(tipo, "Kidnapping", "Secuestro")) 

# vic <- inner_join(vic, abbrev)

# year  <- vic %>%
#   group_by(year(date), modalidad, tipo, subtipo) %>%
#   summarise(count = sum(count), population = sum(population) / 12) %>%
#   mutate(rate = count / population * 10^5 )

lct <- Sys.getlocale("LC_TIME")
Sys.setlocale("LC_TIME", "es_ES.UTF-8")

max_date = vic$date %>% max(., na.rm = TRUE) %>% as.yearmon  %>% as.character 
min_date = vic$date %>% min(., na.rm = TRUE) %>% as.yearmon  %>% as.character

national.chart <- smNational(na.omit(vic), "tasa anualizada",
                             "TASAS A NIVEL NACIONAL", "fecha",
                             toupper(max_date), toupper(min_date))
# homicide.map <- bigMapHom(vic, "Homicidio Doloso", "tasa anualizada de homicidio",
#                           "TASA DE HOMICIDIO", max_date)
homicide.map <- bigBins(vic, max_date, 
                        "tasa anualizada de\nhomicidio intencional",
                        "TASAS DE HOMICIDIO",
                        "Homicidio Doloso")

hom.sm <- smallMultiple(vic, "Homicidio Doloso", "tasa anualizada de homicidio",
                        "número de víctimas")
sec.sm <- smallMultiple(vic, "Secuestro", "tasa anualizada de secuestro",
                        "número de víctimas")
rvcv.sm <- smallMultiple(vic, "Robo de vehículo con violencia", 
                         "tasa anualizada de robo de v. c/v",
                         "número de averiguaciones")
rvsv.sm <- smallMultiple(vic, "Robo de vehículo sin violencia", 
                         "tasa anualizada de robo de v. s/v",
                         "número de averiguaciones")


# sec.bub <- bubblePlot("Secuestro","number of\nkidnappings",
#                       low = "#f7fcfd", high = "#00441b", mid = "#66c2a4")
# 
# 
# rvcv.bub <- bubblePlot("Robo de vehículo con violencia", 
#                        "number of\ncar robberies\nwith violence", 
#                        low = "#f7fcfd", high = "#4d004b", mid = "#8c96c6")
# rvsv.bub <- bubblePlot("Robo de vehículo sin violencia", 
#                        "number of\ncar robberies\nwithout violence", 
#                        low = "#fff7fb", high = "#023858", mid = "#74a9cf")

sec.map <- bottomMap(vic, "Secuestro", "Tasa Anualizada\nde Secuestros", 
                     low = "#f7fcfd", high = "#00441b", mid = "#66c2a4", "SECUESTRO",
                     max_date)
rvcv.map <- bottomMap(vic, "Robo de vehículo con violencia", 
                      "Tasa Anualizada\nde robo de\nvehículo c/v", 
                      low = "#f7fcfd", high = "#4d004b", mid = "#8c96c6", "ROBO DE VEHÍCULO C/V",
                      max_date)
rvsv.map <- bottomMap(vic, "Robo de vehículo sin violencia", 
                      "Tasa Anualizada\nde robo de\nvehículo s/v", 
                      low = "#fff7fb", high = "#023858", mid = "#74a9cf", "ROBO DE VEHÍCULO S/V",
                      max_date)

note <- "Los secuestros, homicidios y extorsiones refieren el número de victimas, pero los robos de vehículo las averiguaciones previas. Los datos corresponden a la nueva metodología. Los robos de vehículo son los de cuarto ruedas. Los homicidios incluyen feminicidios
Según la ENVIPE las extorsiones han permanesido estables, lo mismo que reporta el el SNSP. Los robos de vehículo coinciden con la 
tendencia estable de la ENVIPE (2015-2016), los homicidios también coinciden en tendencia con datos del INEGI/SSA"

attribution <- paste(
  "Web: https://elcri.men/",
  "Autor: Diego Valle @diegovalle",
  "Fuente: Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública (secretariadoejecutivo.gob.mx) y CONAPO",
  sep = "\n")


toSvg(str_c("graphs/infographic_es_", tolower(str_replace(max_date, " ", "_")), ".svg"), 
      "CRIMEN en MÉXICO", max_date, note, attribution)

Sys.setlocale("LC_TIME", lct)

## system(str_replace_all("
##        convert graphs/infographic_es_XXX.svg graphs/infographic_es_XXX.png; 
##        optipng graphs/infographic_es_XXX.png", "XXX", 
##                        tolower(str_replace(max_date, " ", "_"))))

# 
# head(vic)
# library(BreakoutDetection)
# data(Scribe)
# res = breakout(Scribe, min.size=24, method='multi', beta=.001, degree=1, plot=TRUE)
# res$plot
# hom <- filter(vic, state_abbrv == "GRO" & tipo == "Homicidio Doloso")
# breakout(hom$rate, min.size = 2, method = 'multi', beta=0.001, plot=TRUE)

