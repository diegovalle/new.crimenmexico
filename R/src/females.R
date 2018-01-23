db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
dbListTables(db) 
#vic <- dbReadTable(db, "victimas") 
fem <- dbGetQuery(db, "
 SELECT state, 
       v.state_code, 
       v.date, 
       Sum(count)                          AS count, 
       'Homicidio Doloso'                  AS tipo, 
       Sum(population) / Count(population) AS population 
FROM   estados_victimas v 
       natural JOIN tipo_states_victimas 
       natural JOIN subtipo_states_victimas
       natural JOIN sex
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
WHERE   (tipo_text = 'FEMINICIDIO' OR subtipo_text = 'HOMICIDIO DOLOSO' and sex_text = 'MUJER') 
GROUP  BY v.date, 
          v.state_code ")
dbDisconnect(db)


fem %<>%
  mutate(date = as.Date(as.yearmon(date))) %>%
  mutate(rate = ((count /  numberOfDays(date) * 30) * 12) / population * 10^5) %>%
  mutate(rate = round(rate, 1))



fem %<>%
  mutate(name = state)


states.females.inegi.name <- injury.intent %>%
  filter(year_reg >= 2014 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32) &
           sex == "Female") %>%
  group_by(year_reg, month_reg, state_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_reg, "-", month_reg, "-01"))) %>%
  right_join(subset(fem, 
                    tipo == 'Homicidio Doloso')
             [,c("tipo", "date", "population", "state_code", "name")], 
             by = c("date" = "date", "state_occur_death" = "state_code")) %>%
  mutate(count = ifelse(is.na(count) & year(date) <= max(injury.intent$year_reg), 0, count)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  mutate(rate = round(rate, 1)) %>%
  ungroup() %>% 
  rename(state_code = state_occur_death) %>%
  dplyr::select(-year_reg, -month_reg)


states_female_sm <- list()
states_female_sm$hd <- list(subset(fem, tipo == 'Homicidio Doloso')[,c("tipo", "date", 
                                                                       "rate", "count", 
                                                                       "population", "name")],
                     states.females.inegi.name)

exportJson <- toJSON(states_female_sm, na = "null")
write(exportJson, "json/states_females_sm.json")


national_females <- fem %>%
  group_by(date) %>%
  summarise(count = sum(count), population = sum(population))%>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5)

national_inegi_females <- states.females.inegi.name %>%
  group_by(date) %>%
  summarise(count = sum(count), population = sum(population))%>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5)


national_females_total <- list(national_females,
                                 national_inegi_females)

exportJson <- toJSON(national_females_total, na = "null")
write(exportJson, "json/states_females_total.json")
# 
# ttt <- states.females.inegi.name %>%
#   mutate(year = year(date)) %>%
#   group_by(year, name) %>%
#   summarise(count = sum(count), population = sum(population)/12) %>%
#   na.omit() %>%
#   mutate(rate = (count / population) * 10^5)

         