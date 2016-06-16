#!/bin/bash
cd snsp-data
tail -n +2 "$1" | split -l 300000 --additional-suffix=.csv - split_
for file in split_*
do
    head -n 1 "$1" > tmp_file
    cat "$file" >> tmp_file
    mv -f tmp_file "$file"
done
cd ..
