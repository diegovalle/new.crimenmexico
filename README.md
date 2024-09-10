# new.crimenmexico

![Build Status](https://github.com/diegovalle/new.crimenmexico/actions/workflows/elcrimen.yml/badge.svg)

## About

This repository contains the source code for generating the website [elcri.men](https://elcri.men), which provides data and analysis on crime in Mexico.

## Quick Start with Docker

The easiest way to recreate the website is to use the Docker container:

```bash
docker pull diegovalle/elcrimen-docker
docker run -it diegovalle/elcrimen-docker
```

## Building the Website

Once inside the Docker container:

1. Change to the project directory:
   ```bash
   cd /home/rstudio/new.crimenmexico
   ```

2. Get the latest version:
   ```bash
   git pull
   ```

3. Build the website:
   ```bash
   make
   ```

The generated website will be available in the `elcri.men/public` subdirectory.

## Building Without Deployment Access

If you don't have the private key to deploy to [elcri.men](https://elcri.men), follow these steps:

```bash
cd ~/new.crimenmexico
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://
git pull
make download_csv download_inegi clean_data analysis website
```

## Project Structure

- /elcri.men: Gatsby website for elcri.men
- /clean: Python scripts for downloading data and processing or it
- /data: Raw and processed data files
- /db: SQLite database with the processed data
- /R: R scripts for data analysis and processing

## Data Sources

[Víctimas y unidades robadas, nueva metodología](https://www.gob.mx/sesnsp/acciones-y-programas/victimas-nueva-metodologia?state=published)
[Mortalidad](https://www.inegi.org.mx/sistemas/olap/proyectos/bd/continuas/mortalidad/defuncioneshom.asp?s=est)
[ENVIPE](https://www.inegi.org.mx/programas/envipe/)


## License

MIT License

## Contact

[Contact Form](https://www.diegovalle.net/contact/)
