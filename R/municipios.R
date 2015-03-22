
db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
dbListTables(db) 
#vic <- dbReadTable(db, "victimas") 
muns <- dbGetQuery(db, "SELECT state_code, state, mun_code, municipio, 
                   tipo_text as tipo, 
                   date, sum(count) as count, population,
                   (sum(count) * 12) / population * 100000 as rate
                   FROM municipios_fuero_comun 
                   NATURAL JOIN modalidad_municipios 
                   NATURAL JOIN tipo_municipios  
                   NATURAL JOIN subtipo_municipios 
                   NATURAL JOIN state_names 
                   NATURAL JOIN municipio_names  
                   NATURAL JOIN population_municipios
                   -- Torreon
                   WHERE ((state_code = 5 and mun_code = 35) or
                   -- La Laguna
                   (state_code = 10 and mun_code = 7) or
                   -- Neza
                   (state_code = 15 and mun_code = 58) or
                   -- Ecatepec
                   (state_code = 15 and mun_code = 33) or
                   -- Chalco
                   (state_code = 15 and mun_code = 25) or
                   -- Naucalpan
                   (state_code = 15 and mun_code = 57) or
                   -- Iztapalapa
                   (state_code = 9 and mun_code = 7) or
                   -- Venustiano Carranza
                   (state_code = 9 and mun_code = 17) or
                   -- Gustavo A. Madero
                   (state_code = 9 and mun_code = 5) or
                   -- Mazatlan
                   (state_code = 25 and mun_code = 12) or
                   -- Culiacan
                   (state_code = 25 and mun_code = 6) or
                   -- Ahome
                   (state_code = 25 and mun_code = 1) or
                   -- Chihuahua
                   (state_code = 8 and mun_code = 19) or
                   -- Juarez
                   (state_code = 8 and mun_code = 37) or
                   -- Monterrey
                   (state_code = 19 and mun_code = 39) or
                   -- Saltillo
                   (state_code = 5 and mun_code = 30) or
                   -- Piedras Negras
                   (state_code = 5 and mun_code = 25) or
                   -- Guadalajara
                   (state_code = 14 and mun_code = 39) or
                   -- Zapopan
                   (state_code = 14 and mun_code = 120) or
                   -- Tijuana
                   (state_code = 2 and mun_code = 4) or
                   -- Acapulco
                   (state_code = 12 and mun_code = 1) or
                   -- Chilpancingo
                   (state_code = 12 and mun_code = 29) or
                   -- Cocula
                   (state_code = 12 and mun_code = 17) or
                   -- IGUALA DE LA INDEPENDENCIA
                   (state_code = 12 and mun_code = 35) or
                   -- Veracruz
                   (state_code = 30 and mun_code = 193) or
                   -- Boca del Rio
                   (state_code = 30 and mun_code = 28) or
                   
                   -- Tampico
                   (state_code = 28 and mun_code = 38) or
                   -- Matamoros
                   (state_code = 28 and mun_code = 22) or
                   -- Nuevo Laredo
                   (state_code = 28 and mun_code = 27) or
                   -- Nuevo Laredo
                   (state_code = 30 and mun_code = 28) or
                   -- Reynosa
                   (state_code = 28 and mun_code = 32) or
                   -- Cuernavaca
                   (state_code = 17 and mun_code = 7) or
                   -- Zacatecas
                   (state_code = 32 and mun_code = 56) or
                   -- Fresnillo
                   (state_code = 32 and mun_code = 10) or
                   -- Tepic
                   (state_code = 18 and mun_code = 17) or
                   -- Morelia
                   (state_code = 16 and mun_code = 53) or
                   -- Apatzingan
                   (state_code = 16 and mun_code = 6) or
                   -- Lazaro Cardenas
                   (state_code = 16 and mun_code = 52) or
                   -- Uruapan
                   (state_code = 16 and mun_code = 102)) and
                   tipo_text = 'DOLOSOS'
                   GROUP BY state_code, state, mun_code, municipio, 
                   date
                   ;")
dbDisconnect(db)

muns <- dbGetQuery(db, "SELECT state_code, state, mun_code, municipio, 
                   tipo_text as tipo, 
                   date, sum(count) as count, population,
                   (sum(count) * 12) / population * 100000 as rate
                   FROM municipios_fuero_comun 
                   NATURAL JOIN modalidad_municipios 
                   NATURAL JOIN tipo_municipios  
                   NATURAL JOIN subtipo_municipios 
                   NATURAL JOIN state_names 
                   NATURAL JOIN municipio_names  
                   NATURAL JOIN population_municipios
                   ")
muns <- inner_join(muns, abbrev)
muns$name <- str_c(muns$municipio, ", ", muns$state_abbrv)
muns$date <- as.Date(as.yearmon(muns$date))
muns$name <- reorder(muns$name, -muns$rate, function(x) {
  i = length(x)
  print(i)
  while(is.na(x[i]) & i > 0) {
    i = i -1
    print(i)
  }
  return(x[i])
  })
ggplot(muns, aes(date, rate, group = name)) +
  geom_line(color = "#555555") +
  geom_smooth(se = FALSE) +
  facet_wrap(~name) +
  sm_theme()
