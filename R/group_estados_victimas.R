library(dplyr)
print("group_estados_victimas.R")

df <- read.csv("clean/snsp-data/estados_victimas2026.csv", fileEncoding = "utf-8")

stopifnot(all.equal(unique(df$Rango.de.edad),
                    c("0 a 12 años", "13 a 17 años", "18 a 29 años", "30 a 60 años", 
                      "Más de 60 años", "No especificado")))
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
print("writing group_estados_victimas.R estados_victimas2026.csv")
write.csv(df_summarized, 
          "clean/snsp-data/estados_victimas2026.csv", 
          fileEncoding = "windows-1252",
          row.names = FALSE)
