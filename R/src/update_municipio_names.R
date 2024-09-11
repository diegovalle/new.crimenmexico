library(mxmaps)
library(tidyverse)

df <- read.csv("../clean/snsp-data/municipios.csv", 
               fileEncoding = "windows-1252")

df20 <- subset(df, Año == 2022)
df21 <- subset(df, Año == 2023)
new_muns <- setdiff(unique(df21$Cve..Municipio), unique(df20$Cve..Municipio))
#names of the new municipios
unique(df[which(df$Cve..Municipio %in% new_muns), ]$Municipio)


df_mun_names=read.csv("../clean/data/municipio_names.csv", fileEncoding = "windows-1252") 
df_mun_names$id <- as.numeric(str_mxmunicipio(df_mun_names$state_code, df_mun_names$mun_code))
##
df_lates_crime_data <- read.csv("../clean/snsp-data/municipios.csv", fileEncoding = "windows-1252")

df_lates_crime_data <- df_lates_crime_data[, c("Municipio", "Cve..Municipio")]
df_lates_crime_data <- df_lates_crime_data %>% 
  unique() %>%
  arrange(Cve..Municipio)


# municipios that are in the latest crime data but not in the municipio names
setdiff(df_lates_crime_data$Cve..Municipio, df_mun_names$id)
setdiff(df_mun_names$id, df_lates_crime_data$Cve..Municipio)

df_population <- read.csv("../clean/data/pop_muns.csv")
df_population$id <- as.numeric(str_mxmunicipio(df_population$state_code, df_population$mun_code))

# municipios that are in the latest crime data but not in the  conapo population
setdiff(df_population$id, df_mun_names$id)
