print("feminicide.R")
db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
dbListTables(db) 
#vic <- dbReadTable(db, "victimas") 
feminicide <- dbGetQuery(db, "
                 SELECT state, 
       v.state_code, 
       v.date, 
       Sum(count)                          AS count, 
       'Homicidio Doloso'                  AS tipo, 
       Sum(population) / Count(population) AS population 
FROM   estados_victimas v 
       natural JOIN tipo_states_victimas
       JOIN (SELECT Sum(population) AS population, 
                    state_code, 
                    date 
             FROM   population_age_sex 
                    natural JOIN sex 
             WHERE  sex_text = 'MUJER' 
             GROUP  BY date, 
                       state_code) p 
         ON v.state_code = p.state_code 
            AND v.date = p.date 
       natural JOIN state_names 
WHERE   tipo_text = 'FEMINICIDIO' 
GROUP  BY v.date, 
          v.state_code ")
dbDisconnect(db)


feminicide %<>%
  mutate(date = as.Date(as.yearmon(date))) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) %>%
  mutate(rate = round(rate, 1))



feminicide %<>%
  mutate(name = state)




states_feminicide_sm <- list()
states_feminicide_sm$hd <- subset(feminicide, tipo == 'Homicidio Doloso')[,c("tipo", "date", 
                                                                             "rate", "count", 
                                                                             "population", "name")]

exportJson <- toJSON(states_feminicide_sm, na = "null")
write(exportJson, "json/states_feminicide_sm.json")


national_feminicide <- feminicide %>%
  group_by(date) %>%
  summarise(count = sum(count), population = sum(population))%>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5)



national_feminicide_total <- list(national_feminicide)

exportJson <- toJSON(national_feminicide_total, na = "null")
write(exportJson, "json/states_feminicide_total.json")
# 
# ttt <- states.females.inegi.name %>%
#   mutate(year = year(date)) %>%
#   group_by(year, name) %>%
#   summarise(count = sum(count), population = sum(population)/12) %>%
#   na.omit() %>%
#   mutate(rate = (count / population) * 10^5)

