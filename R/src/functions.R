state_coords <- structure(list(abbrev = c("BC", "SON", "CHIH",
                                          "BCS", "SIN", "DGO", "COAH", "NL","TAM",
                                          "NAY","ZAC", "AGS", "SLP",
                                          "JAL",  "GTO", "QRO", "HGO","VER",
                                          "MICH","COL","MEX", "TLAX",
                                          "GRO", "MOR","DF", "PUE", "YUC" ,
                                          "OAX", "TAB", "CAMP", "QROO",
                                          "CHPS"),
                               state = c("BAJA CALIFORNIA", "SONORA", "CHIHUAHUA",
                                         "BAJA CALIFORNIA SUR", "SINALOA", "DURANGO", "COAHUILA", "NUEVO LEON", "TAMAULIPAS",
                                         "NAYARIT", "ZACATECAS", "AGUASCALIENTES", "SAN LUIS POTOSI",
                                         "JALISCO", "GUANAJUATO", "QUERETARO", "HIDALGO", "VERACRUZ",
                                         "MICHOACAN","COLIMA", "MEXICO","TLAXCALA",
                                         "GUERRERO", "MORELOS", "DISTRITO FEDERAL", "PUEBLA", "YUCATAN" ,
                                         "OAXACA", "TABASCO", "CAMPECHE", "QUINTANA ROO",
                                         "CHIAPAS"),
                               fips = c(2L, 26L, 8L,
                                        3L, 25L, 10L, 5L, 19L, 28L,
                                        18L, 32L, 1L, 24L,
                                        14L, 11L, 22L, 13L, 30L,
                                        16L, 6L, 15L, 29L,
                                        12L, 17L, 9L, 21L, 31L,
                                        20L, 27L, 4L, 23L,
                                        7L),
                               col = c(1L, 2L, 3L,
                                       1L,  2L, 3L, 4L, 5L, 6L,
                                       3L, 4L, 5L, 6L,
                                       3L, 4L, 5L, 6L, 7L,
                                       3L, 4L, 5L, 6L,
                                       3L,4L, 5L, 6L, 9L,
                                       6L,7L, 8L,9L,
                                       7L),
                               row = c(1L, 1L, 1L,
                                       2L, 2L, 2L, 2L, 2L, 2L,
                                       3L, 3L, 3L, 3L,
                                       4L, 4L, 4L, 4L, 4L,
                                       5L, 5L, 5L, 5L,
                                       6L, 6L, 6L, 6L, 6L,
                                       7L, 7L, 7L, 7L,
                                       8L)),
                          .Names = c("abbrev", "state", "fips", "col", "row"),
                          class = "data.frame", row.names = c(NA, -32L))

numberOfDays  <- function(x) {
  ym <- as.yearmon(x)
  as.numeric(as.Date(ym, frac = 1) - as.Date(ym) + 1)
}

bigBins <- function(vic, max_date, legend_title, title, crime) {
  vic$region <- str_pad(vic$state_code, 2 ,"left", "0")
  vic$value <- vic$rate
  last_date_states <- subset(vic, date == max(vic$date, na.rm = TRUE) &
                               tipo == crime)
  mxhexbin_choropleth(last_date_states, num_colors = 1,
                      label_size = 3.5)  +
    theme(legend.position="top")+
    theme(panel.border=element_blank())+
    theme(panel.grid=element_blank())+
    theme(panel.background=element_blank())+
    theme(axis.ticks=element_blank())+
    theme(axis.text=element_blank()) +
    infographic_theme2() +
    theme_bare() +
    ggtitle(str_c(title, " - ", toupper(max_date))) +
    theme(
      legend.position = c(.96, .83), 
      legend.margin = unit(0, "lines"),
      legend.title = element_text(family = "Ubuntu", 
                                  color = "#0D0D0D", size = 10),
      legend.text = element_text(family = "Ubuntu", color = "#0D0D0D", size = 9),
      legend.key = element_rect(fill = NA),
      legend.background = element_rect(fill = "#C7B470"),
      legend.key.height = unit(.7, "cm"), 
      legend.key.width = unit(1.1, "cm")
    ) +
    scale_fill_gradientn(legend_title,
                         colours = brewer.pal(9, "YlOrRd"),
                         guide = guide_colorbar(direction = "horizontal", 
                                                title.position = "top",
                                                label.position="bottom"))
}

