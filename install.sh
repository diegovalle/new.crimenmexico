#!/bin/bash

apt-get update; apt-get -y dist-upgrade

apt-get -y remove --purge apache*
apt-get -y remove --purge samba*
apt-get -y remove --purge sendmail*
apt-get -y remove --purge bind9*
apt-get -y remove --purge nscd*
apt-get -y remove --purge sasl*
apt-get -y remove --purge exim*
apt-get -y remove --purge ntp
apt-get clean

apt-get -y install git r-base r-base-dev libreoffice npm python python-virtualenv python-dev libcurl4-openssl-dev sqlite3 libxml2-dev  r-cran-xml libgdal1-dev libproj-dev imagemagick optipng htop

npm install -g casperjs
git clone https://github.com/diegovalle/new.crimenmexico
echo 'local({r <- getOption("repos");r["CRAN"] <- "http://cran.cnr.berkeley.edu/";options(repos = r)})' > ~/.Rprofile

virtualenv ~/.virtualenvs/victimas/
. ~/.virtualenvs/victimas/bin/activate
rm ~/.virtualenvs/victimas/lib/python2.7/lib-dynload/_hash*
pip install --upgrade pip
pip install -r requirements.txt

mkdir -p downloader/tabula-java
cd downloader/tabula-java && wget https://github.com/tabulapdf/tabula-java/releases/download/tabula-0.9.0/tabula-0.9.0-SNAPSHOT-jar-with-dependencies.jar && cd ../..
