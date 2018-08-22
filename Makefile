FUERO_COMUN_PAGE=https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-del-fuero-comun-nueva-metodologia
VICTIMAS_PAGE=https://www.gob.mx/sesnsp/acciones-y-programas/victimas-nueva-metodologia
SNSP_DIR=clean/snsp-data

define download_file
	curl -s  $(1) | grep -Po '(?<=href=")[^"]*$(2)[^"]*(?=")' | \
	sed 's| |%20|g' | xargs curl -s > $(SNSP_DIR)/$(3).zip
endef

define xlsb_to_csv
	unzip -p $(SNSP_DIR)/$(1).zip > $(SNSP_DIR)/$(1).xlsb
	cd $(SNSP_DIR); libreoffice --headless --convert-to csv \
                        -env:UserInstallation=file:///tmp/foobar7665765 \
                        $(1).xlsb
endef

all: download_snsp download_inegi convert_to_csv clean_data analysis website


download_snsp: $(SNSP_DIR)/municipios.zip $(SNSP_DIR)/estados.zip \
	$(SNSP_DIR)/estados_victimas.zip


$(SNSP_DIR)/municipios.zip:
	@echo "\n****************Downloading SNSP data*******************\n"
	$(call download_file,$(FUERO_COMUN_PAGE),Municipal,municipios)

$(SNSP_DIR)/estados.zip:
	$(call download_file,$(FUERO_COMUN_PAGE),Estatal,estados)

$(SNSP_DIR)/estados_victimas.zip:
	$(call download_file,$(VICTIMAS_PAGE),Estatal,estados_victimas)


download_inegi:
	@echo "\n\n****************Downloading INEGI data******************\n"
	cd R/data && ./inegi.sh


convert_to_csv: $(SNSP_DIR)/estados.csv $(SNSP_DIR)/municipios.csv \
	$(SNSP_DIR)/estados_victimas.csv

$(SNSP_DIR)/estados.csv: download_snsp
	@echo "\n\n****************Converting to .csv******************\n"
	$(call xlsb_to_csv,estados)

$(SNSP_DIR)/municipios.csv: download_snsp
	$(call xlsb_to_csv,municipios)

$(SNSP_DIR)/estados_victimas.csv: download_snsp
	$(call xlsb_to_csv,estados_victimas)


clean_data: db/crimenmexico.db convert_to_csv

db/crimenmexico.db:
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


.PHONY: clean clean_snsp clean_db  clean_analysis clean_inegi clean_analysis
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