bubblePlot <- function(vic, crime, legend, low, high, mid, rate){
  df <- subset(vic, tipo == crime & date == max(vic$date, na.rm = TRUE))
  df$state_abbrv <- reorder(df$state_abbrv, df$rate, 
                            function(x) x[length(x)])
  ggplot(df, aes(rate, state_abbrv, group = state_abbrv)) +
    geom_point(aes(size = count, fill = rate),
               shape = 21, color = "black") +
    scale_size_continuous(legend, range = c(1,6))  +
    sm_theme() +
    scale_fill_gradient2("Annualized Homicide\nKidnapping Rates", 
                         low = low, high = high, mid = mid, 
                         space = "Lab", guide = FALSE) +
    ylab("") + xlab(rate) +
    theme(
      legend.position = "top", legend.title = element_text(family = "Ubuntu", 
                                                           colour = "#0D0D0D", size = 8),
      legend.background = element_rect(fill = "#C7B470"),
      legend.key = element_rect(fill = "#C7B470", colour = "#C7B470"),
      legend.text = element_text(family = "Lato", colour = "#0D0D0D", size = 8)
    )
}

bottomMap <- function(vic, crime, legend, low, high, mid, title, date) {
  vic$region <- str_pad(vic$state_code, 2 ,"left", "0")
  vic$value <- vic$rate
  last_date_states <- subset(vic, date == max(vic$date, na.rm = TRUE) &
                               tipo == crime)
  #st.dat <- merge(state_coords, last_date_states, by.x="abbrev", by.y="state_abbrv", all.y=TRUE)
  #browser()
  #ggplot(st.dat, aes_string(x="col", y="row", label="abbrev"))+ 
  mxhexbin_choropleth(last_date_states, num_colors = 1,
                      label_size = 2,
                      label_color = "white") + 
    #geom_tile(aes_string(fill="value"))+ 
    #geom_tile(
    #  aes_string(fill="value"), size=4, show_guide=FALSE)+
    #geom_text(color="#ffffff", size=2.5, family = "Sans")+
    #scale_y_reverse()+ 
    labs(x=NULL, y=NULL, title=NULL)+
    theme_bw()+
    infographic_theme2()+
    theme(legend.position="top")+
    theme(panel.border=element_blank())+
    theme(panel.grid=element_blank())+
    theme(panel.background=element_blank())+
    theme(axis.ticks=element_blank())+
    theme(axis.text=element_blank()) +
  #ggplot(left_join(last_date_states, mx), aes(long, lat, group = group)) +
    infographic_theme2() +
    ggtitle(str_c(title, " - ", toupper(date))) +
    theme_bare() +
    theme(
      legend.position = c(.94, .83), 
      legend.margin = unit(0, "lines"),
      legend.title = element_text(family = "Ubuntu", 
                                  colour = "#0D0D0D", size = 8),
      legend.text = element_text(family = "Ubuntu", colour = "#0D0D0D", size = 6),
      legend.key = element_rect( fill = NA),
      legend.background = element_rect(fill = "#C7B470"),
      legend.key.height = unit(0.4, "cm"), 
      legend.key.width = unit(0.4, "cm"),
      plot.title = element_text(colour = "#361413", face = "bold", size = 12, vjust = 1, 
                                family = "Fugaz One")
    ) +
#     geom_polygon(aes(fill = rate),
#                  size = .2)+
#     geom_polygon(aes(fill = rate),
#                  size = .2, color = "black", show_guide=FALSE) +
#     coord_map("albers", lat0 = bb[ 2 , 1 ] , lat1 = bb[ 2 , 2 ] ) +
    #     annotate("text", x=-112.203369, y=19.608956, label=date, 
    #              color="black", size=3) +
    scale_fill_gradient2(legend,
                         low = low, high = high, mid = mid, space = "Lab",
                         guide = guide_colorbar(direction = "horizontal", 
                                              title.position = "top",
                                              label.position="bottom", label.hjust = 0.5, 
                                              label.vjust = 0.5)) +
  #scale_x_continuous(limits = c(0, 10), expand = c(-.05, 0))+
  coord_fixed(ratio = 1)
}

