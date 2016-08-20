
db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns <- dbGetQuery(db, "SELECT state_code, state, mun_code, municipio, 
                   tipo_text as tipo, subtipo_text as subtipo, modalidad_text as modalidad,
                   date, count, population,
                   (count * 12) / population * 100000 as rate
                   FROM municipios_fuero_comun 
                   NATURAL JOIN modalidad_municipios 
                   NATURAL JOIN tipo_municipios  
                   NATURAL JOIN subtipo_municipios 
                   NATURAL JOIN state_names 
                   NATURAL JOIN municipio_names  
                   NATURAL JOIN population_municipios
WHERE modalidad_text  = 'DELITOS PATRIMONIALES' or
modalidad_text  = 'HOMICIDIOS' or
modalidad_text  = 'LESIONES' or
modalidad_text  = 'PRIV. DE LA LIBERTAD (SECUESTRO)' or
(modalidad_text  = 'ROBO COMUN' and subtipo_text = 'DE VEHICULOS')")
dbDisconnect(db)

muns <- left_join(muns, abbrev)
muns$name <- str_c(muns$municipio, ", ", muns$state_abbrv)
muns$date <- as.Date(as.yearmon(muns$date))
muns %<>% mutate(rate = round(((count /  numberOfDays(date) * 30) * 12) / population * 10^5, 1))
# muns$name <- reorder(muns$name, -muns$rate, function(x) {
#   i = length(x)
#   print(i)
#   while(is.na(x[i]) & i > 0) {
#     i = i -1
#     print(i)
#   }
#   return(x[i])
#   })
# ggplot(muns, aes(date, rate, group = name)) +
#   geom_line(color = "#555555") +
#   geom_smooth(se = FALSE) +
#   facet_wrap(~name) +
#   sm_theme()


findAnomalies <- function(category, type, subtype="", munvec, fileName){
  if(!file.exists(str_c("data/hashes/", fileName))) {
    h <- hash(keys = munvec, values = "")
    new <- TRUE
  } else {
    load(str_c("data/hashes/", fileName))
    new <- FALSE
  }
  anomalies <- data.frame()
  #pb <- txtProgressBar(min = 0, max = length(munvec), style = 3)
  pb <- progress_estimated(length(munvec))
  l <- 1
  muns <- data.table(muns)
  for(munname in munvec){
    if (subtype != "") {
      df <- muns[muns$name == munname & 
                   muns$modalidad == category & 
                   muns$tipo == type &
                   muns$subtipo == subtype,]
    } else
      df <- muns[muns$name == munname & 
                   muns$modalidad == category & 
                   muns$tipo == type,]
    df <- df[order(df$date),]
    df <- as.data.frame(df)
    df <- df %>%
      group_by(date, name, state_code, mun_code)  %>%
      summarise(count = sum(count, na.rm = TRUE),
                rate = ((count /  numberOfDays(date[1]) * 30) * 12) / population[1] * 10^5)
    i = nrow(df)
    while(is.na(df$rate[i]) & i > 0) {
      i = i -1
    }
    hom <- df
    for(j in i:1) {
      if(is.na(hom$rate[j])) {
        hom$rate[j] <- median(hom$rate, na.rm = TRUE)
      }
    }
    hom <- na.omit(as.data.frame(hom))
    hom$date  <- as.POSIXlt(str_c(hom$date), tz = "CTZ")
    max_date <- max(hom$date)
    if(new)
      h[munname] <- max_date
    if((hom$count[nrow(hom)] >= 5) ) {
      #if(!(hom$name[1] == "GUADALUPE, ZAC" & category == "HOMICIDIOS")) {
      #print(hom$name[1])
      #hom$rate[is.na(hom$rate)] <- mean(hom$rate, na.rm = TRUE)
      #breakout(hom$rate, min.size = 2, method = 'multi', beta=0.001, plot=TRUE)
      anoms <- tryCatch(AnomalyDetectionTs(hom[ ,c("date", "rate")], 
                                           max_anoms = 0.02,
                                           direction = 'both')$anoms$timestamp,
                        error = function(e) {print(e);NULL})
        
        if(!is.null(anoms))
          if(any(ifelse(anoms >= h[[munname]], TRUE, FALSE))) {
              print(munname)
              anomalies <- rbind(anomalies, as.data.frame(df))
          }
      #}
    }
    # update progress bar
    #print(setTxtProgressBar(pb, l))
    pb$tick()$print()
    l = l + 1
    h[munname] <- max_date
  }
  save(h, file = str_c("data/hashes/", fileName))
  return(anomalies)
}


sm_anom <- function(df, title, xtitle, ytitle) {
  df$name <- reorder(df$name, -df$rate, min)
  title <- switch(title,
         hom = "HOMICIDIOS INTENCIONALES",
         rvcv = "ROBO DE VEHICULO C/V",
         rvsv = "ROBO DE VEHICULO S/V",
         kidnapping = "SECUESTRO",
         lesions = "LESIONES INTENCIONALES",
         ext = "EXTORSIÓN")
  ggplot(df, aes(date, rate)) +
    geom_line() +
    facet_wrap(~name, ncol = 5) +
    sm_theme() +
    ggtitle(title)+
    xlab(xtitle) +
    ylab(ytitle)
}

sm_anom_en <- function(df, title, xtitle, ytitle) {
  df$name <- reorder(df$name, -df$rate, min)
  title <- switch(title,
                  hom = "INTENTIONAL HOMICIDE",
                  rvcv = "CAR ROBBERY WITH VIOLENCE",
                  rvsv = "CAR ROBBERY WITHOUT VIOLENCE",
                  kidnapping = "KIDNAPPING",
                  lesions = "INTENTIONAL LESIONS",
                  ext = "EXTORTION")
  ggplot(df, aes(date, rate)) +
    geom_line() +
    facet_wrap(~name, ncol = 5) +
    sm_theme() +
    ggtitle(title) +
    xlab(xtitle) +
    ylab(ytitle)
}



dotMap <- function(centroids, mx, df, legend_title) {
  centroids <- right_join(centroids, df)
  centroids %<>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
  
  ggplot(centroids, aes(long, lat), 
         color = "black") +
    geom_polygon(data = mx, aes(long, lat, group = group),
                 size = .1, color = "black", fill = "#9f794c") +
    coord_map("albers", lat0 = bb[ 2 , 1 ] , lat1 = bb[ 2 , 2 ] ) +
    geom_point(aes(size = count), 
               shape = 21, color = "white", fill = "#e34a33",
               show.legend = FALSE) +
    scale_size_area(legend_title, max_size = 5,
                    labels=trans_format("identity", function(x) round(x,0))) +
    infographic_theme2() +
    theme_bare() +
    theme(plot.title = element_blank(),
          axis.title = element_blank(),
          legend.position = c(.89, .95), 
          legend.margin = unit(0, "lines"),
          legend.title = element_text(family = "Ubuntu", 
                                      colour = "#0D0D0D", size = 8),
          legend.text = element_text(family = "Ubuntu", colour = "#0D0D0D", size = 6),
          legend.key = element_rect( fill = NA),
          legend.background = element_rect(fill = "#C7B470"),
          legend.key.height = unit(0.4, "cm"), 
          legend.key.width = unit(0.4, "cm"))
}


#bigmuns <- subset(muns, population >= 50000)
muns_to_analyze <-  unique(muns$name)

ll <- list()
# h <- hash(keys=muns_to_analyze, values="")
# load(file = "data/hashes/hhom.RData")

# profvis({
#   findAnomalies_c("HOMICIDIOS", "DOLOSOS", munvec = muns_to_analyze, fileName="hhom2.RData")
# })
findAnomalies_c <- compiler::cmpfun(findAnomalies)


## print("homicides")
## ll$hom <- findAnomalies_c("HOMICIDIOS", "DOLOSOS", munvec = muns_to_analyze, fileName="hhom.RData")
## print("car robbery w/v")
## ll$rvcv = findAnomalies_c("ROBO COMUN", "CON VIOLENCIA", "DE VEHICULOS",muns_to_analyze, fileName="hrvcv.RData")
## print("car robbery wo/v")
## ll$rvsv = findAnomalies_c("ROBO COMUN", "SIN VIOLENCIA", "DE VEHICULOS", muns_to_analyze, fileName="hrvsv.RData")
## print("lesions")
## ll$lesions <- findAnomalies_c("LESIONES", "DOLOSAS", munvec = muns_to_analyze, fileName="hlesions.RData")
## print("kidnappings")
## ll$kidnapping = findAnomalies_c("PRIV. DE LA LIBERTAD (SECUESTRO)", "SECUESTRO", "SECUESTRO", 
##                            muns_to_analyze, fileName="hkid.RData")
## print("extortion")
## ll$ext <- findAnomalies_c("DELITOS PATRIMONIALES", "EXTORSION", "EXTORSION", muns_to_analyze, fileName="hext.RData")

plan(multiprocess)
ll_hom %<-% {
  print('homicides')
  findAnomalies_c("HOMICIDIOS", "DOLOSOS", munvec = muns_to_analyze, fileName="hhom.RData")
}
ll_rvcv %<-% {
  print('car robbery w/v')
  findAnomalies_c("ROBO COMUN", "CON VIOLENCIA", "DE VEHICULOS",muns_to_analyze, fileName="hrvcv.RData")
}
ll_rvsv %<-% {
  print('car robbery w/o v')
  findAnomalies_c("ROBO COMUN", "SIN VIOLENCIA", "DE VEHICULOS", muns_to_analyze, fileName="hrvsv.RData")
}
ll_lesions %<-% {
  print('lesions')
  findAnomalies_c("LESIONES", "DOLOSAS", munvec = muns_to_analyze, fileName="hlesions.RData")
}
ll_kidnapping %<-% {
  print('kidnappings')
  findAnomalies_c("PRIV. DE LA LIBERTAD (SECUESTRO)", "SECUESTRO", "SECUESTRO", 
                 muns_to_analyze, fileName="hkid.RData")
}
ll_ext %<-% {
  print('extortion')
  findAnomalies_c("DELITOS PATRIMONIALES", "EXTORSION", "EXTORSION", muns_to_analyze, fileName="hext.RData")
}
ll$hom <- ll_hom
ll$rvcv <- ll_rvcv
ll$rvsv <- ll_rvsv
ll$lesions <- ll_lesions
ll$kidnapping <- ll_kidnapping
ll$ext <- ll_ext
## 
write(toJSON(ll), "json/anomalies.json")
save(ll, file = 'json/ll.RData')
# load('json/ll.RData')

centroids <- read.csv("data/mun_centroids.csv")
cities <- list()
if(nrow(ll$hom) > 0) {
  cities$hom <- right_join(centroids, ll$hom) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$rvcv) > 0) {
  cities$rvcv <- right_join(centroids, ll$rvcv) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$rvsv) > 0) {
  cities$rvsv <- right_join(centroids, ll$rvsv) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$lesions) > 0) {
  cities$lesions <- right_join(centroids, ll$lesions) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
  
}
if(nrow(ll$kidnapping) > 0) {
  cities$kidnapping <- right_join(centroids, ll$kidnapping) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$ext) > 0) {
  cities$ext <- right_join(centroids, ll$ext) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
write(toJSON(cities), file = 'json/cities.json')

j = 1
ll2 <- list()
for(i in 1:length(ll)){
  if(nrow(ll[[i]]) > 0) {
    ll2[j] <- ll[i]
    names(ll2)[j] <- names(ll)[i]
    j = j + 1
  }
}
write(toJSON(ll2), "json/anomalies2.json")

max_date = muns$date %>% max(., na.rm = TRUE) %>% as.yearmon  %>% as.character 

svg(str_c("graphs/municipios_", tolower(str_replace(max_date, " ", "_")), ".svg"), 
    width = 12, height = 20)
grid.newpage() 
pushViewport(viewport(layout = grid.layout((length(ll2)*2)+1, 5)))
grid.rect(gp = gpar(fill = "#C7B470", col = "#C7B470"))
# Title
grid.text("CRIME BY MUNICIPIO", y = unit(.997, "npc"), x = unit(0.5, "npc"), vjust = 1, hjust = .5, 
          gp = gpar(fontfamily = "Fugaz One", col = "#001D00", cex = 5, alpha = 0.3))
# Black square with the date on it
grid.rect(gp = gpar(fill = "black", col = "black"), 
          x = unit(0.94, "npc"), y = unit(0.988, "npc"), 
          width = unit(.085, "npc"), height = unit(0.04, "npc"))
# Text with the date
grid.text(max_date, vjust = 0, hjust = 0, x = unit(0.907, "npc"), 
          y = unit(0.98, "npc"), gp = gpar(fontfamily = "Open Sans Extrabold", 
                                           col = "white", cex = 1.08))
# Yellow bar for text
grid.rect(gp = gpar(fill = "#E7A922", col = "#E7A922"), 
          x = unit(0.5, "npc"), y = unit(0.951, "npc"), 
          width = unit(1, "npc"), height = unit(0.025, "npc"))
grid.text("All municipios with a crime rate anomaly during the last available date (30 day months).
Author: Diego Valle-Jones                                                    http://crimenmexico.diegovalle.net/en                                                    Source: SNSP and CONAPO", vjust = 0, hjust = 0, x = unit(0.01, "npc"), 
          y = unit(0.94, "npc"), 
          gp = gpar(fontfamily = "Ubuntu", col = "#552683", cex = 1.08))
# all the charts
j=1
for(i in seq(1,length(ll2)*2, by=2)) {
  print(sm_anom_en(ll2[[j]], names(ll2)[j], "date", "annualized rate"), vp = vplayout((i+1):(i+2), 1:3))
  print(dotMap(centroids, mx, ll2[[j]], "count"), vp = vplayout((i+1):(i+2), 4:5))
  j = j + 1
}
dev.off()

# system(str_replace_all("convert graphs/municipios_XXX.svg graphs/municipios_XXX.png; 
#                         optipng graphs/municipios_XXX.png;", "XXX",
#                         tolower(str_replace(max_date, " ", "_"))))


lct <- Sys.getlocale("LC_TIME")
Sys.setlocale("LC_TIME", "es_ES.UTF-8")

max_date = muns$date %>% max(., na.rm = TRUE) %>% as.yearmon  %>% as.character 

svg(str_c("graphs/municipios_es_", tolower(str_replace(max_date, " ", "_")), ".svg"),
    width = 12, height = 20)
grid.newpage() 
pushViewport(viewport(layout = grid.layout((length(ll2)*2)+1, 5)))
grid.rect(gp = gpar(fill = "#C7B470", col = "#C7B470"))
# Title
grid.text("CRIMEN ✕ MUNICIPIO", y = unit(.997, "npc"), x = unit(0.5, "npc"), vjust = 1, hjust = .5, 
          gp = gpar(fontfamily = "Fugaz One", col = "#001D00", cex = 5, alpha = 0.3))
# Black square with the date on it
grid.rect(gp = gpar(fill = "black", col = "black"), 
          x = unit(0.94, "npc"), y = unit(0.988, "npc"), 
          width = unit(.085, "npc"), height = unit(0.04, "npc"))
# Text with the date
grid.text(max_date, vjust = 0, hjust = 0, x = unit(0.907, "npc"), 
          y = unit(0.98, "npc"), gp = gpar(fontfamily = "Open Sans Extrabold", 
                                           col = "white", cex = 1.08))
# Yellow bar for text
grid.rect(gp = gpar(fill = "#E7A922", col = "#E7A922"), 
          x = unit(0.5, "npc"), y = unit(0.951, "npc"), 
          width = unit(1, "npc"), height = unit(0.025, "npc"))
grid.text("Todos los municipios con tasas de criminalidad fuera de lo normal durante la última fecha disponible para delitos seleccionados (meses de 30 días).
Autor: Diego Valle                                                               http://crimenmexico.diegovalle.net/es                                                               Fuente: SNSP y CONAPO", vjust = 0, hjust = 0, x = unit(0.01, "npc"), 
          y = unit(0.94, "npc"), 
          gp = gpar(fontfamily = "Ubuntu", col = "#552683", cex = 1.08))
# all the charts
j=1
for(i in seq(1,length(ll2)*2, by=2)) {
  print(sm_anom(ll2[[j]], names(ll2)[j], "fecha", "tasa anualizada"), vp = vplayout((i+1):(i+2), 1:3))
  print(dotMap(centroids, mx, ll2[[j]], "número"), vp = vplayout((i+1):(i+2), 4:5))
  j = j + 1
}
dev.off()


Sys.setlocale("LC_TIME", lct)

# system(str_replace_all("convert graphs/municipios_es_XXX.svg graphs/municipios_es_XXX.png; 
#                         optipng graphs/municipios_es_XXX.png;", "XXX",
#                         tolower(str_replace(max_date, " ", "_"))))



