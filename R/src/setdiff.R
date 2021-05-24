library(mxmaps)
library(tidyverse)
df=read.csv("../clean/data/municipio_names.csv", fileEncoding = "windows-1252") %>%
  filter(mun_code < 900)
df_d <- read.csv("../clean/snsp-data/Municipal-Delitos-2015-2021_abr2021/Municipal-Delitos-2015-2021_abr2021.csv", fileEncoding = "windows-1252")

df_d <- df_d[, c("Municipio", "Cve..Municipio")]
df_d <- df_d %>% 
  unique() %>%
  arrange(Cve..Municipio)

df$id <- as.numeric(str_mxmunicipio(df$state_code, df$mun_code))

setdiff(df_d$Cve..Municipio, df$id)
