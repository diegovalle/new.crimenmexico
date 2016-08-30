
if (!require(devtools)) {
  install.packages("devtools", repos="https://mran.revolutionanalytics.com/snapshot/2015-04-26")
}

if (!require("mxmaps")) {
  devtools::install_github('diegovalle/mxmaps')
  require('mxmpas')
}
if (!require("AnomalyDetection")) {
  devtools::install_github('twitter/AnomalyDetection')
  require('AnomalyDetection')
}
if (!require("mxmortalitydb")) {
  devtools::install_github('diegovalle/mxmortalitydb')
  require('mxmortalitydb')
}
if (!require("pacman")) install.packages("pacman")
pacman::p_load("dplyr",
               "ggplot2",		
               "rgeos",
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
               "gpclib",
               "raster",
               "scales",
               "mxmaps",
               "AnomalyDetection",
               "jsonlite",
               "hash",
               "RColorBrewer",
               "compiler",
               "data.table",
               "mgcv",
               "tidyr",
               "mxmortalitydb",
               "future")

#font_import("fonts", prompt = FALSE) 
loadfonts()
# fonts() 
# fonttable()
