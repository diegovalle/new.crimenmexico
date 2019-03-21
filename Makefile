################################################################################
# GLOBALS                                                                      #
################################################################################


FUERO_COMUN_PAGE=https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-del-fuero-comun-nueva-metodologia
VICTIMAS_PAGE=https://www.gob.mx/sesnsp/acciones-y-programas/victimas-nueva-metodologia
SNSP_DIR=clean/snsp-data

define download_file
# Visit the website with the open data downloads and extract the
# links with the latest data
	curl -s  $(1) | grep -Po '(?<=href=")[^"]*$(2)[^"]*(?=")' | \
	         sed 's| |%20|g' | xargs curl -s > $(3)
endef

define xlsb_to_csv
# list the file contents of the zip file, order by size, and extract
# only the biggest file to stdout
	unzip -p  $(SNSP_DIR)/$(1).zip "$$(unzip -l -qq $(SNSP_DIR)/$(1).zip \
	| sort -nr | sed 's|^[ ]*||g' | awk -F"   " 'NR==1{print $$2}')" \
                 > $(SNSP_DIR)/$(1).xlsb
# use libreoffice to convert to csv since it seems to be only program
# capable of converting xlsb files
	cd $(SNSP_DIR) && libreoffice --headless --convert-to csv \
                        -env:UserInstallation=file:///tmp/foobar7665765 \
                        $(1).xlsb
endef

all: download_csv download_inegi clean_data analysis website deploy


download_csv: $(SNSP_DIR)/estados.csv $(SNSP_DIR)/municipios.csv \
$(SNSP_DIR)/estados_victimas.csv

$(SNSP_DIR)/estados.csv:
	@echo "\n\n****************Download SNSP csv files****************\n"
	curl --retry 10 -Lo $@ https://datosabiertos.segob.gob.mx/DatosAbiertos/SESNSP/IDEFC_NM

$(SNSP_DIR)/municipios.csv:
	curl --retry 10 -Lo $@ https://datosabiertos.segob.gob.mx/DatosAbiertos/SESNSP/IDM_NM

$(SNSP_DIR)/estados_victimas.csv:
	curl --retry 10 -Lo $@ https://datosabiertos.segob.gob.mx/DatosAbiertos/SESNSP/IDVFC_NM


download_inegi: R/data/INEGI_exporta.csv

R/data/INEGI_exporta.csv:
	@echo "\n\n****************Downloading INEGI homicide data***********\n"
	cd R/data && ./inegi.sh



clean_data: db/crimenmexico.db

db/crimenmexico.db: $(SNSP_DIR)/estados.csv $(SNSP_DIR)/municipios.csv \
$(SNSP_DIR)/estados_victimas.csv
	@echo "\n\n****************Clean Data******************\n"
	$(RM) db/crimenmexico.db
	sqlite3 db/crimenmexico.db < clean/meta/sql.sql
	. ~/.virtualenvs/crimenmexico/bin/activate; cd clean && python clean.py


analysis: clean_data download_inegi
	@echo "\n\n****************Statistical Analysis******************\n"
	cd R && Rscript run_all.R

.PHONY: website
website:
	@echo "\n\n****************Build Website******************\n"
	./build_website.sh

.PHONY: deploy
deploy:
	@echo "\n\n****************Deploy Website******************\n"
	./deploy_website.sh


.PHONY: clean clean_snsp clean_db clean_analysis clean_inegi
clean: clean_snsp clean_inegi clean_db clean_analysis

clean_snsp:
	$(RM) $(SNSP_DIR)/*.zip $(SNSP_DIR)/*.csv $(SNSP_DIR)/*.xlsb

clean_inegi:
	$(RM) R/data/INEGI_exporta.csv

clean_db:
	$(RM) db/crimenmexico.db

clean_analysis:
	$(RM) R/graphs/*.png R/json/*.json R/json/*.RData \
	   R/interactive-map/*.json R/interactive-map/*.csv \
           R/Rplots.pdf
