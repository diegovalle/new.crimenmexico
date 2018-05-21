



tryCatch({
  mun.map <- readOGR("maps/municipios.shp", "municipios", stringsAsFactors = FALSE)
  mun.map$id_numeric <- as.numeric(mun.map$id)
  
  #mun.map$id_numeric <- as.character(as.numeric(str_mxmunicipio(mun.map$CVE_ENT, mun.map$CVE_MUN)))
  
  muns2$id_numeric <- as.numeric(str_mxmunicipio(muns2$state_code, muns2$mun_code))
  null_municipios <- mun.map$id[!mun.map$id_numeric %in% unique(muns2$id_numeric)]
  mun.map <- mun.map[mun.map$id_numeric %in% unique(muns2$id_numeric),]
  
  # TEMP HACK
  # remove the state of Oaxaca because they haven't been reporting for the
  # last six months
  mun.map <- mun.map[!str_detect(mun.map$id, "^20"),]
  
  
  df <- droplevels(as(mun.map, 'data.frame'))
  df$id_numeric <- as.character(df$id_numeric)
  nb <- poly2nb(mun.map, row.names = df$id_numeric)
  names(nb) <- attr(nb, "region.id")
  
  df <- data.frame(df, muns2[match(df$id_numeric, muns2$id_numeric),])
  df$id_numeric <- factor(df$id_numeric)
  df$state <- factor(df$state)
  
  #ctrl <- gam.control(nthreads = 2)
  m1 <- bam(count ~ s(id_numeric, bs = 'mrf', k = 250, xt = list(nb = nb)) + 
              offset(log(population)) + state,
            data = df,
            method = 'REML', 
            #control = ctrl,
            family = tw
  ) 
  summary(m1)
  df$pred = predict(m1, type = 'response')
  df$pred_rate = (df$pred * (12/df$len)) / df$population * 10^5
  
  df$pred_rate2 <- df$pred_rate
  df$pred_rate2[df$pred_rate > 120] <- 120
  
  
  shpf <- fortify(mun.map, region = 'id_numeric')
  
  
  df$id_numeric <- as.character(df$id_numeric)
  mdata <- left_join(shpf, df[,c("id_numeric", "pred", "name", "count", 
                                 "pred_rate", "pred_rate2", "population")], 
                     by = c('id' = 'id_numeric'))
  
  cities <- filter(df, name %in% c("TIJUANA, BAJA CALIFORNIA",
                                   "ACAPULCO DE JUÁREZ, GUERRERO",
                                   "LOS CABOS, BAJA CALIFORNIA SUR",
                                   "MANZANILLO, COLIMA",
                                   "VICTORIA, TAMAULIPAS",
                                   "ZACATECAS, ZACATECAS",
                                   "APATZINGÁN, MICHOACÁN",
                                   "TEPIC, NAYARIT",
                                   "CULIACÁN, SINALOA",
                                   "GUADALUPE Y CALVO, CHIHUAHUA",
                                   "MIGUEL ALEMÁN, TAMAULIPAS",
                                   "COATZACOALCOS, VERACRUZ",
                                   "BENITO JUÁREZ, QUINTANA ROO",
                                   "GUAYMAS, SONORA",
                                   "ZIHUATANEJO DE AZUETA, GUERRERO",
                                   "SALVATIERRA, GUANAJUATO"))
  cities$group <- 1
  cities$municipio <- str_replace(cities$municipio, "BENITO JUÁREZ", "CANCÚN")
  cities$municipio <- str_replace(cities$municipio, "ZIHUATANEJO DE AZUETA", "ZIHUATANEJO")
  #cities$municipio <- str_replace(cities$municipio, "CAJEME", "CIUDAD OBREGÓN")
  cities$municipio <- str_replace(cities$municipio, "ACAPULCO DE JUÁREZ", "ACAPULCO")
  #cities$municipio <- str_replace(cities$municipio, "POZA RICA DE HIDALGO", "POZA RICA")
  
  ggplot(mdata, aes(x = long, y = lat, group = group)) +
    geom_polygon(aes(fill = pred_rate2)) + #, alpha = log(population)
    geom_path(col = 'black', alpha = 0.5, size = 0.02) +
    coord_map("albers", lat0 = 14.5321, lat1 = 32.71865) +
    scale_alpha("log population") +
    scale_fill_gradient2("smoothed rate", 
                         low = viridis(120, option = "viridis")[1], 
                         mid = viridis(120, option = "viridis")[60],
                         high = viridis(120, option = "viridis")[120], 
                         midpoint = 20) + 
    geom_label_repel(data = cities, aes(long, lat, label = municipio), size = 3,
                     force = .1, alpha = .8,
                     box.padding = 3.3, label.padding = 0.18) +
    theme(axis.line=element_blank(),
          axis.text.x=element_blank(),
          axis.text.y=element_blank(),
          axis.ticks=element_blank(),
          axis.title.x=element_blank(),
          axis.title.y=element_blank(),
          legend.justification = c(0,0), # bottom of box
          legend.position      = c(0,0), # bottom of picture
          panel.background=element_blank(),
          panel.border=element_blank(),
          panel.grid.major=element_blank(),
          panel.grid.minor=element_blank(),
          #panel.spacing=unit(0, "lines"),
          plot.background=element_blank()
    ) +
    ggtitle(str_c("Modeled Homicide Rates in Mexico ", 
                  format(as.yearmon(last_six_dates[length(last_six_dates)]), "%b %Y"), " - ", 
                  format(as.yearmon(last_six_dates[1]), "%b %Y")),
            subtitle = str_c("Because some municipios have a low population and homicides tend to be rare occurrences\n",
                             "the variance in homicide rates per 100,000 tends to be high. To remove some of the variance,\n",
                             "and help discover patterns in the data, the homicide rate in each municipio was calculated\n",
                             "based on a GAM with a Gaussian Markov random field smoother and a tweedie response,\n",
                             "with each state included as a treatment variable. Homicides include feminicides. Most\n",
                             "municipios in Oaxaca did not submit data for one or more of the last six months."))
  ggsave("../crimenmexico.diegovalle.net/images/smooth-latest.png", dpi = 100, width = 16, height = 11)
  
  
  
  f <- colour_ramp(c(viridis(120, option = "viridis")[1], 
                     viridis(120, option = "viridis")[60], 
                     viridis(120, option = "viridis")[120]))
  mid_rescaler <- function(mid) {
    function(x, to = c(0, 1), from = range(x, na.rm = TRUE)) {
      rescale_mid(x, to, from, mid)
    }
  }
  mid_rescaler30 <- mid_rescaler(40)
  write(RJSONIO::toJSON(list(null_municipios, data.frame(mun.map.id = df$id, 
                                                         smooth.rate = round(df$pred_rate, 1), 
                                                         color = f(mid_rescaler30(df$pred_rate2)),
                                                         mun.map.state = df$state,
                                                         mun.map.municipio = df$municipio,
                                                         population = df$population))), 
        "json/lisa.json")
  
}, error = function(err) {
  print(paste("GAM ERROR:  ",err))
})
# fit <- Mclust(as.matrix(df[ ,c("long", "lat", "pred_rate")]), 2)
# plot(fit)