smNational <- function(vic, rate, title, date, max_date, min_date) {
  national <- vic %>% 
    group_by(date, modalidad, tipo, subtipo) %>% 
    summarise(count = sum(count), pop = sum(population)) %>%
    mutate(rate = (((count /  numberOfDays(date) * 30) * 12) / pop) * 10^5  ) 
  national$tipo <- reorder(national$tipo, -national$rate, mean, na.rm = TRUE)
  
  ggplot(national, aes(date, rate, group = tipo)) +
    geom_point(color = "#222222", size =1.5) +
    geom_smooth(method = "gam", formula = y ~s(x, k = 5), 
                se = FALSE, color = "#b30000", size = 1.2, alpha = .8) +
    facet_wrap(~tipo, scale = "free") + 
    expand_limits(y = 0)+ 
    ggtitle(str_c(title, ", ",min_date, "–", max_date)) +
    infographic_theme2() +
    ylab(rate) +
    xlab(date)
}


smallMultiple <- function(vic, crime, rate, guide_text){
  df <- filter(vic, tipo == crime)
  df$state_abbrv <- reorder(df$state_abbrv, -df$rate, 
                                 function(x) x[length(x)])
  k = 6
  ggplot(df, aes(date, rate, group = state_abbrv)) +
    geom_point(size = .4, color = "#555555") +
    geom_smooth(se = FALSE, method = "gam", formula = y ~ s(x, k = 6), color = "#0D0D0D", 
                size = .6) +
    geom_point(data = subset(df, date == max(df$date, na.rm = TRUE)), 
               aes(size = count), color = "#b30000") +
    facet_wrap(~state_abbrv) +
    scale_x_date(breaks = c(min(df$date), max(df$date, na.rm = TRUE)),
                 labels = date_format("%b-%y")) +
    scale_y_continuous(breaks = c(0, round(max(df$rate, na.rm = TRUE)))) +
    scale_size(guide_text, guide = guide_legend(direction = "horizontal", 
                                                title.position = "top",
                                                label.position="bottom", label.hjust = 0.5, 
                                                label.vjust = 0.5), 
               range = c(.5,2.5)) +
    sm_theme() +
    ylab(rate) + 
    xlab("")+
    theme(
      legend.position = c(.7, .05),
      legend.title = element_text(family = "Ubuntu", 
                                  colour = "#0D0D0D", size = 8),
      legend.text = element_text(family = "Ubuntu", colour = "#0D0D0D", size = 6)
    )
}

