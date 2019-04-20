#!/bin/bash
# shellcheck disable=SC2001
set -euo pipefail #exit on error, undefined and prevent pipeline errors
IFS=$'\n\t'

COOKIE_TMP=$(mktemp)

SNSP_DIR=clean/snsp-data

ESTADOS_FC_ZIP=$SNSP_DIR/estados_fc_original.zip
MUN_FC_ZIP=$SNSP_DIR/municpios_fc_original.zip
ESTADOS_VIC_ZIP=$SNSP_DIR/estados_vic_original.zip

drive_direct_download() {
    ID="$(echo "$1" | sed "s|https://drive.google.com/open?id=||g")"
    echo "https://drive.google.com/uc?export=download&id=$ID"
}

estatal_download() {
    regex="(?<=href=\")[^\"][^\"]*(?=\">$2 \d{4} - \d{4}<\/a><\/p>)"
    INTERMEDIATE_LINK=$(curl -s -L  "$1" | \
                                grep -Po "$regex" | \
                                sed 's| |%20|g')

    drive_direct_download "$INTERMEDIATE_LINK"
}

municipal_fc_download() {
    INTERMEDIATE_LINK=$(curl -s  "$1" | \
                         grep -Po "(?<=href=\")[^\"][^\"]*(?=\">Municipal \d{4} - \d{4}<\/a>&nbsp;)" | \
                         sed 's| |%20|g')
    REDIRECT=$(drive_direct_download "$INTERMEDIATE_LINK")
    FILE=$(curl  -c "$COOKIE_TMP" -s -L "$REDIRECT" | grep -Po "(?<=href=\")[^\"][^\"]*(?=\">Download anyway<\/a>)")
    echo https://drive.google.com"$FILE" | sed 's|\&amp;|\&|g'
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

URL="https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-del-fuero-comun-nueva-metodologia?state=published"
curl -L -s -o "$ESTADOS_FC_ZIP" "$(estatal_download "$URL" "Estatal")"
curl -s -Lb "$COOKIE_TMP" -o "$MUN_FC_ZIP" "$(municipal_fc_download "$URL")"
URL_VIC="https://www.gob.mx/sesnsp/acciones-y-programas/victimas-nueva-metodologia?state=published"
curl -s -L -o "$ESTADOS_VIC_ZIP" "$(estatal_download "$URL_VIC" "V&iacute;ctimas")"

convert_to_csv "$ESTADOS_FC_ZIP" estados
convert_to_csv "$MUN_FC_ZIP" municipios
convert_to_csv "$ESTADOS_VIC_ZIP" estados_victimas
