#!/bin/bash

GIT_CMD=git

cd '/opt/server/data/moj-problem-set'

$GIT_CMD pull

rev=$?
if [ "$rev" -eq 0 ]; then
    cd ..
    node update-problemset.js >new.log
    rev=$?
fi

exit $rev
