#!/bin/bash
# shellcheck disable=SC2001
set -euo pipefail #exit on error, undefined and prevent pipeline errors
IFS=$'\n\t'

SNSP_DIR=clean/snsp-data

extract_link() {
    local url="$1"
    local regex="$2"
    
	 curl "$url" | grep -P "$regex" | grep -oP '(?<=href=")[^"]*' 
}

download_and_unzip() {
    local url="$1"
    local regex="$2"
    local filename="$3"

    local link
    link=$(extract_link "$url" "$regex")
    
    # Download the ZIP file. Add &download=1" to force sharepoint to download
    wget -O "$SNSP_DIR"/"$filename".zip "$link&download=1" 
    biggest_file=$(unzip -l "$SNSP_DIR"/"$3".zip | grep -P "^[ 0-9]+\d{4}-\d{2}-\d{2}" | sort -k 1 -nr | sed 's/   /|/g' | cut -d'|' -f 2 | head -n 1)
    unzip -o "$SNSP_DIR"/"$filename".zip "$biggest_file" -d "$SNSP_DIR"
    mv "$SNSP_DIR"/"$biggest_file" "$SNSP_DIR"/"$filename"
}

download_municipal() {
    local url="$1"
    local regex="$2"

    local link
    link=$(extract_link "$url" "$regex")
    
    wget -O "$SNSP_DIR"/"$filename".zip "$link&download=1" 
    biggest_file=$(unzip -l "$SNSP_DIR"/"$3".zip | grep -P "^[ 0-9]+\d{4}-\d{2}-\d{2}" | sort -k 1 -nr | sed 's/   /|/g' | cut -d'|' -f 2 | head -n 1)
    unzip -o "$SNSP_DIR"/"$filename".zip "$biggest_file" -d "$SNSP_DIR"
    mv "$SNSP_DIR"/"$biggest_file" "$SNSP_DIR"/"$filename"
}

DOWNLOAD_URL="https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva?state=published"
TEXT_FUERO_COMUN_ESTADOS="2015 -20.. \(Fuero Com&uacute;n - Delitos\). Incidencia delictiva estatal"
TEXT_FUERO_COMUN_ESTADOS_VICTIMAS="2015 - 20.. \(Fuero Com&uacute;n - V&iacute;ctimas\). Incidencia delictiva estatal"
TEXT_FUERO_COMUN_MUNICIPIOS="2015 - 20.. \(Fuero Com&uacute;n- Delitos\). Incidencia Delictiva municipal"

download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_ESTADOS" "estados.csv"

download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_ESTADOS_VICTIMAS" "estados_victimas.csv"

download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_MUNICIPIOS" "municipios.csv"


