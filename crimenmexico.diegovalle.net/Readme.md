Website for crimenmexico.diegovalle.net
=====================================

To create the website:

* run the new.crimenmexico repo to create the json and zip files with crime info
* run infographics.py in this repo to create the html files for the website
* git deploy to live
* rsync -avz --exclude ".git/" crimenmexico.diegovalle.net/ deploy@ip:/var/www/crimenmexico.diegovalle.net

The template to build the website is not free software



License: pixelarity.com/license
