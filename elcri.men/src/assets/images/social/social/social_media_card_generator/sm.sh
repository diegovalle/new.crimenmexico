#!/bin/bash

IMAGES=(acerca
        anomalias
        clusters
        envipe
        estados
        feminicidio
        homicidios-mujeres
        index
        infographics
        mapa
        municipios
        top50
        trends
        trends-states
        turismo
        estados-diff
        estados-ranking
        crimen-tasas
        daily-report)
        
TITLES=("Datos\nabiertos"
        "Patrones\nanormales\nde\ndelitos"
        "Clusters de\nHomicidios\nen\nMéxico"
        "Subregistro\nde\ndelitos"
        "Crimen\npor\nEstado"
        "Feminicidios\npor\nEstado"
        "Homicidios\nde\nmujeres"
        "Reporte\nMensual\nDe\nEl Crimen\nEn México"
        "Infográficas\nde la\ndelincuencia\nen\nMéxico"
        "Mapa\nCriminal\nde\nMéxico"
        "Series\nde tiempo\ncriminales\npor\nmunicipio"
        "Municipios\nmás\nviolentos\nde\nMéxico"
        "Tendencias\nde\nhomicidios\nen\nMéxico"
        "Tendencias\nde\nhomicidios\npor\nEstado"
        "Destinos\nmás\nseguros\nde\nMéxico"
        "Diferencias\nen\nhomicidios"
        "Ranking\npor\nestado"
        "Índice de\nCriminalidad\nen\nMéxico"
        "Reporte\nDiario\nde\nHomicidios"
       )

TITLES_EN=("Open\ncrime\ndata"
           "Counties\nwith\nCrime\nSpikes"
           "Homicide\nClusters\nin\nMexico"
           "Under-\nreporting\nCrime\nin\nMexico"
           "Mexico\nCrime\nby\nState"
           "Mexican\nFeminicides\nby\nState"
           "Female\nHomicides\nin\nMexico"
           "Up-to-date\nCrime\nRates\nin\nMexico"
           "Crime\nInfographics"
           "Crime\nMap\nof\nMexico"
           "Mexican\nCrime\n\by\nCounty"
           "Most\nviolent\ncities\nin\nMexico"
           "Homicide\nTrends\nin\nMexico"
           "Homicide\nTrends\nby\nState"
           "Safest\ntourism\ndestinations\nin\nMexico"
           "Changes\nin\nhomicide\nrates"
           "Crime\nrank\nby\nstate"
           "Crime\nRates\nin\nMexico"
           "Daily\nHomicide\nReport"
          )
WW=1200
HH=630
SLIDE_BGCOLOR="#FFDF00"
BORDER_COLOR="#999999"
TITLE_FONT=fonts/Raleway-ExtraBold.ttf
ATTRIBUTION_FONT=fonts/Merriweather-Bold.ttf



