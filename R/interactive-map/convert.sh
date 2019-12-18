echo "Converting the municipio centroids to GeoJSON"
if [ -f municipios-centroids.json ]
then
    rm municipios-centroids.json
fi
ogr2ogr -f "GeoJSON" municipios-centroids.json municipios-centroids.vrt
