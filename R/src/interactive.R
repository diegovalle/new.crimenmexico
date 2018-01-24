last_six_dates = str_sub(sort(unique(muns$date)), 0, 7)
last_six_dates = last_six_dates[length((last_six_dates)): (length(last_six_dates) -5)]
last_six_dates_txt = paste(rep("'", 5),last_six_dates, rep("'", 5), collapse = ",", sep="")

centroids <- read.csv("data/mun_centroids.csv")


db2 <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns2 <- dbGetQuery(db2, str_c("SELECT state_code, state, mun_code, municipio, 
                    tipo_text as tipo, subtipo_text as subtipo, modalidad_text as modalidad,
                    date, count, population
                    FROM municipios_fuero_comun 
                    NATURAL JOIN modalidad_municipios 
                    NATURAL JOIN tipo_municipios  
                    NATURAL JOIN subtipo_municipios 
                    NATURAL JOIN state_names 
                    NATURAL JOIN municipio_names  
                    NATURAL JOIN population_municipios
                    WHERE
                    (date in (", last_six_dates_txt, ")) AND (
                    (
                    subtipo_text = 'HOMICIDIO DOLOSO' or 
                    subtipo_text = 'FEMINICIDIO'))"))
#select distinct date from municipios_fuero_comun order by date desc limit 6
dbDisconnect(db2)
unique(muns2$date)



# mun_map <- readOGR("maps", "MUNICIPIOS")
# bb <- bbox(as(extent(mun_map) , "SpatialPolygons"))
# mun_map@data$CVEGEO <- str_c(mun_map@data$CVE_ENT, mun_map@data$CVE_MUN)
# mun_map <- fortify(mun_map, region="CVEGEO")
# mun_map$code <- as.numeric(as.character(mun_map$id))

#Get rid of states that haven't updated their numbers recently
for(i in last_six_dates) {
  for(j in 1:32) {
    if(all(is.na(subset(muns2, state_code == j & date == i)$count))) {
      #browser()
      muns2 <- subset(muns2, state_code != j | date != i)
      print(str_c(i,"-", j))
    }
  }
}


muns2 <- muns2 %>%
  mutate(tipo = subtipo) %>%
  mutate(tipo = str_replace(tipo, "HOMICIDIO DOLOSO", "Intentional Homicide")) %>%
  mutate(tipo = str_replace(tipo, "FEMINICIDIO", "Intentional Homicide")) %>%
  group_by(tipo, state, state_code, municipio, mun_code) %>%
  summarise(count = sum(count, na.rm = TRUE), population = population[1], len = length(unique(date))) %>%
  mutate(rate = ((count ) * (12/len)) / population * 10^5) %>%
  mutate(code = str_c(str_pad(state_code, 2, pad = '0'), str_pad(mun_code, 3, pad = '0'))) %>%
  mutate(name = str_c(municipio, ", ", state))
muns2$code <- as.numeric(muns2$code)

#mun_map <- right_join(filter(muns, tipo == "Intentional Homicide"), mun_map)
muns2 <- left_join(muns2, centroids, by = c("state_code", "mun_code"))
muns2$rate2 <- ifelse(muns2$rate <= 120, muns2$rate, 120)
write.csv(filter(muns2, tipo == "Intentional Homicide")
          [,c("rate", "rate2", "name", "count", "population", "code", "long", "lat", "len")], 
          "interactive-map/municipios-centroids.csv",
          row.names = FALSE)


#tmpdir <- tempdir()
# have to use RJSONIO or else the topojson isn't valid
#write(RJSONIO::toJSON(mxmunicipio.topoJSON), file.path(tmpdir, "mun.topojson"))
#mun.map <- topojson_read(file.path(tmpdir, "mun.topojson"))

mun.map <- readOGR("maps/municipios.shp", "municipios")
# remove bad polygons
#mun.map <- gBuffer(mun.map, byid=TRUE, width=0)

muns2$region <- str_mxmunicipio(muns2$state_code, muns2$mun_code)

mun.map@data <- data.frame(mun.map@data, muns2[match(mun.map@data$id, muns2$region),])

#mun.map$valid <- 1
#mun.map$valid[is.na(mun.map$rate)] <- 0
#writeOGR(mun.map, ".", "mun.map", driver="ESRI Shapefile", overwrite_layer=TRUE)

nulls <- mun.map[is.na(mun.map$rate),]$id

mun.map <- mun.map[!is.na(mun.map$rate),]
#mun.map$rate[is.na(mun.map$rate)] <- 0
coords<-coordinates(mun.map)
IDs <- row.names(as(mun.map, "data.frame"))
mxnnb <- knn2nb(knearneigh(coords, k=20), row.names=IDs)
all.linked <- max(unlist(nbdists(mxnnb, coords)))
mxnnb <- dnearneigh(coords, 0, all.linked/2.7, row.names=IDs)

list_w  <- nb2listw(mxnnb, style="W")


lisa <- localmoran(mun.map$rate2, list_w, zero.policy = T)

# centers the variable of interest around its mean
cDV <- mun.map$rate - mean(mun.map$rate)

# centers the local Moran's around the mean
mI <- lisa[, 1]
C_mI <- mI - mean(mI) # but we don't want to center it! Only the sign
# matters.

quadrant <- vector(mode="numeric",length=nrow(lisa))
quadrant[cDV>0 & mI>0] <- 1
quadrant[cDV <0 & mI>0] <- 2
quadrant[cDV>0 & mI<0] <- 3
quadrant[cDV <0 & mI<0] <- 4

# set a statistical significance level for the local Moran's
signif <- 0.05

# places non-significant Moran's in the category "5"
quadrant[lisa[, 5]> signif] <- 5
colors <- c("#ca0020", "#0571b0", "#f4a582", "#92c5de", rgb(.95, .95, .95))

write(RJSONIO::toJSON(list(nulls, data.frame(mun.map$id, 
                                             quadrant, 
                                             color=colors[quadrant],
                                             mun.map$state,
                                             mun.map$municipio))), 
      "json/lisa.json")


plot(mun.map, border="grey", col=colors[quadrant],
     main = "LISA Cluster Map, 1960 Homicides")
legend("bottomright",legend=c("high-high","low-low","high-low","low-high"),
       fill=colors,bty="n",cex=0.7,y.intersp=1,x.intersp=1)

