#!/usr/bin/env bash
source ~/.bashrc

export NUXT_ENV_RUN="local"

node ./scripts/registerContracts.js

source ./env/datacontracts_$NUXT_ENV_RUN.env

echo
echo "ENV VARS"
echo
printenv | grep NUXT
echo

nuxt --port 3331