last_six_dates = str_sub(sort(unique(muns$date)), 0, 7)
last_six_dates = last_six_dates[length((last_six_dates)): (length(last_six_dates) - 5)]
last_six_dates_txt = paste(rep("'", 5),last_six_dates, rep("'", 5), collapse = ",", sep="")

centroids <- read.csv("data/mun_centroids.csv")


db2 <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns2 <- dbGetQuery(db2, str_c("SELECT state_code, state, mun_code, municipio, 
                    tipo_text as tipo, subtipo_text as subtipo, modalidad_text as modalidad,
                    date, count, population
                    FROM municipios_fuero_comun 
                    NATURAL JOIN modalidad_municipios 
                    NATURAL JOIN tipo_municipios  
                    NATURAL JOIN subtipo_municipios 
                    NATURAL JOIN state_names 
                    NATURAL JOIN municipio_names  
                    NATURAL JOIN population_municipios
                    WHERE
                    (date in (", last_six_dates_txt, ")) AND (
                    (
                    subtipo_text = 'HOMICIDIO DOLOSO' or 
                    subtipo_text = 'FEMINICIDIO'))"))
#select distinct date from municipios_fuero_comun order by date desc limit 6
dbDisconnect(db2)
unique(muns2$date)



# mun_map <- readOGR("maps", "MUNICIPIOS")
# bb <- bbox(as(extent(mun_map) , "SpatialPolygons"))
# mun_map@data$CVEGEO <- str_c(mun_map@data$CVE_ENT, mun_map@data$CVE_MUN)
# mun_map <- fortify(mun_map, region="CVEGEO")
# mun_map$code <- as.numeric(as.character(mun_map$id))

#Get rid of states that haven't updated their numbers recently
for(i in last_six_dates) {
  for(j in 1:32) {
    if(all(is.na(subset(muns2, state_code == j & date == i)$count))) {
      #browser()
      muns2 <- subset(muns2, state_code != j | date != i)
      print(str_c(i,"-", j))
    }
  }
}


muns2 <- muns2 %>%
  mutate(tipo = subtipo) %>%
  mutate(tipo = str_replace(tipo, "HOMICIDIO DOLOSO", "Intentional Homicide")) %>%
  mutate(tipo = str_replace(tipo, "FEMINICIDIO", "Intentional Homicide")) %>%
  group_by(tipo, state, state_code, municipio, mun_code) %>%
  summarise(count = sum(count, na.rm = TRUE), population = population[1], len = length(unique(date))) %>%
  mutate(rate = ((count ) * (12/len)) / population * 10^5) %>%
  mutate(code = str_c(str_pad(state_code, 2, pad = '0'), str_pad(mun_code, 3, pad = '0'))) %>%
  mutate(name = str_c(municipio, ", ", state)) %>%
  mutate(rate = round(rate, 1))
muns2$code <- as.numeric(muns2$code)



#mun_map <- right_join(filter(muns, tipo == "Intentional Homicide"), mun_map)
muns2 <- left_join(muns2, centroids, by = c("state_code", "mun_code")) %>%
  mutate(long = round(long, 3), lat = round(lat, 3))
muns2$rate2 <- ifelse(muns2$rate <= 120, muns2$rate, 120)
write.csv(filter(muns2, tipo == "Intentional Homicide")
          [,c("rate", "rate2", "name", "count", "population", "code", "long", "lat", "len")], 
          "interactive-map/municipios-centroids.csv",
          row.names = FALSE)

