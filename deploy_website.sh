#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

rsync --exclude='.git/' --exclude='nm*.csv.gz' -az --compress-level=9 --stats -e 'ssh -i /root/.ssh/crimenmexico' --delete /root/new.crimenmexico  crimenmexico@"$IPADDRESS":/home/crimenmexico
# copy the csv.gz files to data.diegovalle.net
rsync --omit-dir-times -az --compress-level=9 --stats -e 'ssh -i /root/.ssh/crimenmexico' /root/new.crimenmexico/crimenmexico.diegovalle.net/data/  crimenmexico@"$IPADDRESS":/var/www/data.diegovalle.net/elcrimen/


DATE=$(date +%Y-%m-%d-%H-%Z)
LATEST_RELEASE=/var/www/bcrimenmexico.diegovalle.net/$DATE
CURRENT_PATH=/var/www/elcri.men/public
CURRENT_PATH_TMP=/var/www/bcrimenmexico.diegovalle.net/$DATE.tmp
ssh -i /root/.ssh/crimenmexico crimenmexico@"$IPADDRESS" "mkdir -p $LATEST_RELEASE && cp -r /home/crimenmexico/new.crimenmexico/crimenmexico.diegovalle.net/* $LATEST_RELEASE && ln -s $LATEST_RELEASE $CURRENT_PATH_TMP && mv -T $CURRENT_PATH_TMP $CURRENT_PATH"



# remove the crime csv files since we already copied them to
# data.diegovalle.net and don't want them cluttering the netlify website
rm -f ~/new.crimenmexico/crimenmexico.diegovalle.net/data/*.csv.gz
cd ~/new.crimenmexico/crimenmexico.diegovalle.net && netlify deploy --auth="$NETLIFYAPIKEY" --site=b399b452-d320-4949-8c4d-f32ea339db82 --dir=. --prod && cd ..
