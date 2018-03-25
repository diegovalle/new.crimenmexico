[![Build Status](https://circleci.com/gh/diegovalle/new.crimenmexico.png?style=shield&circle-token=:circle-token)](https://circleci.com/gh/diegovalle/new.crimenmexico)

# new.crimenmexico

Source code for generating the website
[elcri.men](https://elcri.men)

The easiest way to create the website is to run the docker container

```
docker pull diegovalle/elcrimen-docker
docker run -it diegovalle/elcrimen-docker
```

and change to the /root/new.crimenmexico directory, ```git pull``` to get the latest version and run build.sh. The website will
be available in the _crimenmexico.diegovalle.net_ subdir. If you don't have 
the private key to deploy after building, the software will report some errors.

