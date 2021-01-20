#!/usr/bin/env bash
source ~/.evoenv

unset NUXT_DAPIADDRESSES
unset NUXT_DPNS_CONTRACT_ID
unset NUXT_LOCALNODE


export NUXT_ENV_RUN="build_testnet"

node ./scripts/registerContracts.js

source ./env/datacontracts_$NUXT_ENV_RUN.env

echo
echo "ENV VARS"
echo
printenv | grep NUXT
echo

nuxt build