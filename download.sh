#!/bin/bash
# shellcheck disable=SC2001
set -euox pipefail #exit on error, undefined and prevent pipeline errors
IFS=$'\n\t'

SNSP_DIR=clean/snsp-data

ESTADOS_FC_ZIP=$SNSP_DIR/estados_fc_original.zip
MUN_FC_ZIP=$SNSP_DIR/municpios_fc_original.zip
ESTADOS_VIC_ZIP=$SNSP_DIR/estados_vic_original.zip

estatal_download() {
    regex="(?<=href=\")[^\"][^\"]*(?=\">$4.*<\/a>)"
    INTERMEDIATE_LINK=$(curl -s -L  "$1" | \
                                grep -Po "$regex" | tail -n1 | \
                                sed 's| |%20|g')
    echo "$INTERMEDIATE_LINK"
    wget -O "$SNSP_DIR"/"$3".zip "$INTERMEDIATE_LINK&download=1" 
    biggest_file=$(unzip -l "$SNSP_DIR"/"$3".zip | grep -P "^[ 0-9]+\d{4}-\d{2}-\d{2}" | sort -k 1 -nr | sed 's/   /|/g' | cut -d'|' -f 2 | head -n 1)
    unzip -o "$SNSP_DIR"/"$3".zip "$biggest_file" -d "$SNSP_DIR"
    mv "$SNSP_DIR"/"$biggest_file" "$SNSP_DIR"/"$3"
    #gdown "https://drive.google.com/uc?id=$INTERMEDIATE_LINK" -O "$SNSP_DIR"/"$3"
    #drive_direct_download "$INTERMEDIATE_LINK"
}


municipal_fc_download() {
    #ggID='1FoFXpt4OeEXP8qeDzPKU-qky1f5iL8Gh'
    LINK=$(curl -s  "$1" | \
           grep -Po "(?<=href=\")[^\"][^\"]*(?=\">Cifras de Incidencia Delictiva Municipal, 2015.*)"  | \
           sed 's| |%20|g')
    wget -O "$SNSP_DIR"/municipios.zip "$LINK&download=1" 
    biggest_file=$(unzip -l "$SNSP_DIR"/municipios.zip | grep -P "^[ 0-9]+\d{4}-\d{2}-\d{2}" | sort -k 1 -nr | sed 's/   /|/g' | cut -d'|' -f 2 | head -n 1)
    unzip -o "$SNSP_DIR"/municipios.zip "$biggest_file" -d "$SNSP_DIR"
    mv "$SNSP_DIR"/"$biggest_file" "$SNSP_DIR"/municipios.csv
    #gdown "https://drive.google.com/uc?id=$ggID" -O "$SNSP_DIR"/municipios.csv
}

convert_to_csv() {
    XLS=$(unzip -l -qq "$1" |
              sort -nr |
              sed 's|^[ ]*||g'  |
              awk -F"   " 'NR==1{print $2}')
    if [[ "$XLS" =~ \.xls ]]; then
        unzip -p "$1" "$XLS"  > "$SNSP_DIR/$2.xlsb"
        (cd $SNSP_DIR && libreoffice --headless --convert-to csv \
                                      -env:UserInstallation=file:///tmp/foobar7665765 \
                                      "$2".xlsb)
    elif [[ "$XLS" =~ \.csv$ ]]; then
        unzip -p "$1" "$XLS" > "$SNSP_DIR"/"$2".csv
    else
        exit 1
    fi
}

#if ! [ -x "$(command -v gdown)" ]; then
#    virtualenv ~/.virtualenvs/gdown
    # shellcheck source=/dev/null
#    source ~/.virtualenvs/gdown/bin/activate
    #pip install gdown
#fi

URL_ESTADOS="https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-del-fuero-comun-nueva-metodologia?state=published"
URL_MUNS="https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva?state=published"
URL_VIC="https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva?state=published"

municipal_fc_download "$URL_MUNS"
estatal_download "$URL_MUNS" "Estatal" "estados.csv" "Cifras de Incidencia Delictiva Estatal, 2015"
estatal_download "$URL_MUNS" "V&iacute;ctimas" "estados_victimas.csv" "Cifras de V&iacute;ctimas del Fuero Com&uacute;n, 2015"

#convert_to_csv "$ESTADOS_FC_ZIP" estados
#convert_to_csv "$MUN_FC_ZIP" municipios
#convert_to_csv "$ESTADOS_VIC_ZIP" estados_victimas

# deactivate || true
