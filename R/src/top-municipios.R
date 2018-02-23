
# Compute a and b for Gamma(a,b) based on the mean and
# sd of each municipio at the state level
muns2 <- muns2 %>%
  group_by(state) %>%
  mutate(a =  (mean(rate, na.rm = TRUE)^2 / sd(rate, na.rm = TRUE)^2),
         b = (mean(rate, na.rm = TRUE) / sd(rate, na.rm = TRUE)^2)) 

muns2 <- mutate(muns2, posterior_lower = qgamma((1- .99) / 2,
                                                count + a,
                                                b + population / 100000),
                posterior_mean =  
                  (count+ a) /
                  (b + population / 100000)
)

# Priors that match the mean homicide rate and sd for all of Mexico
# muns2 <- mutate(muns2, posterior_lower = qgamma((1- .99) / 2, 
#                                           count + 2.6,
#                                           .1 + population / 100000),
#                 posterior_mean = mean(rgamma(100000, 
#                                         count + 2.6,
#                                         .1 + population / 100000)))

top50 <- muns2 %>%
  filter(count >= 25 | population >= 10^5) %>%
  left_join(abbrev, by = "state_code") %>%
  mutate(name = str_c(municipio, ", ", state_abbrv)) %>%
  arrange(-posterior_lower) %>%
  head(50) %>%
  arrange(-rate)
write(toJSON(top50[,c("count", "rate", "population", "name")]), "json/top-municipios.json")

# bottom50 <- muns2 %>%
#   filter(population >= 10^5) %>%
#   left_join(abbrev, by = "state_code") %>%
#   mutate(name = str_c(municipio, ", ", state_abbrv)) %>%
#   arrange(posterior_mean) %>%
#   head(50) %>%
#   arrange(rate)

#tmpdir <- tempdir()
# have to use RJSONIO or else the topojson isn't valid
#write(RJSONIO::toJSON(mxmunicipio.topoJSON), file.path(tmpdir, "mun.topojson"))
#mun.map <- topojson_read(file.path(tmpdir, "mun.topojson"))
# 
# mun.map <- readOGR("maps/municipios.shp", "municipios")
# # remove bad polygons
# #mun.map <- gBuffer(mun.map, byid=TRUE, width=0)
# 
# muns2$region <- str_mxmunicipio(muns2$state_code, muns2$mun_code)
# 
# mun.map@data <- data.frame(mun.map@data, muns2[match(mun.map@data$id, muns2$region),])
# 
# #mun.map$valid <- 1
# #mun.map$valid[is.na(mun.map$rate)] <- 0
# #writeOGR(mun.map, ".", "mun.map", driver="ESRI Shapefile", overwrite_layer=TRUE)
# 
# nulls <- mun.map[is.na(mun.map$rate),]$id
# 
# mun.map <- mun.map[!is.na(mun.map$rate),]
# #mun.map$rate[is.na(mun.map$rate)] <- 0
# coords<-coordinates(mun.map)
# IDs <- row.names(as(mun.map, "data.frame"))
# mxnnb <- knn2nb(knearneigh(coords, k=20), row.names=IDs)
# all.linked <- max(unlist(nbdists(mxnnb, coords)))
# mxnnb <- dnearneigh(coords, 0, all.linked/2.7, row.names=IDs)
# 
# list_w  <- nb2listw(mxnnb, style="W")
# 
# 
# lisa <- localmoran(mun.map$rate2, list_w, zero.policy = T)
# 
# # centers the variable of interest around its mean
# cDV <- mun.map$rate - mean(mun.map$rate)
# 
# # centers the local Moran's around the mean
# mI <- lisa[, 1]
# C_mI <- mI - mean(mI) # but we don't want to center it! Only the sign
# # matters.
# 
# quadrant <- vector(mode="numeric",length=nrow(lisa))
# quadrant[cDV>0 & mI>0] <- 1
# quadrant[cDV <0 & mI>0] <- 2
# quadrant[cDV>0 & mI<0] <- 3
# quadrant[cDV <0 & mI<0] <- 4
# 
# # set a statistical significance level for the local Moran's
# signif <- 0.05
# 
# # places non-significant Moran's in the category "5"
# quadrant[lisa[, 5]> signif] <- 5
# colors <- c("#ca0020", "#0571b0", "#f4a582", "#92c5de", rgb(.95, .95, .95))
# 
# write(RJSONIO::toJSON(list(nulls, data.frame(mun.map$id, 
#                                              quadrant, 
#                                              color=colors[quadrant],
#                                              mun.map$state,
#                                              mun.map$municipio))), 
#       "json/lisa.json")
# 
# 
# plot(mun.map, border="grey", col=colors[quadrant],
#      main = "LISA Cluster Map, 1960 Homicides")
# legend("bottomright",legend=c("high-high","low-low","high-low","low-high"),
#        fill=colors,bty="n",cex=0.7,y.intersp=1,x.intersp=1)
# 
