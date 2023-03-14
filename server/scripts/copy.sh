#!/bin/bash

cd /var/uoj_data
if [ -d $1 ]; then
    rm -rf $1
fi
mkdir $1

cp "/mnt/moj/$1.zip" "./$1/$1.zip"
cd $1
unzip "$1.zip"
rm "$1.zip"
