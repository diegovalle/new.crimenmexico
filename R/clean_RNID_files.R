library(dplyr)

df <- read.csv("clean/snsp-data/estados_victimas2026.csv", fileEncoding = "windows-1252")

unique(df$Rango.de.edad)
df$Subtipo.de.delito[df$Tipo.de.delito == "Secuestro"] <- "Secuestro"
df$Subtipo.de.delito[df$Tipo.de.delito == "Extorsión"] <- "Extorsión"
df$Subtipo.de.delito[df$Tipo.de.delito == "Trata de personas"] <- "Trata de personas"


df$Modalidad[df$Tipo.de.delito == "Extorsión"] <- "Extorsión"
df$Modalidad[df$Tipo.de.delito == "Trata de personas"] <- "Trata de personas"

# Secuestro extorsivo
# Secuestro con calidad de rehén
# Secuestro para causar daño
# Secuestro exprés

# Extorsión presencial
# Extorsión por otros medios
# Chantaje

# Esclavitud
# ● Condición de siervo
# ● Prostitución ajena u otras formas
# de explotación sexual ajena
# ● Explotación laboral
# ● Trabajo o servicios forzados
# ● Mendicidad forzosa
# ● Utilización de personas menores
# de dieciocho años o que no tenga
# la capacidad de comprender el
# significado del hecho o resistir la
# conducta en actividades delictivas

df <- dplyr::filter(df, Subtipo.de.delito %in% c("Homicidio doloso", "Homicidio culposo", "Lesiones dolosas",
                                                 "Lesiones culposas", "Feminicidio", "Otros delitos que atentan contra la vida y la integridad corporal",
                                                 "Secuestro", "Tráfico de menores", "Rapto", "Otros delitos que atentan contra la libertad personal",
                                                 "Extorsión", "Corrupción de menores", "Trata de personas",
                                                 "Otros delitos contra la sociedad", "Aborto"))


# setdiff(dput(unique(df$Modalidad)),
#         dput(unique(df2$Modalidad)))
# setdiff(dput(unique(df$Tipo.de.delito)),
#         dput(unique(df2$Tipo.de.delito)))
# setdiff(dput(unique(df$Subtipo.de.delito)),
#         dput(unique(df2$Subtipo.de.delito)))

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


df26 <- read.csv("clean/snsp-data/estados2026.csv", fileEncoding = "windows-1252")
df26 <- dplyr::filter(df26, Subtipo.de.delito %in% c("Homicidio doloso", "Homicidio culposo", "Lesiones dolosas",
                                                     "Robo de vehículo automotor - Coche de 4 ruedas",
                                                 "Lesiones culposas", "Feminicidio", "Otros delitos que atentan contra la vida y la integridad corporal",
                                                 "Secuestro", "Tráfico de menores", "Rapto", "Otros delitos que atentan contra la libertad personal",
                                                 "Extorsión", "Corrupción de menores", "Trata de personas",
                                                 "Otros delitos contra la sociedad", "Aborto"))

df26 <- 
  mutate(df26, 
         Subtipo.de.delito = recode(Subtipo.de.delito,
                                "Robo de vehículo automotor - Coche de 4 ruedas" = 
                                  "Robo de vehículo automotor",
                                .default = Subtipo.de.delito
         )
  )
df26 <- df26 %>%
  mutate(
    Modalidad = case_when(
      Subtipo.de.delito == "Robo de vehículo automotor" & Modalidad == "Con violencia" ~ "Robo de coche de 4 ruedas Con violencia",
      Subtipo.de.delito == "Robo de vehículo automotor" & Modalidad == "Sin violencia" ~ "Robo de coche de 4 ruedas Sin violencia",
      TRUE ~  Modalidad
    )
  )
write.csv(df26, 
          "clean/snsp-data/estados2026.csv", 
          fileEncoding = "windows-1252",
          row.names = FALSE)



df26 <- read.csv("clean/snsp-data/municipios2026.csv", fileEncoding = "windows-1252")
df26 <- dplyr::filter(df26, Subtipo.de.delito %in% c("Homicidio doloso", "Homicidio culposo", "Lesiones dolosas",
                                                     "Robo de vehículo automotor - Coche de 4 ruedas",
                                                     "Lesiones culposas", "Feminicidio", "Otros delitos que atentan contra la vida y la integridad corporal",
                                                     "Secuestro", "Tráfico de menores", "Rapto", "Otros delitos que atentan contra la libertad personal",
                                                     "Extorsión", "Corrupción de menores", "Trata de personas",
                                                     "Otros delitos contra la sociedad", "Aborto"))
df26 <- 
  mutate(df26, 
         Subtipo.de.delito = recode(Subtipo.de.delito,
                                    "Robo de vehículo automotor - Coche de 4 ruedas" = 
                                      "Robo de vehículo automotor",
                                    .default = Subtipo.de.delito
         )
  )
df26 <- df26 %>%
  mutate(
    Modalidad = case_when(
      Subtipo.de.delito == "Robo de vehículo automotor" & Modalidad == "Con violencia" ~ "Robo de coche de 4 ruedas Con violencia",
      Subtipo.de.delito == "Robo de vehículo automotor" & Modalidad == "Sin violencia" ~ "Robo de coche de 4 ruedas Sin violencia",
      TRUE ~  Modalidad
    )
  )
write.csv(df26, 
          "clean/snsp-data/municipios2026.csv", 
          fileEncoding = "windows-1252",
          row.names = FALSE)

