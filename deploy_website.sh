#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

#DATE=$(date +%Y-%m-%d-%H-%Z)
#LATEST_RELEASE=/var/www/bcrimenmexico.diegovalle.net/$DATE
#CURRENT_PATH=/var/www/elcri.men/public
#CURRENT_PATH_TMP=/var/www/bcrimenmexico.diegovalle.net/$DATE.tmp
#ssh -i ~/.ssh/crimenmexico crimenmexico@"$IPADDRESS" "mkdir -p $LATEST_RELEASE && cp -r /home/crimenmexico/new.crimenmexico/crimenmexico.diegovalle.net/* $LATEST_RELEASE && ln -s $LATEST_RELEASE $CURRENT_PATH_TMP && mv -T $CURRENT_PATH_TMP $CURRENT_PATH"

(cd ~/new.crimenmexico/elcri.men/public && netlify deploy --auth="$NETLIFYAPIKEY" --site=b399b452-d320-4949-8c4d-f32ea339db82 --dir=. --prod)

# Copy the data files to a backup server
if [ "$CI" = true ] ; then
    VERSION="v1.66.0"
    rclone-"$VERSION"-linux-amd64/rclone -vv --fast-list --transfers=1 copy ~/new.crimenmexico/data/ :b2:"$B2_BUCKET" --b2-account="$B2_APPKEY_ID" --b2-key="$B2_APPKEY" --include "*.gz"
fi
