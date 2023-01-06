#!/bin/bash
id >> my.log

echo $# $0 $1 $1 $3 >> my.log

echo "/mnt/mfoj/$1.zip" "/var/uoj_data_copy/$1.zip" >> my.log
echo /mnt/mfoj/$1.zip /var/uoj_data_copy/$1.zip >> my.log
cp "/mnt/mfoj/$1.zip" "/var/uoj_data_copy/$1.zip"
cd /var/uoj_data_copy

if [ -d $1 ]
then
    rm -rf $1
fi

mkdir $1

cp "/var/uoj_data_copy/$1.zip" "./$1/$1.zip"
cd $1
unzip "$1.zip"
rm "$1.zip"

if [ -d "/var/uoj_data_copy/upload/$1" ]
then 
    rm -rf "/var/uoj_data_copy/upload/$1"
fi

cp -r "/var/uoj_data_copy/$1" "/var/uoj_data_copy/upload/$1" 

