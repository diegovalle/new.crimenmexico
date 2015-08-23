hom <- filter(vic, tipo == 'Intentional Homicide' & state_abbrv == "BC")
hom$timestamp <-  as.POSIXlt(hom$date, tz = "CST")
res = breakout(hom, min.size=6, method='amoc', beta=.001, degree=1, plot=TRUE)
res$plot

db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
#dbListTables(db) 
vic <- dbGetQuery(db, "select * from victimas where modalidad = 'PRIV. DE LA LIBERTAD (SECUESTRO)'")


sec <- filter(vic, modalidad == "PRIV. DE LA LIBERTAD (SECUESTRO)")
sec %>%
  group_by(date) %>%
  summarise(count = sum(count))

library(seasonal)

Sys.setenv(X13_PATH = "/home/diego/Documents/personal/Math/x13/x13")
checkX13()

db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
#dbListTables(db) 
vic <- dbGetQuery(db, "select state, state_code, modalidad_text as modalidad, 
                  tipo_text as tipo, 
                  subtipo_text as subtipo, date, count, population, 
                  (count * 12) / population * 100000 as rate, 
                  'averiguaciones' as type 
                  from estados_fuero_comun natural join state_names 
                  natural join population_states natural join modalidad_states 
                  natural join subtipo_states natural 
                  join tipo_states 
                  where modalidad_text = 'HOMICIDIOS' and 
                  (tipo_text ='DOLOSOS')
                  ORDER BY state, modalidad, tipo, subtipo")


vic %<>%
  mutate(date = as.Date(as.yearmon(date))) %>%
  mutate(tipo = str_replace(tipo, "CON VIOLENCIA","Car Robbery with Violence"),
         tipo = str_replace(tipo, "SIN VIOLENCIA", "Car Robbery without Violence"),
         tipo = str_replace(tipo, "CULPOSOS", "Accidental Homicide"),
         tipo = str_replace(tipo, "DOLOSOS", "Intentional Homicide"),
         tipo = str_replace(tipo, "EXTORSION", "Extortion"),
         tipo = str_replace(tipo, "SECUESTRO", "Kidnapping")) %>%
  group_by(date, modalidad) %>%
  summarise(count = sum(count, na.rm=TRUE), population = population[1]) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) %>%
  filter(date > "2007-01-01")

m <- seas(ts(vic$count, start = 2007, frequency = 12),
          regression.aictest = "easter")
final(m)
plot(m)
summary(m)
