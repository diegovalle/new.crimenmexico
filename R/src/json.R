national <- vic %>% 
  group_by(date, modalidad, tipo, subtipo) %>% 
  summarise(count = sum(count), pop = sum(population)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  ) 
national$tipo <- reorder(national$tipo, -national$rate, mean, na.rm = TRUE)

hd.inegi <- injury.intent %>%
  filter(year_reg >= 2014 & intent.imputed == "Homicide") %>%
  group_by(year_reg, month_reg) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_reg, "-", month_reg, "-01"))) %>%
  right_join(filter(national[,c("tipo", "date", "pop")],
                   tipo == 'Homicidio Doloso'), by = "date") %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5) %>%
  ungroup() %>%
  dplyr::select(-year_reg, -month_reg)

ll.national <- list()
ll.national$hd <- list(filter(national[,c("tipo", "date", "rate", "count", "pop")], 
                         tipo == 'Homicidio Doloso'),
                      hd.inegi)
ll.national$ext <- filter(national[,c("tipo", "date", "rate", "count", "pop")], tipo == 'Extorsión')
ll.national$sec <- filter(national[,c("tipo", "date", "rate", "count", "pop")], tipo == 'Secuestro')
ll.national$rvcv <- filter(national[,c("tipo", "date", "rate", "count", "pop")], tipo == 'Robo de vehículo con violencia')
ll.national$rvsv <- filter(national[,c("tipo", "date", "rate", "count", "pop")], tipo == 'Robo de vehículo sin violencia')
write(toJSON(ll.national), "json/national.json")


states_last <- list()
states_last$hd <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Homicidio Doloso')
states_last$ext <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Extorsión')
states_last$sec <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Secuestro')
states_last$rvcv<- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Robo de vehículo con violencia')
states_last$rvsv <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Robo de vehículo sin violencia')
write(toJSON(states_last), "json/states_last.json")


states.inegi <- injury.intent %>%
  filter(year_reg >= 2014 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32)) %>%
  group_by(year_reg, month_reg, state_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_reg, "-", month_reg, "-01"))) %>%
  right_join(subset(vic, 
                   tipo == 'Homicidio Doloso')
            [,c("tipo", "date", "population", "state_code")], 
            by = c("date" = "date", "state_occur_death" = "state_code")) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  ungroup() %>% 
  rename(state_code = state_occur_death) %>%
  dplyr::select(-year_reg, -month_reg)

states <- list()
states$hd <- list(
  subset(vic, tipo == 'Homicidio Doloso')[,c("tipo", "date", "rate", "count", "population", "state_code")],
  states.inegi
)
states$ext <- subset(vic, tipo == 'Extorsión')[,c("tipo", "date", "rate", "count", "population", "state_code")]
states$sec <- subset(vic, tipo == 'Secuestro')[,c("tipo", "date", "rate", "count", "population", "state_code")]
states$rvcv<- subset(vic, tipo == 'Robo de vehículo con violencia')[,c("tipo", "date", "rate", "count", "population", "state_code")]
states$rvsv <- subset(vic, tipo == 'Robo de vehículo sin violencia')[,c("tipo", "date", "rate", "count", "population", "state_code")]
exportJson <- toJSON(states, na = "null")
write(exportJson, "json/states.json")


vic %<>%
  mutate(name = state)

states.inegi.name <- injury.intent %>%
  filter(year_reg >= 2014 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32)) %>%
  group_by(year_reg, month_reg, state_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_reg, "-", month_reg, "-01"))) %>%
  right_join(subset(vic, 
                    tipo == 'Homicidio Doloso')
             [,c("tipo", "date", "population", "state_code", "name")], 
             by = c("date" = "date", "state_occur_death" = "state_code")) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  ungroup() %>% 
  rename(state_code = state_occur_death) %>%
  dplyr::select(-year_reg, -month_reg)


states_sm <- list()
states_sm$hd <- list(subset(vic, tipo == 'Homicidio Doloso')[,c("tipo", "date", "rate", "count", "population", "name")],
                     states.inegi.name)
states_sm$ext <- subset(vic, tipo == 'Extorsión')[,c("tipo", "date", "rate", "count", "population", "name")]
states_sm$sec <- subset(vic, tipo == 'Secuestro')[,c("tipo", "date", "rate", "count", "population", "name")]
states_sm$rvcv<- subset(vic, tipo == 'Robo de vehículo con violencia')[,c("tipo", "date", "rate", "count", "population", "name")]
states_sm$rvsv <- subset(vic, tipo == 'Robo de vehículo sin violencia')[,c("tipo", "date", "rate", "count", "population", "name")]
exportJson <- toJSON(states_sm, na = "null")
write(exportJson, "json/states_sm.json")
