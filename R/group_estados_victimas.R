library(dplyr)

df <- read.csv("clean/snsp-data/estados_victimas2026.csv", fileEncoding = "windows-1252")
unique(df$Rango.de.edad)
df2_recoded <- 
  mutate(df, 
    Rango.de.edad = recode(Rango.de.edad,
                 "0 a 12 años" = "Menores de edad (0-17)",
                 `13 a 17 años` = "Menores de edad (0-17)",
                 `18 a 29 años` = "Adultos (18 y más)",
                 "30 a 60 años" = "Adultos (18 y más)",
                 "Más de 60 años" = "Adultos (18 y más)",
                 "No especificado" = 'No especificado'
    )
  )

df_summarized <- aggregate(. ~ Año + Clave_Ent + Entidad + Bien.jurídico.afectado + 
                             Tipo.de.delito + Subtipo.de.delito + Modalidad + 
                             Sexo + Rango.de.edad, 
                           data = df2_recoded, 
                           FUN = sum, 
                           na.rm = TRUE, 
                           na.action = na.pass)

write.csv(df_summarized, 
          "clean/snsp-data/estados_victimas2026.csv", 
          fileEncoding = "windows-1252",
          row.names = FALSE)
