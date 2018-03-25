
if (!require(devtools)) {
  install.packages("devtools", repos="https://mran.revolutionanalytics.com/snapshot/2018-02-10")
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
pacman::p_load("AnomalyDetection",
               "compiler",
               "data.table",
               "dplyr",
               "extrafont",
               "future",
               "ggplot2",
               "ggrepel",
               "gpclib",
               "grid",
               "hash",
               "jsonlite",
               "lubridate",
               "magrittr",
               "maptools",
               "mgcv",
               "mxmaps",
               "mxmortalitydb",
               "raster",
               "RColorBrewer",
               "rgdal",
               "rgeos",
               "RSQLite",
               "Rttf2pt1",
               "scales",
               "spdep",
               "stringr",
               "tidyr",
               "useful",
               "viridis",
               "zoo")

#font_import("fonts", prompt = FALSE) 
loadfonts()
# fonts() 
# fonttable()
