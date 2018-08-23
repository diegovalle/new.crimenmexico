[![Build Status](https://circleci.com/gh/diegovalle/new.crimenmexico.png?style=shield&circle-token=:circle-token)](https://circleci.com/gh/diegovalle/new.crimenmexico)

# new.crimenmexico

Source code for generating the website
[elcri.men](https://elcri.men)

The easiest way to create the website is to run the docker container

```
docker pull diegovalle/elcrimen-docker
docker run -it diegovalle/elcrimen-docker
```

and change to the /root/new.crimenmexico directory, ```git pull``` to get the latest version and run make. The website will
be available in the _crimenmexico.diegovalle.net_ subdir. If you don't have 
the private key to deploy to [elcri.men](https://elcri.men) you can always run the command:

```
make download_snsp download_inegi convert_to_csv clean_data analysis website 
```

to skip the deploy step.


