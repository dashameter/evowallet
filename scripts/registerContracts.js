const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const Dash = require('dash')
const glob = require('glob')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const envRun = process.env.NUXT_ENV_RUN

let clientOpts = {
  passFakeAssetLockProofForTests: process.env.NUXT_LOCALNODE,
  wallet: {
    // privateKey: 'currently throws a signing error'
    mnemonic: process.env.NUXT_MNEMONIC,
  },

  dapiAddresses: process.env.NUXT_DAPIADDRESSES
    ? JSON.parse(process.env.NUXT_DAPIADDRESSES)
    : undefined,
}

// Remove undefined keys from object
clientOpts = JSON.parse(JSON.stringify(clientOpts))

console.log('clientOpts :>> ', clientOpts)

let client, platform, identityId, identity

let registeredContracts = {}

try {
  registeredContracts = require(`../env/registeredContracts_${envRun}.json`)
} catch (e) {
  console.log(
    `\n./env/registeredContracts_${envRun}.json not found, will create file ..\n`
  )
}

const initWalletAndIdentity = async () => {
  if (!client) client = new Dash.Client(clientOpts)

  if (!platform) platform = client.platform

  if (!client.account) {
    const startWalletSync = Date.now()

    console.log('.. initializing wallet')

    client.account = await client.getWalletAccount()

    const walletTime = Math.floor((Date.now() - startWalletSync) / 1000)

    console.log(`.. finished wallet sync in ${walletTime}s`)

    console.log(
      '\nReceiving address for wallet:\n',
      client.account.getUnusedAddress().address,
      '\n'
    )

    const confirmedBalance = client.account.getConfirmedBalance()
    const unconfirmedBalance = client.account.getUnconfirmedBalance()

    console.log('confirmedBalance :>> ', confirmedBalance)
    console.log('unconfirmedBalance :>> ', unconfirmedBalance)
  }

  while (!identityId) {
    try {
      identityId =
        client.account.identities.getIdentityIds()[0] ||
        (await platform.identities.register()).id.toString()
    } catch (e) {
      console.log('Identity register error', e)
      console.dir(e, { depth: 100 })
      console.log('Trying again..')
      await sleep(5000)
    }
  }

  if (!identity) identity = await platform.identities.get(identityId)
}

const registerContract = async (contractDocuments) => {
  const contract = await platform.contracts.create(contractDocuments, identity)

  let result = undefined

  while (!result) {
    try {
      result = platform.contracts.broadcast(contract, identity)
    } catch (e) {
      console.log('register error', e)
      console.log('result so far', result)
      await sleep(5000)
    }
  }
  return result
}

;(async () => {
  try {
    const contractUrls = glob.sync('./schema/*CONTRACT.json')

    const contractUrlswithHash = contractUrls.map((x) => [
      x,
      crypto
        .createHash('sha256')
        .update(JSON.stringify(require(`../${x}`)))
        .digest('hex'),
    ])

    // Check if there is a new contract, otherwise skip slow wallet initialization
    for (let idx = 0; idx < contractUrlswithHash.length; idx++) {
      const hash = contractUrlswithHash[idx][1]

      if (!(hash in registeredContracts)) {
        console.log('Found new contracts to register ..')
        await initWalletAndIdentity()
        break
      }
    }

    // Register new contracts in parallel, if now new contracts exists returns old contracts
    const newRegisteredContractIdsPromises = contractUrlswithHash.map(
      ([url, hash]) => {
        if (hash in registeredContracts) {
          return registeredContracts[hash].id
        } else {
          return registerContract(require(`../${url}`))
        }
      }
    )

    const newRegisteredContractIdsResults = await Promise.all(
      newRegisteredContractIdsPromises
    )

    const newRegisteredContractIds = newRegisteredContractIdsResults.map(
      (id, idx) => {
        if (typeof id === 'string') {
          return id
        } else {
          const newId = id.dataContract.id.toString()

          const contractName = path.basename(
            contractUrlswithHash[idx][0],
            '.json'
          )

          console.log(
            'Registered new contract: ',
            `${contractName}_${envRun}`,
            newId
          )

          if (contractName === 'PRIMITIVES_CONTRACT') {
            try {
              fs.appendFileSync(
                `/home/${process.env.USER}/.evoenv`,
                `\nexport NUXT_${contractName}_ID_${envRun}=${newId}\n`
              )

              console.log(
                '-> Appended',
                `${contractName}_${envRun}`,
                'to ~/.evoenv'
              )
            } catch (e) {
              console.log(e)
              console.log(
                'Add the',
                contractName,
                'to your environment variables manually to share it with other dApps..'
              )
            }
          }

          return newId
        }
      }
    )

    const newRegisteredContracts = {}
    newRegisteredContractIds.forEach((id, idx) => {
      const [url, hash] = contractUrlswithHash[idx]
      newRegisteredContracts[hash] = { url, id }
    })

    fs.writeFileSync(
      `./env/registeredContracts_${envRun}.json`,
      JSON.stringify(newRegisteredContracts)
    )

    console.log(`\nContractIds for '${envRun}':\n`)
    let envVarString = ''
    Object.keys(newRegisteredContracts).forEach((hash) => {
      const { url, id } = newRegisteredContracts[hash]
      envVarString += `export NUXT_${path.basename(
        url,
        '.json'
      )}_ID_${envRun}=${id}\n`
      console.log(
        `export NUXT_${path.basename(url, '.json')}_ID_${envRun}=${id}`
      )
    })

    fs.writeFileSync(`./env/datacontracts_${envRun}.env`, envVarString)
  } catch (e) {
    console.log('Something went wrong')
    console.log(e)
    console.dir(e, { depth: 100 })
  } finally {
    if (client) client.disconnect()
  }
})()
