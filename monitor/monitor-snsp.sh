#!/bin/bash
set -e # stop the script on errors
set -u # unset variables are an error
set -o pipefail # piping a failed process into a successful one is an arror
LOCKFILE=/tmp/snsp.lock
OLDFILE=snsp_old.txt
NEWFILE=snsp_new.txt

main() {
    if [ ! -f $OLDFILE ]
    then
        echo "creating $OLDFILE"
        echo "no data" > $OLDFILE
    fi

    curl -s -I http://secretariadoejecutivo.gob.mx/docs/datos_abiertos/Datos_abiertos_Incidencia_delictiva_Fuero_comun.xls | grep 'Last-Modified'  > $NEWFILE
    oldfile_md5=$(md5sum $OLDFILE | awk '{ print $1 }')
    newfile_md5=$(md5sum $NEWFILE | awk '{ print $1 }')

    if [ "$oldfile_md5" != "$newfile_md5" ]
    then
      echo "$(cat $NEWFILE) http://secretariadoejecutivo.gob.mx/index.php" | mail -s 'New SNSP data' diegovalle@gmail.com
      mv -f $NEWFILE $OLDFILE
    fi
}


(
    # Wait for lock on /tmp/foo.lock (fd 200)
    flock -n 200
    # Do stuff
    main
) 200>$LOCKFILE
