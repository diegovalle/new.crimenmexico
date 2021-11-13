states_diff <- vic %>% 
  filter(tipo == "Homicidio Doloso") %>% 
  group_by(date, state, state_code, state_abbrv) %>% 
  summarise(count = sum(count), pop = sum(population), .groups = 'drop')  

states_diff <- states_diff %>%
  group_by(state, state_code, state_abbrv) %>%
  mutate(group = c(rep(NA, length(state_code) - 24), 
                   rep(1:2, each = 12))) %>%
  group_by(state, state_code, state_abbrv, group) %>%
  summarise(diff = (sum(count) / mean(pop)) * 10^5,
            count_diff = sum(count), .groups = 'drop') %>%
  mutate(diff = round(diff, 1)) %>%
  arrange(state, group) %>%
  na.omit()

write( toJSON(states_diff %>%
                group_by(state, state_code, state_abbrv) %>%
                summarise(diff = diff[2] - diff[1],
                          count_diff = count_diff[2] - count_diff[1], 
                          .groups = 'drop') %>%
                rename(value = diff) %>%
                arrange(value)),
       "json/states_diff.json")

write( toJSON(states_diff %>%
               filter(group == 2) %>%
                rename(value = diff) %>%
                dplyr::select(-group) %>%
                arrange(-value)),
       "json/states_yearly_rates.json")