bigMapHom <- function(vic, crime, legend, title, date) {
  last_date_states <- subset(vic, date == max(vic$date, na.rm = TRUE) &
                               tipo == crime)
  
  ggplot(left_join(last_date_states, mx), aes(long, lat, group = group), 
         color = "black") +
    geom_polygon(aes(fill = rate),
                 size = .2, color = "black") +
    coord_map("albers", lat0 = bb[ 2 , 1 ] , lat1 = bb[ 2 , 2 ] )  + 
    scale_fill_gradient2(legend, 
                         low = "#ffeda0", high = "#f03b20", mid = "#feb24c", space = "Lab") +
    annotate("point", x=-106.424561, y=31.697793, color="black") + 
    annotate("text", x=-106.424561, y=31.697793 + .7, color="black", 
             label = "Juárez", size = 2.5) + 
    annotate("point", x=-99.868469, y=16.838062, color="black") + 
    annotate("text", x=-99.868469, y=16.838062 - .8, color="black", 
             label = "Acapulco", size = 2.5) + 
    annotate("point", x=-102.351379, y=19.084831, color="black") + 
    annotate("text", x=-102.351379-3, y=19.084831 - 1, color="black", 
             label = "Apatzingán", size = 2.5) + 
    annotate("point", x=-99.549866, y=27.495481, color="black") + 
    annotate("text", x=-99.549866+2.5, y=27.495481 + .5, color="black", 
             label = "Nuevo Laredo", size = 2.5) + 
    annotate("point", x=-117.066879, y=32.517144, color="black") + 
    annotate("text", x=-117.066879, y=32.517144 + .7, color="black", 
             label = "Tijuana", size = 2.5) + 
    annotate("point", x=-106.320190, y=23.083522, color="black") + 
    annotate("text", x=-106.320190-1.4, y=23.083522 - .8, color="black", 
             label = "Mazatlan", size = 2.5) + 
    annotate("point", x=-86.853104, y=21.172087, color="black") + 
    annotate("text", x=-86.853104+1.7, y=21.172087, color="black", 
             label = "Cancún", size = 2.5) + 
    #     annotate("text", x=-112.203369, y=19.608956, label=date, 
    #              color="black", size=4, fontface="bold") +
    ggtitle(str_c(title, " - ", toupper(date))) +
    #guides(fill = guide_legend(override.aes = list(size = 6)))+
    theme(legend.key = element_rect( fill = NA)) +
    infographic_theme2() +
    theme_bare()
}



# Configure Theme
infographic_theme <- function() {
  theme(
    plot.background = element_rect(fill = "#E2E2E3", colour = "#E2E2E3"),
    panel.background = element_rect(fill = "#E2E2E3"),
    #panel.background = element_rect(fill = "white"),
    axis.text = element_text(colour = "#E7A922", family = "Yanone Kaffeesatz"),
    plot.title = element_text(colour = "#552683", face = "bold", size = 18, vjust = 1, family = "Yanone Kaffeesatz"),
    axis.title = element_text(colour = "#552683", face = "bold", size = 13, family = "Yanone Kaffeesatz"),
    panel.grid.major.x = element_line(colour = "#E7A922"),
    panel.grid.minor.x = element_blank(),
    panel.grid.major.y = element_blank(),
    panel.grid.minor.y = element_blank(),
    strip.text = element_text(family = "Vollkorn Bold", colour = "white"),
    strip.background = element_rect(fill = "#E7A922"),
    axis.ticks = element_line(colour = "#E7A922"),
    axis.title.x= element_text(vjust = -0.5), 
    axis.title.y= element_text(vjust = 2)
  )
}

infographic_theme2 <- function() {
  theme(
    legend.position = "top", legend.title = element_text(family = "Lato Black", 
                                                         colour = "#0D0D0D", size = 10),
    legend.background = element_rect(fill = "#C7B470"),
    legend.key = element_rect(fill = "#C7B470", colour = "#C7B470"),
    legend.text = element_text(family = "Fugaz One", colour = "#0D0D0D", size = 10),
    plot.background = element_rect(fill = "#C7B470", colour = "#C7B470"),
    panel.background = element_rect(fill = "#C7B470"),
    #panel.background = element_rect(fill = "white"),
    axis.text = element_text(colour = "#0D0D0D", family = "Muli", size = 8),
    plot.title = element_text(colour = "#361413", face = "bold", size = 23, vjust = 1, 
                              family = "Fugaz One"),
    axis.title = element_text(colour = "#0D0D0D", face = "bold", size = 14, 
                              family = "PT Sans Narrow"),
    panel.grid.major.y = element_line(colour = "#444444", size=0.1),
    panel.grid.minor.y = element_blank(),
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    strip.text = element_text(family = "Lato Black", colour = "white", size = 14),
    strip.background = element_rect(fill = "#0D0D0D"),
    axis.ticks = element_line(colour = "#0D0D0D")
  )
}

