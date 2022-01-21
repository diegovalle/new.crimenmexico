#!/bin/bash

set -e # stop the script on errors
set -o pipefail # piping a failed process into a successful one is an error

# Commit generated infographics
if [[ $(git status --porcelain elcri.men/static/e*) ]]; then
    git config --global user.email "$GH_EMAIL"
    git config --global user.name "diego"
    git status --porcelain elcri.men/static/e* | sed  "s/^?? //g" | xargs --max-args 1 git add
    git commit -m "Add new png infographics [skip ci]"
    git push -q https://"$GH_PAT":x-oauth-basic@github.com/diegovalle/new.crimenmexico.git master
fi

#DATE=$(date +%Y-%m-%d-%H-%Z)
#LATEST_RELEASE=/var/www/bcrimenmexico.diegovalle.net/$DATE
#CURRENT_PATH=/var/www/elcri.men/public
#CURRENT_PATH_TMP=/var/www/bcrimenmexico.diegovalle.net/$DATE.tmp
#ssh -i ~/.ssh/crimenmexico crimenmexico@"$IPADDRESS" "mkdir -p $LATEST_RELEASE && cp -r /home/crimenmexico/new.crimenmexico/crimenmexico.diegovalle.net/* $LATEST_RELEASE && ln -s $LATEST_RELEASE $CURRENT_PATH_TMP && mv -T $CURRENT_PATH_TMP $CURRENT_PATH"

(cd ~/new.crimenmexico/elcri.men/public && netlify deploy --auth="$NETLIFYAPIKEY" --site=b399b452-d320-4949-8c4d-f32ea339db82 --dir=. --prod)

# Copy the files to a backup server
if [ "$CI" = true ] ; then
  curl --retry 15 -O https://downloads.rclone.org/v1.57.0/rclone-v1.57.0-linux-amd64.zip
  unzip rclone-v1.57.0-linux-amd64.zip
  chmod 755 rclone-v1.57.0-linux-amd64/rclone
  rclone-v1.57.0-linux-amd64/rclone -q --fast-list --transfers=1 copy ~/new.crimenmexico/data/ :b2:"$B2_BUCKET" --b2-account="$B2_APPKEY_ID" --b2-key="$B2_APPKEY" --include "*.gz"
fi
