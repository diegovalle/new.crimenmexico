#!/bin/bash
# Basic Latin characters, hyphen and nbsp
unicode="U+0-FF,U+202F,U+2014"
# Don't do --desubroutinize cuz otf relies on it
optimization="--verbose --no-hinting --drop-tables+=GSUB"
# woff
pyftsubset "source-sans-pro/source-sans-pro-v13-latin-regular.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff2
pyftsubset "source-sans-pro/source-sans-pro-v13-latin-regular.woff" --unicodes="$unicode" $optimization --flavor=woff2


# woff
pyftsubset "source-sans-pro/source-sans-pro-v13-latin-900.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff2
pyftsubset "source-sans-pro/source-sans-pro-v13-latin-900.woff" --unicodes="$unicode" $optimization --flavor=woff2

# woff
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-300.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff2
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-300.woff" --unicodes="$unicode" $optimization --flavor=woff2

# woff
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-700.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff2
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-700.woff" --unicodes="$unicode" $optimization --flavor=woff2

# woff
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-regular.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff2
pyftsubset "roboto-condensed/roboto-condensed-v18-latin-regular.woff" --unicodes="$unicode" $optimization --flavor=woff2


# woff
pyftsubset "ibm-plex-sans/ibm-plex-sans-v7-latin-700.woff" --unicodes="$unicode" $optimization --flavor=woff --with-zopfli

# woff
pyftsubset "ibm-plex-sans/ibm-plex-sans-v7-latin-700.woff" --unicodes="$unicode" $optimization --flavor=woff2
