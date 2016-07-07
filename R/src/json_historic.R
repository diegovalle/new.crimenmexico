
national_hom <- vic %>% 
  filter(tipo == "Homicidio Doloso") %>%
  group_by(date, modalidad, tipo, subtipo) %>% 
  summarise(count = sum(count, na.rm = TRUE), pop = sum(population)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  ) 

pop_states <-  read.csv('../downloader/data/pop_states.csv') %>%
  group_by(date) %>%
  summarise(pop = sum(population)) %>%
  mutate(date = str_sub(date, 1, 7))

inegi90 <- read.csv('data/INEGI_Exporta.csv', skip = 3, 
                    fileEncoding = 'cp1252', stringsAsFactors = FALSE) %>%
  filter(X != 'Total') %>%
  filter(X != 'FUENTE: INEGI. Estadísticas de mortalidad.') %>%
  dplyr::select(-X.1) %>%
  mutate(X = 1:12) %>%
  gather(year, count, 2:27) %>%
  mutate(date = str_c(str_replace(year, 'X', ''), '-', str_pad(X, 2, 'left', '0')))  %>%
  mutate(count = as.integer(str_replace(count, ',', ''))) %>%
  dplyr::select(-year, -X) %>%
  left_join(pop_states, by = "date") %>%
  ungroup() %>%
  mutate(date = str_c(date, '-01')) %>%
  mutate(pop = ifelse(is.na(pop), 87064847, pop)) %>%
  mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  ) %>%
  na.omit() %>%
  filter(date <= last_inegi_date)


ll.national90 <- list(filter(national_hom[,c("tipo", "date", "rate", "count", "pop")], 
                             tipo == 'Homicidio Doloso'),
                      inegi90)
write(toJSON(ll.national90, na = "null"), "json/national_1990.json")