for ((i=0;i< ${#IMAGES[@]}; ++i)); do
    echo "generating social card for ""${IMAGES[i]}"
    TMP1=$(mktemp).png
    TMP2=$(mktemp).png
    TMP3=$(mktemp).png
    TMP4=$(mktemp).png
    SLIDE=$(mktemp).png
    LOGO=$(mktemp).png
    SLIDE_WITH_LOGO=$(mktemp).png
    RESIZED=$(mktemp).png

    convert -resize "$WW"x"$HH"'^' screenshots/"${IMAGES[i]}.png" "$RESIZED"
    #inname=$(convert "$IMAGE" -format "%t" info:)
    convert "$RESIZED" -canny 0x1+10%+30% "$TMP1"
    coords=$(compare -metric rmse -subimage-search -dissimilarity-threshold 1 \
                     "$TMP1" \( -size ${WW}x${HH} xc:white \) null: 2>&1 | cut -d\  -f4)
    XOFF=$(echo "$coords" | cut -d, -f1)
    YOFF=$(echo "$coords" | cut -d, -f2)
    convert screenshots/"${IMAGES[i]}.png" -crop "${WW}x${HH}+${XOFF}+${YOFF}" \
            +repage "$TMP2"

    convert -size "$WW"x"$HH" xc:transparent -fill "$SLIDE_BGCOLOR" \
            -stroke $BORDER_COLOR -strokewidth .7 -draw "polygon  0,0 470,0 332,629 0,629" \
            -stroke $BORDER_COLOR -strokewidth .7 -fill transparent -draw "polygon  0,0 1199,0 1199,629 0,629" \
            -stroke $BORDER_COLOR -strokewidth .7  -fill white -draw "polygon  470,0 485,0 347,629 332,629" "$SLIDE"
    convert -size 200x40 -resize 200x40 -background none logos/logo.svg "$LOGO"
    composite -compose atop  -geometry +15+30 "$LOGO" "$SLIDE" "$SLIDE_WITH_LOGO"

    composite -compose atop "$SLIDE_WITH_LOGO" "$TMP2" "$TMP3"
    convert -font "$TITLE_FONT" -pointsize 60 \
            -fill black -annotate  +15+140 "${TITLES[i]}" \
            "$TMP3" "$TMP4"
    convert -font "$ATTRIBUTION_FONT" -pointsize 39 -fill "#111111" \
            -annotate  +15+540 "por @diegovalle" "$TMP4" "../social-${IMAGES[i]}.png"
done

for ((i=0;i< ${#IMAGES[@]}; ++i)); do
    echo "generating social card for ""${IMAGES[i]}_en"
    TMP1=$(mktemp).png
    TMP2=$(mktemp).png
    TMP3=$(mktemp).png
    TMP4=$(mktemp).png
    SLIDE=$(mktemp).png
    LOGO=$(mktemp).png
    SLIDE_WITH_LOGO=$(mktemp).png
    RESIZED=$(mktemp).png

    convert -resize "$WW"x"$HH"'^' screenshots/"${IMAGES[i]}.png" "$RESIZED"
    #inname=$(convert "$IMAGE" -format "%t" info:)
    convert "$RESIZED" -canny 0x1+10%+30% "$TMP1"
    coords=$(compare -metric rmse -subimage-search -dissimilarity-threshold 1 \
                     "$TMP1" \( -size ${WW}x${HH} xc:white \) null: 2>&1 | cut -d\  -f4)
    XOFF=$(echo "$coords" | cut -d, -f1)
    YOFF=$(echo "$coords" | cut -d, -f2)
    convert screenshots/"${IMAGES[i]}.png" -crop "${WW}x${HH}+${XOFF}+${YOFF}" \
            +repage "$TMP2"

    convert -size "$WW"x"$HH" xc:transparent -fill "$SLIDE_BGCOLOR" \
            -stroke $BORDER_COLOR -strokewidth .7 -draw "polygon  0,0 470,0 332,629 0,629" \
            -stroke $BORDER_COLOR -strokewidth .7 -fill transparent -draw "polygon  0,0 1199,0 1199,629 0,629" \
            -stroke $BORDER_COLOR -strokewidth .7  -fill white -draw "polygon  470,0 485,0 347,629 332,629" "$SLIDE"
    convert -size 200x40 -resize 200x40 -background none logos/logo.svg "$LOGO"
    composite -compose atop  -geometry +15+30 "$LOGO" "$SLIDE" "$SLIDE_WITH_LOGO"

    composite -compose atop "$SLIDE_WITH_LOGO" "$TMP2" "$TMP3"
    convert -font "$TITLE_FONT" -pointsize 60 \
            -fill black -annotate  +15+140 "${TITLES_EN[i]}" \
            "$TMP3" "$TMP4"
    convert -font "$ATTRIBUTION_FONT" -pointsize 39 -fill "#111111" \
            -annotate  +15+540 "by @diegovalle" "$TMP4" "../social-${IMAGES[i]}_en.png"
done
