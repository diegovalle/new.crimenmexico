library(mxmaps)
library(tidyverse)

df <- read.csv("../clean/snsp-data/municipios.csv", 
               fileEncoding = "windows-1252")

df20 <- subset(df, Año == 2020)
df21 <- subset(df, Año == 2021)
new_muns <- setdiff(unique(df21$Cve..Municipio), unique(df20$Cve..Municipio))
#names of the new municipios
unique(df[which(df$Cve..Municipio %in% new_muns), ]$Municipio)


df=read.csv("../clean/data/municipio_names.csv", fileEncoding = "windows-1252") %>%
  filter(mun_code < 900)
##
df_d <- read.csv("../clean/snsp-data/Municipal-Delitos-2015-2022_ene2022/Municipal-Delitos-2015-2022_ene2022.csv", fileEncoding = "windows-1252")

df_d <- df_d[, c("Municipio", "Cve..Municipio")]
df_d <- df_d %>% 
  unique() %>%
  arrange(Cve..Municipio)

df$id <- as.numeric(str_mxmunicipio(df$state_code, df$mun_code))

setdiff(df_d$Cve..Municipio, df$id)
