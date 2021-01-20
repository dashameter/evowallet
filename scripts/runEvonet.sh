#!/usr/bin/env bash
source ~/.evoenv

unset NUXT_DAPIADDRESSES
unset NUXT_DPNS_CONTRACT_ID

export NUXT_ENV_RUN="testnet"

node ./scripts/registerContracts.js

source ./env/datacontracts_$NUXT_ENV_RUN.env

echo
echo "ENV VARS"
echo
printenv | grep NUXT
echo

nuxt --port 3340