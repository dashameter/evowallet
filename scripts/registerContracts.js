const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const Dash = require('dash')
const glob = require('glob')

let clientOpts = {
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

const client = new Dash.Client(clientOpts)

let registeredContracts = {}
try {
  registeredContracts = require('./registeredContracts.json')
} catch (e) {
  console.log('\nregisteredContract.json not found, will create file ..\n')
}

const registerContract = async (identityId, contractDocuments) => {
  const platform = client.platform
  const identity = await platform.identities.get(identityId)

  const contract = await platform.contracts.create(contractDocuments, identity)

  return platform.contracts.broadcast(contract, identity)
}

;(async () => {
  try {
    client.account = await client.getWalletAccount()

    let identityId = client.account.getIdentityIds()[0]

    if (!identityId)
      identityId = (await client.platform.identities.register()).id.toString()

    const contractUrls = glob.sync('./schema/*CONTRACT.json')

    const contractUrlswithHash = contractUrls.map((x) => [
      x,
      crypto
        .createHash('sha256')
        .update(JSON.stringify(require(`../${x}`)))
        .digest('hex'),
    ])

    const newRegisteredContractIdsPromises = contractUrlswithHash.map(
      ([url, hash]) => {
        if (hash in registeredContracts) {
          return registeredContracts[hash].id
        } else {
          return registerContract(identityId, require(`../${url}`))
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

          console.log('Registered new contract: ', contractName, newId)

          if (contractName === 'PRIMITIVES_CONTRACT') {
            try {
              fs.appendFileSync(
                `/home/${process.env.USER}/.bashrc`,
                `\nexport NUXT_${contractName}_ID=${newId}\n`
              )

              console.log('-> Appended', contractName, 'to ~/.bashrc')
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
      './scripts/registeredContracts.json',
      JSON.stringify(newRegisteredContracts)
    )

    console.log('\nEnvironment variables:\n')
    let envVarString = ''
    Object.keys(newRegisteredContracts).forEach((hash) => {
      const { url, id } = newRegisteredContracts[hash]
      envVarString += `export NUXT_${path.basename(url, '.json')}_ID=${id}\n`
      console.log(`export NUXT_${path.basename(url, '.json')}_ID=${id}`)
    })

    fs.writeFileSync('./scripts/datacontracts.env', envVarString)
  } catch (e) {
    console.log(e)
  } finally {
    client.disconnect()
  }
})()
