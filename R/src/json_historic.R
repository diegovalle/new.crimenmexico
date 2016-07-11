
national_hom <- vic %>% 
  filter(tipo == "Homicidio Doloso") %>%
  group_by(date, modalidad, tipo, subtipo) %>% 
  summarise(count = sum(count, na.rm = TRUE), population = sum(population)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / population) * 10^5  ) %>%
  mutate(state_code = "national")

pop_states_national <-  read.csv('../downloader/data/pop_states.csv') %>%
  group_by(date) %>%
  summarise(pop = sum(population)) %>%
  mutate(date = str_sub(date, 1, 7)) %>%
  mutate(state_code = "national")

pop_states <-  read.csv('../downloader/data/pop_states.csv') %>%
  rename(pop = population) %>%
  mutate(date = str_sub(date, 1, 7))
pop_states <- rbind(pop_states, pop_states_national)

months <- c(1:12)
names(months) <- unique(c("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", 
                          "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"))
inegi90 <- read.csv('data/INEGI_exporta.csv', skip = 3, 
                    fileEncoding = 'cp1252', stringsAsFactors = FALSE) %>%
  filter(X != "FUENTE: INEGI. Estadísticas de mortalidad.") %>%
  mutate(X.1 = str_replace(X.1, "=CONCATENAR\\(.*,", "")) %>%
  mutate(X.1 = str_replace(X.1, "\\)", "")) %>%
  dplyr::select(-Total, -X.2, -X.3) %>%
  rename(state_code = X.1, year = X) %>%
  mutate(state_code = ifelse(state_code == " ", "national", as.integer(state_code))) %>%
  gather(month, count, 3:14) %>%
  filter(!state_code %in% c(33, 34)) %>%
  mutate(month = str_replace_all(month,  months)) %>%
  mutate(date = str_c(year, '-', str_pad(month, 2, 'left', '0'))) %>%
  mutate(count = str_replace(count, ',', '')) %>%
  mutate(count = as.integer(ifelse(count == "", 0, count)))%>%
  dplyr::select(-year, -month)  %>%
  left_join(pop_states, by = c("date", "state_code")) %>%
  group_by(state_code) %>%
  arrange(date) %>%
  mutate(pop = na.spline(pop)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  ) %>%
  mutate(rate = round(rate, 1)) %>%
  mutate(date = str_c(date, "-01")) %>%
  ungroup()%>%
  filter(date <= last_inegi_date)


states_snsp <- subset(vic, tipo == 'Homicidio Doloso')[,c("tipo", "date", "rate", "count", "population", "state_code")]
states_snsp <- rbind(states_snsp, filter(national_hom[,c("tipo", "date", "rate", "count", "population", "state_code")], 
                          tipo == 'Homicidio Doloso'))
states_snsp$tipo <- NULL
names(states_snsp) <- c("d", "r", "c", "p", "s")
names(inegi90) <- c("s", "c", "d", "p", "r")

states_inegi <- list()
for(i in unique(inegi90$s))
  states_inegi[[i]] <- list(filter(states_snsp, s == i),
                            filter(inegi90, s == i)
                            )

write(toJSON(states_inegi , na = "null"), "json/national_1990.json")
