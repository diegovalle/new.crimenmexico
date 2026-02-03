#!/bin/bash
set -e
set -u
set -o pipefail

FILENAME="INEGI_exporta.csv"

# https://www.inegi.org.mx/sistemas/olap/proyectos/bd/continuas/mortalidad/defuncioneshom.asp?s=est
# Seleccione las Variables 1) Entidad y municipio de registro 2) Mes de registro
#
# |     |        |  Total   |  Enero | Febrero | Marzo
# | Año | Estado |          |        |         |
curl 'https://www.inegi.org.mx/sistemas/olap/exporta/exporta.aspx' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -b 'ASPSESSIONIDCCCDRDCT=GPCKFNLCLKIDGKPHPKJOOEOF; BIGipServerLB_sistemas_2=795136522.40735.0000; BIGipServerLB_NuevoPortal=1208129802.20480.0000' \
  -H 'Origin: https://www.inegi.org.mx' \
  -H 'Pragma: no-cache' \
  -H 'Referer: https://www.inegi.org.mx/sistemas/olap/consulta/general_ver4/MDXQueryDatos.asp?' \
  -H 'Sec-Fetch-Dest: document' \
  -H 'Sec-Fetch-Mode: navigate' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-Fetch-User: ?1' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' \
  --data-raw 'nomdimfila=A%F1o+de+registro%7CEnt+y+mun+de+registro&to_display=&cube=Mortalidad+por+homicidios&cubeName=Mortalidad+por+homicidios&nomdimColumna=Mes+de+registro&Lc_tituloFiltro=Consulta+de%3A+Defunciones+por+homicidio+%A0+Por%3A+A%F1o+de+registro+y+Ent+y+mun+de+registro+%A0+Seg%FAn%3A+Mes+de+registro&Lc_encabeza=%5C%5CTotal%5CEnero%5CFebrero%5CMarzo%5CAbril%5CMayo%5CJunio%5CJulio%5CAgosto%5CSeptiembre%5COctubre%5CNoviembre%5CDiciembre%5C&Lc_unidadmedida=&Lc_sql=select+NON+EMPTY+ToggleDrillState%28%7B%5BMes+de+registro%5D.%5BMes+de+registro%5D.%5BTotal%5D%7D%2C%7B%5BMes+de+registro%5D.%5BMes+de+registro%5D.%5BTotal%5D%7D%29+on+columns%2C+NON+EMPTY+ToggleDrillState%28crossjoin%28%7B%5BA%F1o+de+registro%5D.levels%280%29.allmembers%7D%2C+%7B%5BEnt+y+mun+de+registro%5D.%5BEnt+y+mun+de+registro%5D.%5BTotal%5D%7D%29%2C%7B%5BEnt+y+mun+de+registro%5D.%5BEnt+y+mun+de+registro%5D.%5BTotal%5D%7D%29+on+rows+from+%5BMortalidad+por+homicidios%5D+where+%28%5BMeasures%5D.%5BDefunciones+por+homicidio%5D%29&Lc_conexion=provider%3DMSOLAP.8%3BMDX+Compatibility%3D2%3Bdata+source%3DW-OLAPCLPRO22%3BConnect+timeout%3D120%3BInitial+catalog%3DMORTALIDAD_GENERAL&Lc_titulo=Defunciones+por+homicidios%7C&Lc_piepagina=FUENTE%3A+INEGI.+Estad%EDsticas+de+mortalidad.&Lc_salida=0&Lc_StrConexion=1&Lc_formato=Texto+separado+por+comas%28.csv%29&Lc_sql_allmembers=select+NON+EMPTY+ToggleDrillState%28%7B%5BMes+de+registro%5D.%5BMes+de+registro%5D.%5BTotal%5D%7D%2C%7B%5BMes+de+registro%5D.%5BMes+de+registro%5D.%5BTotal%5D%7D%29+on+columns%2C+NON+EMPTY+ToggleDrillState%28crossjoin%28%7B%5BA%F1o+de+registro%5D.levels%280%29.allmembers%7D%2C+%7B%5BEnt+y+mun+de+registro%5D.%5BEnt+y+mun+de+registro%5D.%5BTotal%5D%7D%29%2C%7B%5BEnt+y+mun+de+registro%5D.%5BEnt+y+mun+de+registro%5D.%5BTotal%5D%7D%29+on+rows+from+%5BMortalidad+por+homicidios%5D+where+%28%5BMeasures%5D.%5BDefunciones+por+homicidio%5D%29&Lc_ValidaDimGeo=0&completo=completo&Cant_Col=13&Cant_Fil=1155' --compressed >"$FILENAME"

PATTERN="FUENTE: INEGI. "
if ! grep -q "$PATTERN" "$FILENAME"; then
    echo "Error: Pattern not found in INEGI homicide csv file." >&2
    exit 1
fi
