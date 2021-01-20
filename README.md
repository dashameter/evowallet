# EvoWallet

 A Dash Evolution Wallet your grandma could use.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload for local development
$ npm run local

# serve with hot reload for testnet development
$ npm run testnet

# build for production and launch server
$ npm run build
$ npm run start
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


# Setup for local development





## [MN Bootstrap](https://github.com/dashevo/mn-bootstrap)

This tutorial assumes you are starting with a clean `mn-bootstrap` and have no existing configurations. For advanced configuration options see: https://github.com/dashevo/mn-bootstrap#install

To reset your existing `mn-bootstrap` or if you encounter an error run:

```bash
mn reset
docker volume prune
rm -rf ~/.mn
```

### Setup

```bash
git clone -b master https://github.com/dashevo/mn-bootstrap.git
cd mn-bootstrap
npm install # optional: install CLI dependencies
sudo npm link # optional: link CLI for system-wide execution
mn setup local # save output for later reference
mn start
```


Find the dpns contractId in the output and export to `.evoenv` in your home folder (e.g. `~/.evoenv`):

```bash
export NUXT_DPNS_CONTRACT_ID="<your dpns contractId>"
```

and `source` the file by adding the following line to your `~/.bashrc`:

```bash
source ~/.evoenv
```


## Console, EvoWallet, Jembe

Add the following environment variable to your `~/.evoenv`:

```bash
export NUXT_DAPIADDRESSES='["127.0.0.1:3000"]' # or your local network ip e.g. 192.168.0.1
```

*Clue:*
To find your local network ip you can use `ifconfig`:

```bash
ifconfig <my interface> | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*'
```
Replace <my interface> with e.g. `eth0` or `wlp2s0` depending on your system configuration.



### [Console](https://github.com/dashameter/dash-platform-console)


Add the following environment variable to your `.env.local` in your `console` root project folder:

```bash
VUE_APP_DPNS_CONTRACT_ID=<your dpns id from mn-bootstrap>
```

Run:


```bash
$ npm run serve
```

Copy the receiving address and run in `mn-bootstrap`:

```bash
$ mn stop
$ mn config:set core.miner.enable true
$ mn config:set core.miner.address <your address>
$ mn wallet:mint 1 --address=<your address> # generate 100 blocks
$ mn start
```

In `Console` go to the `Wallet` tab, click `Backup` and `Copy` to copy the mnemonic.

Add it to your `~/.evoenv` to make it available to `AutoFaucet`, `EvoWallet` and `Jembe`.


```bash
export NUXT_MNEMONIC="<your mnemonic>"
```

*Optional:* 
Selecting the `Platform` tab click the `+` Button to create a new identity and register a username in the input field that appears below.


### [AutoFaucet](https://github.com/dashameter/autofaucet-express)

To start run:

```
$ node index.js
```

It uses the `mnemonic` which is funded by the miner.

`EvoWallet` and `Jembe` will automatically point to it to receive local / devnet Dash to fund identity creation.


### [EvoWallet](https://github.com/dashameter/evowallet)

To register the contracts under `./schema`, add their `contractIds` to your environment variables and start `EvoWallet` simply run:

```bash
npm run local
# or
npm run testnet
# or
npm run build
```

*Clue:* 
If you make any changes to the contracts' schemas just quit and re-rerun the command to run the dapp with the updated contract version.

The `Primitives` contract is added automatically to your `~/.evoenv` to make it available to `Jembe`: 

```bash
export NUXT_PRIMITIVES_CONTRACT_ID_local=<your contractId from EvoWallet>
```

**Option 1**
`EvoWallet` Should automatically receive Dash from the running `AutoFaucet`. Go ahead and register a new name.

**Option 2**
Watch the debug console for the funding address and send some Dash to it using `console`. Then register a new name.

**Option 3**
Click `login` and paste the mnemonic you copied from `console` to recover your previously registered name.



### [Jembe](https://github.com/dashameter/jembe)

To register the contracts under `./schema`, add their `contractIds` to your environment variables and start `Jembe` simply run:

```bash
npm run local
# or
npm run testnet
# or
npm run build
```

*Clue:* 
If you make any changes to the contracts schemas just quit and re-rerun the command to run the dapp with the updated contract version.


`Jembe` Should automatically receive Dash from the running `AutoFaucet`. Go ahead and login.

*Alternative Fact:*
Watch the debug console for the funding address and send some Dash to it using `console`.


You're setup to develop with lightning speed on your local node!