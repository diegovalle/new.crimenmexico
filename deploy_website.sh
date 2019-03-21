#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

rsync --exclude='.git/' -az --compress-level=9 --stats -e 'ssh -i /root/.ssh/crimenmexico' --delete /root/new.crimenmexico  crimenmexico@"$IPADDRESS":/home/crimenmexico

DATE=$(date +%Y-%m-%d-%H-%Z)
LATEST_RELEASE=/var/www/bcrimenmexico.diegovalle.net/$DATE
CURRENT_PATH=/var/www/elcri.men/public
CURRENT_PATH_TMP=/var/www/bcrimenmexico.diegovalle.net/$DATE.tmp
ssh -i /root/.ssh/crimenmexico crimenmexico@"$IPADDRESS" "mkdir -p $LATEST_RELEASE && cp -r /home/crimenmexico/new.crimenmexico/crimenmexico.diegovalle.net/* $LATEST_RELEASE && ln -s $LATEST_RELEASE $CURRENT_PATH_TMP && mv -T $CURRENT_PATH_TMP $CURRENT_PATH"

cd ~/new.crimenmexico/crimenmexico.diegovalle.net && netlify deploy --auth="$NETLIFYAPIKEY" --site=b399b452-d320-4949-8c4d-f32ea339db82 --dir=. --prod && cd ..
