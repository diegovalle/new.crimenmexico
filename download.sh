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
    biggest_file=$(unzip -l "$SNSP_DIR"/"$3".zip | grep -P "^[ 0-9]+\d{4}-\d{2}-\d{2}" | sort -k 1 -nr | sed 's/\S   /|/g' | cut -d'|' -f 2 | head -n 1)
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

compare_headers() {
    # Capture the output of the first command
    output1=$(head -n 1 "$SNSP_DIR"/"$1")
    # Capture the output of the second command
    output2=$(head -n 1 "$SNSP_DIR"/"$2")

    # Use the '!=' operator to check for inequality
    if [ "$output1" != "$output2" ]; then
        echo "Headers are different"
        return 1
    else
        # Outputs are equal
        return 0
    fi
}

DOWNLOAD_URL="https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva?state=published"
TEXT_FUERO_COMUN_ESTADOS="2015[ ]*-[ ]*2025 \(Fuero Com&uacute;n - Delitos\). Incidencia delictiva estatal"
TEXT_FUERO_COMUN_ESTADOS_VICTIMAS="2015[ ]*-[ ]*2025 \(Fuero Com&uacute;n - V&iacute;ctimas\). Incidencia delictiva estatal"
TEXT_FUERO_COMUN_MUNICIPIOS="2015[ ]*-[ ]*2025 \(Fuero Com&uacute;n- Delitos\). Incidencia Delictiva municipal"

# Download metodología de 2015-2025
download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_ESTADOS" "estados2015.csv"

download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_ESTADOS_VICTIMAS" "estados_victimas2015.csv"

download_and_unzip "$DOWNLOAD_URL" "$TEXT_FUERO_COMUN_MUNICIPIOS" "municipios2015.csv"

# Download metodología 2026 a la fecha
download_and_unzip "$DOWNLOAD_URL" ".* 2026 \(Fuero com.*?n-Delitos\). Incidencia delictiva estatal" "estados2026.csv"

download_and_unzip "$DOWNLOAD_URL" ".* 2026 \(Fuero com.*?n-V.*?ctimas\). Incidencia delictiva estatal" "estados_victimas2026.csv"

download_and_unzip "$DOWNLOAD_URL" ".* 2026 \(Fuero com.*?n-Delitos\). Incidencia delictiva municipal" "municipios2026.csv"

compare_headers "estados2015.csv" "estados2026.csv"
compare_headers "estados_victimas2015.csv" "estados_victimas2026.csv"
compare_headers "municipios2015.csv" "municipios2026.csv"


# Recode new age categories in estados_victimas2026.csv
Rscript R/group_estados_victimas.R

{ cat "$SNSP_DIR"/estados2015.csv; tail -n +2 "$SNSP_DIR"/estados2026.csv; } > "$SNSP_DIR"/estados.csv
{ cat "$SNSP_DIR"/estados_victimas2015.csv; tail -n +2 "$SNSP_DIR"/estados_victimas2026.csv; } > "$SNSP_DIR"/estados_victimas.csv
{ cat "$SNSP_DIR"/municipios2015.csv; tail -n +2 "$SNSP_DIR"/municipios2026.csv; } > "$SNSP_DIR"/municipios.csv

rm -rf "$SNSP_DIR"/*.zip
rm -rf "$SNSP_DIR"/municipios2026.csv
rm -rf "$SNSP_DIR"/municipios2015.csv
rm -rf "$SNSP_DIR"/estados2026.csv
rm -rf "$SNSP_DIR"/estados2015.csv
rm -rf "$SNSP_DIR"/estados_victimas2026.csv
rm -rf "$SNSP_DIR"/estados_victimas2015.csv