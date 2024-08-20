


source(file.path("src", "load-packages.R"))
identical(sort(unique(injury.intent$year_reg)), 
          min(injury.intent$year_reg):max(injury.intent$year_reg))
last_inegi_date <- paste0(max(injury.intent$year_reg), '-12-01')

source(file.path("src", "functions.R"))
source(file.path("src", "state-infographics.R"))
source(file.path("src", "json.R"))
source(file.path("src", "state-diff.R"))
source(file.path("src", "state-historic.R"))
source(file.path("src", "municipios.R"))
source(file.path("src", "interactive-map.R"))
source(file.path("src", "top-municipios.R"))
source(file.path("src", "tourism.R"))
source(file.path("src", "cluster-map-gam.R"))
source(file.path("src", "female-homicide.R"))
source(file.path("src", "feminicide.R"))
source(file.path("src", "anomalies.R"))