# 
# 
# mun.map <- readOGR("maps/municipios.shp", "municipios")
# inegi_codes <- as.character(mun.map$id)
# mun.map$id_numeric <- as.numeric(as.character(mun.map$id))
# mun.map$id <- NULL
# df <- droplevels(as(mun.map, 'data.frame'))
# df <- data.frame(df, muns2[match(df$id_numeric, muns2$id),])
# 
# cuad.nb <- knn2nb(knearneigh(coordinates(mun.map), k = 6))
# #cuad.nb <- poly2nb(cuadrantes, row.names = as.character(cuadrantes$cuadrante))
# #plot(cuad.nb, coordinates(mun.map))
# 
# df$smooth <- sapply(1:nrow(df), function(x) {
#   w <-  c(df$population[x], df$population[cuad.nb[[x]]])
#   r <- c(df$rate[x], df$rate[cuad.nb[[x]]])
#   return(sum(w * r, na.rm = TRUE) / sum(w, na.rm = TRUE))
# })
# 
# shpf <- fortify(mun.map, id_numeric = 'id_numeric')
# df$id <- as.character(df$id)
# mdata <- left_join(shpf, df[,c("id", "name", "count", "smooth")], by = c('id' = 'id'))
# 
# ggplot(mdata, aes(x = long, y = lat, group = group)) +
#   geom_polygon(aes(fill = smooth)) +
#   geom_path(col = 'black', alpha = 0.5, size = 0.1) +
#   coord_map() +
#   scale_fill_gradient2(low = viridis(20, option = "plasma")[1], 
#                        mid = viridis(20, option = "plasma")[10],
#                        high = viridis(20, option = "plasma")[20], 
#                        midpoint = 30)
# 
# nulls <- df[is.na(df$rate),]$id
# f <- colour_ramp(c(viridis(20, option = "plasma")[1], 
#               viridis(20, option = "plasma")[10], 
#               viridis(20, option = "plasma")[20]))
# mid_rescaler <- function(mid) {
#   function(x, to = c(0, 1), from = range(x, na.rm = TRUE)) {
#     rescale_mid(x, to, from, mid)
#   }
# }
# mid_rescaler30 <- mid_rescaler(40)
# write(RJSONIO::toJSON(list(nulls, data.frame(mun.map.id = inegi_codes, 
#                                              NA, 
#                                              color = f(mid_rescaler30(df$smooth)),
#                                              mun.map.state = df$state,
#                                              mun.map.municipio = df$municipio))), 
#       "json/lisa.json")
