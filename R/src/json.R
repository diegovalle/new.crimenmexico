national <- vic %>% 
  group_by(date, modalidad, tipo, subtipo) %>% 
  summarise(count = sum(count), pop = sum(population)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  )  %>%
  mutate(rate = round(rate, 1))
national$tipo <- reorder(national$tipo, -national$rate, mean, na.rm = TRUE)

injury.intent$year_occur <- ifelse(is.na(injury.intent$year_occur ), injury.intent$year_reg, 
                                   injury.intent$year_occur )
injury.intent$month_occur <- ifelse(is.na(injury.intent$month_occur ), injury.intent$month_reg, 
                                    injury.intent$month_occur )
hd.inegi <- injury.intent %>%
  filter(year_occur >= 2015 & intent.imputed == "Homicide") %>%
  group_by(year_occur, month_occur) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_occur, "-", month_occur, "-01"))) %>%
  right_join(filter(national[,c("tipo", "date", "pop")],
                   tipo == 'Homicidio Doloso'), by = "date") %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5)  %>%
  mutate(rate = round(rate, 1))%>%
  ungroup() %>%
  dplyr::select(-year_occur, -month_occur)

ll.national <- list()
ll.national$hd <- list(filter(national[,c("tipo", "date", "rate", "count", "pop")], 
                         tipo == 'Homicidio Doloso'),
                      hd.inegi)
ll.national$ext <- filter(national, tipo == 'Extorsión')[,c("date", "rate", "count", "pop")]
ll.national$sec <- filter(national, tipo == 'Secuestro')[,c("date", "rate", "count", "pop")]
ll.national$rvcv <- filter(national, tipo == 'Robo de vehículo con violencia')[,c("date", "rate", "count", "pop")]
ll.national$rvsv <- filter(national, tipo == 'Robo de vehículo sin violencia')[,c("date", "rate", "count", "pop")]
write(toJSON(ll.national, na = "null"), "json/national.json")

national_diff <- vic %>% 
  filter(tipo == "Homicidio Doloso") %>% 
  group_by(date, modalidad, tipo, subtipo) %>% 
  summarise(count = sum(count, na.rm = TRUE), pop = sum(population)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  )  %>%
  mutate(rate = round(rate, 1))
# add missing oaxaca oct 2016 number
national_diff$count[which(national_diff$date == "2016-10-01")] <- 
  national_diff$count[which(national_diff$date == "2016-10-01")]  + 76
# add missing oaxaca 2015 homicides
national_diff$count[grep("2015", national_diff$date)] <- 
  national_diff$count[grep("2015", national_diff$date)] +  
  c(56,67,57,49,86,73,93,69,74,63,89,73)
national_diff <- national_diff[, c("date", "rate", "count", "pop")]
national_diff$diff <- c(rep(NA, 12), diff(national_diff$rate, 12))
national_diff$diff_count <- c(rep(NA, 12), diff(national_diff$count, 12))
national_diff <- na.omit(national_diff)
mdiff <- gam(diff ~ s(as.numeric(date)), data = na.omit(national_diff))
national_diff$gam <- round(as.vector(predict(mdiff)), 1)
write(toJSON(national_diff), "json/national_diff.json")

states_last <- list()
states_last$hd <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Homicidio Doloso')
states_last$ext <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Extorsión')
states_last$sec <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Secuestro')
states_last$rvcv<- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Robo de vehículo con violencia')
states_last$rvsv <- subset(vic, date == max(vic$date, na.rm = TRUE) & tipo == 'Robo de vehículo sin violencia')
write(toJSON(states_last), "json/states_hexgrid.json")


states.inegi <- injury.intent %>%
  filter(year_occur >= 2015 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32)) %>%
  group_by(year_occur, month_occur, state_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_occur, "-", month_occur, "-01"))) %>%
  right_join(subset(vic,
                   tipo == 'Homicidio Doloso')
            [,c("tipo", "date", "population", "state_code")],
            by = c("date" = "date", "state_occur_death" = "state_code")) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  mutate(rate = round(rate, 1)) %>%
  ungroup() %>%
  rename(state_code = state_occur_death) %>%
  dplyr::select(-year_occur, -month_occur)


states <- list()
states$hd <- list(
  subset(vic, tipo == 'Homicidio Doloso')[,c("date", "rate", "count", "population", "state_code")] %>% rename_all(substr, 1, 1),
  states.inegi[,c("date", "rate", "count", "population", "state_code")] %>% rename_all(substr, 1, 1)
)
states$ext <- subset(vic, tipo == 'Extorsión')[,c("date", "rate", "count", "population", "state_code")]  %>% rename_all(substr, 1, 1)
states$sec <- subset(vic, tipo == 'Secuestro')[,c("date", "rate", "count", "population", "state_code")] %>% rename_all(substr, 1, 1)
states$rvcv <- subset(vic, tipo == 'Robo de vehículo con violencia')[,c("date", "rate", "count", "population", "state_code")] %>% rename_all(substr, 1, 1)
states$rvsv <- subset(vic, tipo == 'Robo de vehículo sin violencia')[,c("date", "rate", "count", "population", "state_code")] %>% rename_all(substr, 1, 1)

ll.national <- list()
ll.national$hd <- list(filter(national,
                              tipo == 'Homicidio Doloso')[,c( "date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1),
                       hd.inegi[,c( "date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1))
ll.national$ext <- filter(national, tipo == 'Extorsión')[,c("date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1)
ll.national$sec <- filter(national, tipo == 'Secuestro')[,c("date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1)
ll.national$rvcv <- filter(national, tipo == 'Robo de vehículo con violencia')[,c("date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1)
ll.national$rvsv <- filter(national, tipo == 'Robo de vehículo sin violencia')[,c("date", "rate", "count", "pop")] %>% rename_all(substr, 1, 1)
states$national <- ll.national
exportJson <- toJSON(states, na = "null", dataframe = "columns")
write(exportJson, "json/states2.json")

vic %<>%
  mutate(name = state)

states.inegi.name <- injury.intent %>%
  filter(year_occur >= 2015 & intent.imputed == "Homicide" &
           (state_occur_death >= 1 & state_occur_death <=32)) %>%
  group_by(year_occur, month_occur, state_occur_death) %>%
  summarise(count = n()) %>%
  mutate(date = as.Date(str_c(year_occur, "-", month_occur, "-01"))) %>%
  right_join(subset(vic, 
                    tipo == 'Homicidio Doloso')
             [,c("tipo", "date", "population", "state_code", "name")], 
             by = c("date" = "date", "state_occur_death" = "state_code")) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5) %>%
  mutate(rate = round(rate, 1)) %>%
  ungroup() %>% 
  rename(state_code = state_occur_death) %>%
  dplyr::select(-year_occur, -month_occur)


states_sm <- list()
states_sm$hd <- list(subset(vic, tipo == 'Homicidio Doloso')[,c("date", "rate", "count", "population", "name")],
                     states.inegi.name)
states_sm$ext <- subset(vic, tipo == 'Extorsión')[,c("date", "rate", "count", "population", "name")]
states_sm$sec <- subset(vic, tipo == 'Secuestro')[,c("date", "rate", "count", "population", "name")]
states_sm$rvcv<- subset(vic, tipo == 'Robo de vehículo con violencia')[,c("date", "rate", "count", "population", "name")]
states_sm$rvsv <- subset(vic, tipo == 'Robo de vehículo sin violencia')[,c("date", "rate", "count", "population", "name")]
exportJson <- toJSON(states_sm, na = "null")
write(exportJson, "json/states_sm.json")
