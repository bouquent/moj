#!/bin/bash

GIT_CMD=git

cd '/opt/server/data/online-judge-problem-set'
pwd

$GIT_CMD config --local http.userAgent AutoTool
$GIT_CMD pull

rev=$?
if [ "$rev" -eq 0 ]
then
    cd ..
	pwd
    node update-problemset.js > new.log
	rev=$?
fi

cd '/opt/server/data/online-judge-problem-set'
$GIT_CMD config --local --unset http.userAgent
exit $rev

