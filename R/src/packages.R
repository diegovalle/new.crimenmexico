
if (!require(devtools)) {
  install.packages("devtools")
}
if (!require("mxmaps")) devtools::install_github('diegovalle/mxmaps')
if (!require("pacman")) install.packages("pacman")
pacman::p_load("dplyr",
                 "ggplot2",
                 "magrittr",
                 "RSQLite",
                 "zoo",
                 "lubridate",
                 "stringr",
                 "grid",
                 "extrafont",
                 "useful",
                 "rgdal",
                 "maptools",
                 "rgeos",
                 "raster",
                 "scales",
                 "mxmaps",
                 "AnomalyDetection",
                 "jsonlite",
                 "hash",
                 "RColorBrewer",
                 "compiler",
                 "data.table")

#font_import() 
#fonts() 