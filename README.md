![Build Status](https://github.com/diegovalle/new.crimenmexico/actions/workflows/elcrimen.yml/badge.svg)

# new.crimenmexico

Source code for generating the website
[elcri.men](https://elcri.men)

The easiest way to recreate the website is to use the docker container

```
docker pull diegovalle/elcrimen-docker
docker run -it diegovalle/elcrimen-docker
```

change to the _/home/rstudio/new.crimenmexico_ directory and run ```git pull``` to get the latest version and run ```make```. The website will
be available in the _elcri.men/public_ subdircotry. If you don't have
the private key to deploy to [elcri.men](https://elcri.men) you should instead skip the deployment step and run the commands:

```
cd ~/new.crimenmexico
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://
git pull
make download_csv download_inegi clean_data analysis website
```
