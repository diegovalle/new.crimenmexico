
if (!require(devtools)) {
  install.packages("devtools")
}

if (!require("mxmaps")) devtools::install_github('diegovalle/mxmaps')
if (!require("AnomalyDetection")) devtools::install_github('twitter/AnomalyDetection')
if (!require("mxmortalitydb")) devtools::install_github('diegovalle/mxmortalitydb')
if (!require("pacman")) install.packages("pacman")
pacman::p_load("dplyr",
                 "ggplot2",
                 "gpclib",
                 "magrittr",
                 "RSQLite",
                 "zoo",
                 "lubridate",
                 "stringr",
                 "grid",
                 "Rttf2pt1",
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

font_import("fonts", prompt = FALSE) 
loadfonts()
# fonts() 
# fonttable()