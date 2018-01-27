echo "Converting the municipio centroids to GeoJSON"
if [ -f municipios-centroids.json ]
then
    rm municipios-centroids.json
fi
#Expand the area to avoid cutting off the circles in Tijuana and Cancun
echo '0,0,"",0,0,0000,-122.296047,35.879823,0' >> municipios-centroids.csv
echo '0,0,"",0,0,0000,-85.658806,20.989817,0' >> municipios-centroids.csv
echo '0,0,"",0,0,0000,-92.208806,13.977817,0' >> municipios-centroids.csv
ogr2ogr -f "GeoJSON" municipios-centroids.json municipios-centroids.vrt
