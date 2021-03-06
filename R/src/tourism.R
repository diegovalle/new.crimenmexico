tourist <- muns2 %>%
  filter(code %in% c(2001, 2002, 2003, 2004, 2005,26048,
                     26030,
                     26029,08037,08050,08019,08032,
                     05035,
                     05030,05025,19049,19039,
                     03009,03003,03008,
                     25001,25010,25006,25012,
                     18020,24028,
                     14067,14094,01001,14039,
                     11020,11015,11017,11027,11003,11007,22014,
                     22016,22017,
                     16053,
                     06007,06002,
                     13051,
                     15106,15110,15052,15040,
                     17007,
                     09015,
                     12055,
                     12038,12001,
                     29033,
                     21114,
                     30087,
                     30193,30178,30039,
                     20184,
                     20067,20318,20413,
                     07097,07089,07065,07101,07078,
                     27004,
                     04002,
                     31050,31102,
                     23003,23005,23008,23009,23001,23004,
                     28009))
tourist<- tourist %>%
    left_join(abbrev, by = "state_code") %>%
    mutate(name = str_c(municipio, ", ", state_abbrv)) %>%
    arrange(-rate)
write(toJSON(tourist[,c("count", "rate", "long", "lat", "population", "name")]), 
      "json/tourists.json")
  