sm_theme <- function() {
  theme(
    legend.position = "top", legend.title = element_text(family = "Lato Black", 
                                                         colour = "#0D0D0D", size = 10),
    legend.background = element_rect(fill = "#C7B470"),
    legend.key = element_rect(fill = "#C7B470", colour = "#C7B470"),
    legend.text = element_text(family = "Fugaz One", colour = "#0D0D0D", size = 10),
    plot.background = element_rect(fill = "#C7B470", colour = "#C7B470"),
    panel.background = element_rect(fill = "#C7B470"),
    #panel.background = element_rect(fill = "white"),
    axis.text = element_text(colour = "#0D0D0D", family = "Muli", size = 6),
    plot.title = element_text(colour = "#361413", face = "bold", size = 24, vjust = 1, 
                              family = "Fugaz One"),
    axis.title = element_text(colour = "#0D0D0D", face = "bold", size = 14, 
                              family = "PT Sans Narrow"),
    panel.grid.major.y = element_line(colour = "#555555", size=0.1),
    panel.grid.minor.y = element_blank(),
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    strip.text = element_text(family = "Lato Black", colour = "white", size = 7),
    strip.background =  element_rect(fill = "#7B6824"),
    #axis.ticks = element_blank(),
    axis.text.x = element_text(angle = 70, hjust = 1)
  )
}

theme_bare <- function() {theme(axis.line=element_blank(),
                                axis.text.x=element_blank(),
                                axis.text.y=element_blank(),
                                axis.ticks=element_blank(),
                                axis.title.x=element_blank(),
                                axis.title.y=element_blank(),
                                panel.background=element_blank(),
                                panel.border=element_blank(),
                                panel.grid.major=element_blank(),
                                panel.grid.minor=element_blank())
}

toSvg <- function(fileName, crime_in_mexico, max_date, note, attribution){
  # matrix plot with 4 rows and 3 columns
  svg(fileName, width = 12, height = 20)
  grid.newpage() 
  pushViewport(viewport(layout = grid.layout(8, 3)))
  # Yellow bar at the top for the title
  grid.rect(gp = gpar(fill = "#C7B470", col = "#C7B470"))
  # Title
  grid.text(crime_in_mexico, y = unit(.997, "npc"), x = unit(0.5, "npc"), vjust = 1, hjust = .5, 
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
            x = unit(0.5, "npc"), y = unit(0.921, "npc"), 
            width = unit(1, "npc"), height = unit(0.085, "npc"))
  # Text inside the yellow bar
  grid.text(note, vjust = 0, hjust = 0, x = unit(0.01, "npc"), 
            y = unit(0.915, "npc"), 
            gp = gpar(fontfamily = "Ubuntu", col = "#552683", cex = 1.08))
  # author info
  grid.text(attribution, vjust = 0, hjust = 0, x = unit(0.01, "npc"), y = unit(0.885, "npc"), 
            gp = gpar(fontfamily = "Ubuntu", col = "#361413", cex = 0.8))
  # Add the dates to maps
  # Big top map
  
  print(homicide.map, vp = vplayout(2:3, 1:2))
  print(national.chart, vp = vplayout(4:5, 1:3))
  print(hom.sm, vp = vplayout(2:3, 3))
  
  print(sec.map, vp = vplayout(6, 1))
  print(rvcv.map, vp = vplayout(6, 2))
  print(rvsv.map, vp = vplayout(6, 3))
  
  print(sec.sm, vp = vplayout(7:8, 1))
  print(rvcv.sm, vp = vplayout(7:8, 2))
  print(rvsv.sm, vp = vplayout(7:8, 3))
  
  dev.off()
}
