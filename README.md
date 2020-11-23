# EvoWallet

 A Dash Evolution Wallet your grandma could use.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload 
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


# Setup for local development





## MN Bootstrap
for addtitional details see https://github.com/dashevo/mn-bootstrap#install

Run:

```bash
$ git clone -b master https://github.com/dashevo/mn-bootstrap.git
$ cd mn-bootstrap
$ node bin/mn setup-for-local-development # save output for later reference
$ node bin/mn start
```


Find the dpns contractId in the output and export to your environment (e.g. `.bashrc`):

```bash
export NUXT_DPNS_CONTRACT_ID="<your dpns contractId>"
```

If you encounter an error with `mn-bootstrap` try running:

```bash
$ node bin/mn reset
$ node bin/mn config:reset
```

and repeating the setup commands above.
## Console, EvoWallet, Jembe

Add the following environment variable to your `.bashrc`:

```bash
export NUXT_DAPIADDRESSES="127.0.0.1:3000"
```

### Console


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
$ node bin/mn stop
$ node bin/mn core.miner.enable true
$ node bin/mn core.miner.address <your address>
$ node bin/mn wallet:mint 1 # generate 100 blocks
$ node bin/mn start
```

In `Console` go to the `Wallet` tab, click `Backup` and `Copy` to copy the mnemonic.

Add it to your `.bashrc` to make it available to `EvoWallet` and `Jembe`.


```bash
export NUXT_MNEMONIC="<your mnemonic>"
```

*Optional:* 
Selecting the `Platform` tab click the `+` Button to create a new identity and register a username in the input field that appears below.




### EvoWallet

If the execution permission is not set, add it:

```bash
$ chmod +x scripts/source-datacontracts.sh
```

To register the contracts under `./schema`, add their `contractIds` to your environment variables and start `EvoWallet` simply run:

```bash
npm run local
```

*Clue:* 
If you make any changes to the contracts schemas just quit and re-rerun the command to run the dapp with the updated contract version.

Add the `Primitives` contract to your `.bashrc` to make it available to `Jembe`: 

```bash
export NUXT_PRIMITIVES_CONTRACT_ID=<your contractId from EvoWallet>
```

**Option 1**
Watch the debug console for the funding address and send some Dash to it using `console`.

**Option 2**
Click `login` and paste the mnemonic you copied from `console` to recover the account.



### Jembe


If the execution permission is not set, add it:

```bash
$ chmod +x scripts/source-datacontracts.sh
```

To register the contracts under `./schema`, add their `contractIds` to your environment variables and start `Jembe` simply run:

```bash
npm run local
```

*Clue:* 
If you make any changes to the contracts schemas just quit and re-rerun the command to run the dapp with the updated contract version.

Watch the debug console for the funding address and send some Dash to it using `console`.


You're setup to develop with lightning speed on your local node!