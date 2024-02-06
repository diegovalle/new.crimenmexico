url <- "https://conapo.segob.gob.mx/work/models/CONAPO/Datos_Abiertos/pry23/00_Pob_Mitad_1950_2070.csv"

df <- read.csv("~/Downloads/00_Pob_Mitad_1950_2070.csv") |>
  group_by(AÑO, CVE_GEO) |>
  summarise(n = sum(POBLACION), .groups = "drop") |>
  rename(state_code = CVE_GEO, date = AÑO, population = n) |>
  filter(state_code != 0 & date >= 1990 & date <= 2050) |>
  arrange(state_code, date)

df$date <- as.Date(paste0(df$date, "-07-01"))
df_full_dates <- expand.grid(date = seq(from = as.Date("1990-01-01"),
                                       to = as.Date(max("2050-12-01")),
                                       by = "month"),
                             state_code = 1:32
)
df2 <- full_join(df, df_full_dates, by = join_by(date, state_code)) |>
  arrange(state_code, date)

df2 <- df2  |>
  arrange(state_code, date) |>
  group_by(state_code) |>
  mutate(population = as.integer(na.spline(population))) |>
  ungroup() |>
  dplyr::select(state_code, date, population)
write.csv(df2, "../clean/data/pop_states.csv", row.names = FALSE)







df <- read.csv("~/Downloads/00_Pob_Mitad_1950_2070.csv") |>
  # df = df.replace({'RANGO DE EDAD': {u'ADULTOS (18 Y M\xc1S)': 1, u'MENORES DE EDAD (0-17)': 0}})
  mutate(age_group =  case_when(
    EDAD  %in% 0:17 ~ 0,
    EDAD  %in% 18:999 ~ 1
  )) |>
  group_by(AÑO, CVE_GEO, age_group, SEXO) |>
  summarise(n = sum(POBLACION), .groups = "drop") |>
  rename(state_code = CVE_GEO, date = AÑO, population = n,
         age_group = age_group, sex = SEXO) |>
  filter(state_code != 0 & date >= 1990 & date <= 2050) |>
  arrange(state_code, date)

# unique(df$age_group)

df$date <- as.Date(paste0(df$date, "-07-01"))
# df = df.replace({'SEXO': {u'HOMBRE': 1, u'MUJER': 0}})
df$sex <- recode(df$sex, "Mujeres" = 0L, "Hombres" = 1L)

df_full_dates <- expand.grid(date = seq(from = as.Date("1990-01-01"),
                                        to = as.Date("2050-12-01"),
                                        by = "month"),
                             state_code = 1:32,
                             age_group = 0:1,
                             sex = 0:1
)
df2 <- full_join(df, df_full_dates, by = join_by(date, state_code, 
                                                 age_group, sex)) |>
  arrange(state_code, date)

df2 <- df2  |>
  arrange(state_code, age_group, sex, date) |>
  group_by(state_code, age_group, sex) |>
  mutate(population = as.integer(na.spline(population))) |>
  ungroup() |>
  dplyr::select(state_code, age_group, sex, date, population)
write.csv(df2, "../clean/data/pop_states_age_sex.csv", row.names = FALSE)
