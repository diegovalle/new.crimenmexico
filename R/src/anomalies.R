
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
  centroids <- right_join(centroids, df, by = c("state_code", "mun_code"))
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
          panel.grid.major.y = element_blank(),
          panel.grid.minor.y = element_blank(),
          panel.grid.major.x = element_blank(),
          panel.grid.minor.x = element_blank(),
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


find_anomalies <- function(muns, crime_type, cutoff) {
  len <- length(seq(from=min(muns$date), to=max(muns$date), by='month')) 
  df <- muns %>%
    dplyr::select(municipio, crime, count, rate, date, id)%>%
    filter(crime == crime_type) %>%
    group_by(id, crime)   %>%
    filter(last(count) >= cutoff) %>%
    do(na.trim(., sides = "both", is.na = "any"))  %>%
    filter(length(na.omit(rate)) > len*.8) %>%
    ungroup()
  if (nrow(df) == 0)
    return(data.frame())
  
  anom <- df %>%
    group_by(id, crime) %>% 
    mutate(rate = na.approx(rate)) %>%
    time_decompose(rate, method = "twitter", trend = "12 months") %>%
    anomalize(remainder, method = "gesd", alpha = 0.08)
  filter(muns, id %in% filter(anom, 
                              anomaly == "Yes" & 
                                date == max(muns$date))$id & 
           crime == crime_type) %>%
    dplyr::select(-id)
}

db <- dbConnect(SQLite(), dbname="../db/crimenmexico.db")
muns <- dbGetQuery(db, "
                   SELECT * 
FROM  (SELECT m.state_code, 
                   m.mun_code, 
                   'HOMICIDIO DOLOSO' AS crime, 
                   m.date, 
                   Sum(count)         AS count 
                   FROM   municipios_fuero_comun m 
                   natural JOIN subtipo_municipios 
                   WHERE  subtipo_text = 'HOMICIDIO DOLOSO' 
                   OR subtipo_text = 'FEMINICIDIO' 
                   GROUP  BY m.state_code, 
                   m.mun_code, 
                   m.date 
                   UNION 
                   SELECT m.state_code, 
                   m.mun_code, 
                   CASE subtipo_text 
                   WHEN 'EXTORSIÓN' THEN 'EXTORSIÓN' 
                   WHEN 'SECUESTRO' THEN 'SECUESTRO' 
                   WHEN 'LESIONES DOLOSAS' THEN 'LESIONES DOLOSAS' 
                   WHEN 'EVASIÓN DE PRESOS' THEN 'EVASIÓN DE PRESOS' 
                   END        crime, 
                   m.date, 
                   Sum(count) AS count 
                   FROM   municipios_fuero_comun m 
                   natural JOIN subtipo_municipios 
                   WHERE  subtipo_text = 'SECUESTRO' 
                   OR subtipo_text = 'EXTORSIÓN' 
                   OR subtipo_text = 'LESIONES DOLOSAS' 
                   OR subtipo_text = 'EVASIÓN DE PRESOS' 
                   GROUP  BY m.state_code, 
                   m.mun_code, 
                   subtipo_text , 
                   m.date 
                   UNION 
                   SELECT state_code, 
                   mun_code, 
                   crime, 
                   date, 
                   Sum(count) AS count 
                   FROM   (SELECT m.state_code, 
                   m.mun_code, 
                   CASE modalidad_text 
                   WHEN 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA' THEN 
                   'ROBO DE VEHÍCULO CON VIOLENCIA' 
                   WHEN 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA' THEN 
                   'ROBO DE VEHÍCULO SIN VIOLENCIA' 
                   END        crime, 
                   m.date, 
                   count 
                   FROM   municipios_fuero_comun m 
                   natural JOIN modalidad_municipios 
                   WHERE  modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA' 
                   OR modalidad_text = 
                   'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA'
                   ) 
                   GROUP  BY state_code, 
                   mun_code, 
                   date,
                   crime) 
                   natural JOIN population_municipios 
                   natural JOIN state_names 
                   natural JOIN municipio_names ")
dbDisconnect(db)

muns <- left_join(muns, abbrev, by = "state_code") %>% filter(date >= '2015-01')
muns$name <- str_c(muns$municipio, ", ", muns$state_abbrv)
muns$date <- as.Date(as.yearmon(muns$date))
muns %<>% mutate(rate = round(((count /  numberOfDays(date) * 30) * 12) / population * 10^5, 1))

muns <- muns %>% mutate(id = str_mxmunicipio(state_code, mun_code))

ll <- list()
ll$hom <- find_anomalies(muns, "HOMICIDIO DOLOSO", 5)
ll$rvcv <- find_anomalies(muns, "ROBO DE VEHÍCULO CON VIOLENCIA", 10)
ll$rvsv <- find_anomalies(muns, "ROBO DE VEHÍCULO CON VIOLENCIA", 10)
ll$lesions <- find_anomalies(muns, "LESIONES DOLOSAS", 10)
ll$kidnapping <- find_anomalies(muns, "SECUESTRO", 5)
ll$ext <- find_anomalies(muns, "EXTORSIÓN", 5)
ll$reos <-  muns %>%
  filter(crime == "EVASIÓN DE PRESOS") %>%
  group_by(name) %>%
  filter(last(count >= 5))

muns$id <- NULL


write(toJSON(ll), "json/anomalies.json")
save(ll, file = 'json/ll.RData')
ll$reos <- NULL
# load('json/ll.RData')

centroids <- read.csv("data/mun_centroids.csv")
cities <- list()
if(nrow(ll$hom) > 0) {
  cities$hom <- right_join(centroids, ll$hom, by = c("state_code", "mun_code")) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$rvcv) > 0) {
  cities$rvcv <- right_join(centroids, ll$rvcv, by = c("state_code", "mun_code")) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$rvsv) > 0) {
  cities$rvsv <- right_join(centroids, ll$rvsv, by = c("state_code", "mun_code")) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$lesions) > 0) {
  cities$lesions <- right_join(centroids, ll$lesions, by = c("state_code", "mun_code")) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
  
}
if(nrow(ll$kidnapping) > 0) {
  cities$kidnapping <- right_join(centroids, ll$kidnapping, by = c("state_code", "mun_code")) %>%
    group_by(name, state_code, mun_code, lat, long) %>%
    do(tail(. ,1))
}
if(nrow(ll$ext) > 0) {
  cities$ext <- right_join(centroids, ll$ext, by = c("state_code", "mun_code")) %>%
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
# write(toJSON(ll2), "json/anomalies2.json")

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



