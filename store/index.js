import Dash from 'dash'
import Vue from 'vue'
import { Unit } from '@dashevo/dashcore-lib'
import { encrypt, decrypt } from 'dashmachine-crypto'
// Zeppole cotton cake peanut home marriage glance fiber faculty tone void clap crack
// EvoManiac2 identity B5oV5iB1eP9AJwBHEaK4bgSBtUM83pMsf7a9uyGCiAc7

// mnemonic guess nothing mean alarm mention usual milk elbow turn history great gown

// EvoManiac3 issue swear smooth sheriff reveal myth tuna pyramid boost unaware album wing

// nice video reunion royal insane end hope wish start excite creek attract
// Decrypted mnemonic: potato south distance mind dress join vital topic oyster work catch animal
// beach all salute mouse gasp fortune valley office sweet palace traffic curious
// const DashmachineCrypto = require('dashmachine-crypto')
const CryptoJS = require('crypto-js')

const IdentitiesCache = {}
const cachedOrGetIdentity = async (client, identityId) => {
  console.log(
    'Checking IdentitiesCache for known identities using IdentityId',
    identityId
  )
  let identity
  if (identityId in IdentitiesCache) {
    identity = IdentitiesCache[identityId]
    console.log('Found existing cached identity', identity)
  } else {
    identity = await client.platform.identities.get(identityId)
    IdentitiesCache[identity.id] = identity
    console.log('Fetched unknown identity', identity)
  }
  console.log({ IdentitiesCache })
  return identity
}
// eslint-disable-next-line no-unused-vars

// TODO remove dependence on global var 'client'
// eslint-disable-next-line no-unused-vars
async function deriveDip9DelegatedCredentialsFromTimestamp(timestamp) {
  console.log('deriveDip9DelegatedCredentialsFromTimestamp()')
  const curIdentityHDKey = client.account.keyChain.HDPrivateKey
  console.log({ curIdentityHDKey })
  const specialFeatureKey = curIdentityHDKey.derive(
    `m/9'/1'/4'/1'/${timestamp}` // TODO production LIVENET switch to 9/5
  )
  console.log({ specialFeatureKey })

  const privateKey = specialFeatureKey.privateKey.toString()
  const publicKey = specialFeatureKey.publicKey.toString()
  // const address = derivedByArgument.privateKey.toAddress()

  console.log({
    privateKey,
    publicKey,
  })

  return { privateKey, publicKey }
}

async function deriveDip9KeyPair(x) {
  console.log('deriveDip9DelegatedCredentialsFromTimestamp()')
  const curIdentityHDKey = client.account.keyChain.HDPrivateKey
  console.log({ curIdentityHDKey })
  const specialFeatureKey = curIdentityHDKey.derive(
    `m/9'/1'/4'/1'/${x}` // TODO production LIVENET switch to 9/5
  )
  console.log({ specialFeatureKey })

  const privateKey = specialFeatureKey.privateKey.toString()
  const publicKey = specialFeatureKey.publicKey.toBuffer().toString('base64')
  // const address = derivedByArgument.privateKey.toAddress()

  console.log({
    privateKey,
    publicKey,
  })

  return { privateKey, publicKey }
}

// const crypto = require('crypto');
function randrange(min, max) {
  var range = max - min
  if (range <= 0) {
    throw new Error('max must be larger than min')
  }
  var requestBytes = Math.ceil(Math.log2(range) / 8)
  if (!requestBytes) {
    // No randomness required
    return min
  }
  var maxNum = Math.pow(256, requestBytes)
  var ar = new Uint8Array(requestBytes)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    window.crypto.getRandomValues(ar)

    var val = 0
    for (var i = 0; i < requestBytes; i++) {
      val = (val << 8) + ar[i]
    }

    if (val < maxNum - (maxNum % range)) {
      return min + (val % range)
    }
  }
}
// const hash = crypto.createHash('sha256').update('hello1').digest('hex');
// const hash2 = crypto.createHash('sha256').update(hash).digest('hex');
// console.log(hash);
// console.log(hash2);

let client
let clientTimeout
let registerIdentityInterval
let registerNameInterval
let registerUserInterval
let loginPinInterval

const getInitState = () => {
  console.log('getinitstate')
  return {
    fundingAddress: '',
    balance: 0,
    balanceInDash: 0,
    accounts: [],
    isClientError: false,
    isSyncing: false,
    // mnemonic: null, // "drastic raise hurry step always person bundle end humble toss estate inner",
    // mnemonic:
    // 'olympic dance spider bid soap butter cradle penalty waste sand situate vessel',
    mnemonic: null,
    identityId: null,
    loginPin: '',
    loginPinTimeLeft: 0,
    curActionRequest: {},
    lastRequests: {},
    name: {
      label: null,
      isRegistered: false,
      isValid: false,
      docId: null,
    },
    snackbar: {},
    signups: [],
  }
}
export const state = () => getInitState()

export const getters = {
  lastRequest: (state) => ({ contractId, type }) => {
    const { lastRequests } = state
    const request = lastRequests[contractId]
      ? lastRequests[contractId][type]
      : null
    return request
  },
  curActionRequest(state) {
    return state.curActionRequest
  },
  curAccountDocId(state) {
    return state.name.docId
  },
  signups(state) {
    const { signups } = state
    console.log('signups getter', signups)
    return signups
  },
  accounts(state) {
    const { accounts } = state
    return accounts
  },
  async confirmedBalance() {
    // TODO weird thing: this function fires before await initWallet() resolves
    // console.log("get balance not ready Confirmed Balance", client.account.getConfirmedBalance());
    // console.log("get balance not ready Unconfirmed Balance", client.account.getUnconfirmedBalance());

    // FIXME When client is set to undefined, this getter is still called and throws
    try {
      const { account } = client
      console.log(
        'get balance Confirmed Balance',
        await account.getConfirmedBalance()
      )
      console.log(
        'get balance Unconfirmed Balance',
        account.getUnconfirmedBalance()
      )
      return account.getConfirmedBalance()
    } catch (e) {
      console.log('Error getting balance, client is: ', client)
      return -1
    }
  },
  setupFinished(state) {
    console.log(state)
    return state.mnemonic && state.identityId
  },
}
export const mutations = {
  setFundingAddress(state, address) {
    console.log('setting funding address', address)
    state.fundingAddress = address
  },
  setCurActionRequest(state, actionRequest) {
    console.log('mutation', actionRequest)
    // state.curActionRequest = actionRequest
    Vue.set(state, 'curActionRequest', actionRequest)
  },
  setCurActionRequestLoading(state, isLoading) {
    // state.curActionRequest.loading = isLoading
    Vue.set(state.curActionRequest, 'loading', isLoading)
  },
  resetCurActionRequest(state) {
    // TODO make overlint dynamic with polling dapps
    state.curActionRequest = {
      overline: 'Jembe',
      headline: 'Waiting for action..',
      payload: 'Submit a jam with your user / pin and it will appear here.',
      actionRequired: false,
      loading: false,
    }
  },
  setSignupContracts(state, signupContracts) {
    state.signupContracts = signupContracts
  },
  setSignups(state, signups) {
    state.signups = signups
  },
  resetState() {
    console.log('resetstate')
    this.replaceState(getInitState())
  },
  setWalletBalance(state, balance) {
    state.balance = balance
    state.balanceInDash = Unit.fromSatoshis(balance).toBTC()
  },
  setState(state, newState) {
    console.log('setstate')
    this.replaceState(newState)
  },
  addAccount(state, account) {
    state.accounts.push(account)
  },
  removeAccount(state, index) {
    state.accounts.splice(index, 1)
  },
  clearClientErrors(state) {
    state.clientErrorMsg = ''
    state.isClientError = false
    state.isSyncing = false
  },
  setClientErrors(state, msg) {
    state.clientErrorMsg = msg
    state.isClientError = true
    state.isSyncing = false
  },
  setSyncing(state, isSyncing) {
    state.isSyncing = isSyncing
  },
  setLoginPin(state) {
    const randomNum = randrange(0, 999999)
    state.loginPin = ('000000' + randomNum).slice(-6)
    // const randomNum = new Uint8Array(6)
    // const bytes = window.crypto.getRandomValues(randomNum)
    // state.loginPin = bytes.reduce((accu, byte) => {
    //   return accu + (byte % 10)
    // }, '')
  },
  setLoginPinTimeLeft(state, ms) {
    state.loginPinTimeLeft = ms
  },
  setLastRequest(state, request) {
    console.log({ request })
    if (!state.lastRequests[request.contractId]) {
      state.lastRequests[request.contractId] = {}
    }
    state.lastRequests[request.contractId][request.$type] = request
  },
  setSnackBar(state, snackbar) {
    state.snackbar = snackbar
  },
  setMnemonicAsIs(state, mnemonic) {
    state.mnemonic = mnemonic
  },
  setIdentity(state, identityId) {
    state.identityId = identityId
  },
  setName(state, name) {
    state.name.label = name
    state.name.isRegistered = false
  },
  setNameRegistered(state, isRegistered) {
    state.name.isRegistered = isRegistered
  },
  setNameValid(state, isValid) {
    state.name.isValid = isValid
  },

  setNameDocId(state, docId) {
    state.name.docId = docId
  },
}
export const actions = {
  async fetchPaymentRequests({ dispatch, state }) {
    // TODO cache & paginate using timestamp

    const queryOpts = {
      limit: 100,
      startAt: 1,
      orderBy: [['timestamp', 'desc']],
      where: [['requesteeUserId', '==', state.name.docId.toString()]],
    }

    const paymentRequests = await dispatch('queryDocuments', {
      dappName: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      queryOpts,
    })
    console.log('paymentRequests :>> ', paymentRequests)

    // No transactions, return early
    if (!paymentRequests) return []

    // TODO dedupe by refId

    const collatedRequests = {}
    for (const item of paymentRequests) {
      const doc = item.toJSON()
      const { refId } = doc

      console.log(doc.memo, doc.encFiatAmount, doc.refId)

      collatedRequests[refId] = collatedRequests[refId]
        ? [...collatedRequests[refId], doc]
        : [doc]
    }
    console.log(collatedRequests)

    const sortedRequests = []
    for (const refId in collatedRequests) {
      const docs = collatedRequests[refId]
      const lastTimestamp = docs[0].timestamp
      // const firstTimestamp = docs[docs.length - 1].timestamp

      sortedRequests.push({
        // firstTimestamp,
        lastTimestamp,
        countDocs: docs.length,
        docs,
      })
    }

    sortedRequests.sort(function (a, b) {
      return b.lastTimestamp - a.lastTimestamp
    })

    console.dir(sortedRequests)
    sortedRequests.forEach((doc) => console.log(doc))

    // Add transaction and status info
    const paymentRequestsWithUTXOs = await Promise.all(
      sortedRequests.map(async (pr) => {
        const utxos = await dispatch('getUTXO', pr.docs[0].encAddress)
        const summary = await dispatch(
          'getAddressSummary',
          pr.docs[0].encAddress
        )

        // console.log('Getting UTXO for :>> ', pr.encAddress, utxos)

        // Add the payment request status
        let status

        const requestedSatoshis = parseInt(pr.docs[0].encSatoshis)

        if (requestedSatoshis === 0 && summary.totalTxAppearances === 0) {
          status = 'Cancelled'
        } else if (
          requestedSatoshis === 0 &&
          summary.totalBalanceSat === 0 &&
          summary.totalTxAppearances > 1
        ) {
          status = 'Refunded'
        } else if (
          summary.totalBalanceSat === 0 &&
          summary.txAppearances === 0
        ) {
          status = 'Pending'
        }
        // TODO once deductFee is fixed, should be 0
        else if (Math.abs(requestedSatoshis - summary.totalBalanceSat) < 1000) {
          status = 'Paid'
          // if (summary.txAppearances > 1) status = 'Amended'
        } else if (summary.totalBalanceSat > requestedSatoshis) {
          status = 'Overpaid'
        } else if (summary.totalBalanceSat < requestedSatoshis) {
          status = 'Underpaid'
        }

        return {
          ...pr,
          summary,
          utxos,
          status,
        }
      })
    )
    console.log('paymentRequestsWithUTXOs :>> ', paymentRequestsWithUTXOs)
    return paymentRequestsWithUTXOs
  },
  // eslint-disable-next-line
  async getUTXO({ state }, address) {
    const DAPIclient = client.getDAPIClient()
    const UTXO = await DAPIclient.core.getUTXO(address)
    return UTXO
  },
  // eslint-disable-next-line
  async getAddressSummary({ state }, address) {
    const DAPIclient = client.getDAPIClient()
    const summary = await DAPIclient.core.getAddressSummary(address)
    summary.totalBalanceSat = summary.balanceSat + summary.unconfirmedBalanceSat
    summary.totalTxAppearances =
      summary.txAppearances + summary.unconfirmedAppearances
    return summary
  },
  async freshAddress() {
    const account = await client.wallet.getAccount()
    const address = account.getUnusedAddress().address
    return address
  },
  async fetchPaymentRequestss({ dispatch }) {
    // TODO cache & paginate using timestamp
    const queryOpts = {
      limit: 10,
      startAt: 1,
      orderBy: [['timestamp', 'desc']],
    }
    const transactions = await dispatch('queryDocuments', {
      contract: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      queryOpts,
    })
    console.log('transactions :>> ', transactions)

    return transactions
  },
  // eslint-disable-next-line no-empty-pattern
  async encryptDelegatedPrivKey({}, { delCredPrivKey, identityId }) {
    console.log('{ delCredPrivKey, identityId } :>> ', {
      delCredPrivKey,
      identityId,
    })
    const account = await client.wallet.getAccount()
    const senderPrivKey = account
      .getIdentityHDKeyByIndex(0, 0)
      .privateKey.toString()

    const receiverIdentity = await cachedOrGetIdentity(client, identityId)
    const receiverPubKey = receiverIdentity.publicKeys[0].data
    console.log(
      'senderPrivKey, receiverIdentity, receiverPubKey, msg :>> ',
      senderPrivKey,
      receiverIdentity,
      receiverPubKey,
      delCredPrivKey
    )

    const encrypted = encrypt(senderPrivKey, delCredPrivKey, receiverPubKey)
      .data
    console.log('encrypted :>> ', encrypted)
    return encrypted
  },
  // eslint-disable-next-line no-empty-pattern
  async decryptRequestPin({}, { encRequestPin, identityId }) {
    const account = await client.wallet.getAccount()
    const myPrivKey = account
      .getIdentityHDKeyByIndex(0, 0)
      .privateKey.toString()

    const otherIdentity = await cachedOrGetIdentity(client, identityId)
    const otherPubKey = otherIdentity.publicKeys[0].data

    return decrypt(myPrivKey, encRequestPin, otherPubKey)
  },
  clientIsReady() {
    return !!client
  },
  async getCurPubKey() {
    const { account } = client
    const curIdentityHDKey = account.keyChain.HDPrivateKey

    console.log({ publicKeyString: curIdentityHDKey.publicKey.toString() })

    const publicKey = curIdentityHDKey.publicKey.toString()
    return publicKey
  },
  mnemonicPlaintext() {
    if (client && client.wallet) {
      return client.wallet.mnemonic
    } else {
      return ''
    }
  },
  // eslint-disable-next-line no-unused-vars
  encryptMnemonic({ state }, { mnemonic, pin }) {
    console.log('encrypting mnemonic', mnemonic)
    if (mnemonic === null) {
      return null // We need to explicitly return `null` to initialize a new mnemonic
    }
    if (mnemonic === undefined) {
      return undefined // We need to explicitly return `undefined` to initialize without a wallet
    } else {
      return CryptoJS.AES.encrypt(mnemonic, pin).toString()
    }
  },
  // eslint-disable-next-line no-unused-vars
  decryptMnemonic({ dispatch }, { encMnemonic, pin }) {
    console.log('decrypting mnemonic', encMnemonic)
    switch (encMnemonic) {
      case null:
        return null // We need to explicitly return `null` to initialize a new mnemonic
      case undefined:
        return undefined // We need to explicitly return `null` to initialize a new mnemonic
      default:
        try {
          return CryptoJS.AES.decrypt(encMnemonic, pin).toString(
            CryptoJS.enc.Utf8
          )
        } catch (e) {
          console.error(e)
          // dispatch('showSnackbar', {
          //   text: 'Wrong PIN / Password',
          // })
          throw 'You entered the wrong PIN / Password'
        }
    }
  },
  async setAndEncMnemonic({ state, dispatch, commit }, { mnemonic, pin }) {
    console.log('setMnemonic', { mnemonic, pin })
    const encMnemonic = await dispatch('encryptMnemonic', { mnemonic, pin })
    commit('setMnemonicAsIs', encMnemonic)
    console.log('state.mnemonic after set', { afterSet: state.mnemonic })
  },
  // eslint-disable-next-line no-unused-vars
  async sendDash({ dispatch }, { toAddress, satoshis }) {
    const account = await client.wallet.getAccount()
    try {
      console.log('toAddress :>> ', toAddress)
      console.log('satoshis :>> ', satoshis)
      console.log('typeof satoshis :>> ', typeof satoshis)
      console.log('balance', account.getTotalBalance())
      const transaction = account.createTransaction({
        recipient: toAddress,
        satoshis: satoshis,
        deductFee: false,
      })
      console.log('transaction :>> ', transaction)
      // transaction.addData('ybseBqQLqLvpaWik8bPnbN4Dd47bHSuzGS')
      // const signedTransaction = account.sign(transaction)
      const result = await account.broadcastTransaction(transaction)
      console.log('Transaction broadcast!\nTransaction ID:', result)
      dispatch('showSnackbar', {
        text: 'Payment sent\n' + result,
        color: 'green',
      })
      // dispatch('refreshWallet')
    } catch (e) {
      dispatch('showSnackbar', {
        text: e.message,
      })
      throw e
    }
  },
  async fetchTransactions({ state, dispatch }) {
    // TODO cache & paginate using timestamp
    const queryOpts = {
      limit: 10,
      startAt: 1,
      orderBy: [['timestamp', 'desc']],
      where: [['requesteeUserId', '==', state.name.docId.toString()]],
    }
    const transactions = await dispatch('queryDocuments', {
      dappName: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      queryOpts,
    })
    console.log('transactions :>> ', transactions)
    const DAPIclient = client.getDAPIClient()
    const transactionsWithUTXOs = await Promise.all(
      transactions.map(async (tx) => {
        const utxos = await DAPIclient.core.getUTXO(tx.data.encAddress)
        return { ...tx, utxos }
      })
    )
    return transactionsWithUTXOs
  },
  async fetchSignups({ dispatch, commit, getters }) {
    console.log('fetchSignups()')
    const queryOpts = {
      startAt: 1,
      limit: 5, // TODO fix select DISTINCT problem and paginate dApps
      orderBy: [['$createdAt', 'desc']],
      where: [['accountDocId', '==', getters['curAccountDocId']]],
    }
    const dappName = 'primitives'
    const typeLocator = 'Signup'

    const signups = await dispatch('queryDocuments', {
      dappName,
      typeLocator,
      queryOpts,
    })
    const signupsJSON = signups.map((signup) => {
      return signup.toJSON()
    })
    console.log({ signupsJSON })
    commit('setSignups', signupsJSON)
  },
  async fetchSignupContracts({ commit, getters }) {
    console.log('fetchSignupContracts()')

    const signups = getters['signups']

    const promises = signups.map(async (signup) => {
      const contract = await client.platform.contracts.get(signup.contractId)
      console.log({ contract })
      return contract
    })
    const signupContracts = await Promise.all(promises)
    console.log({ signupContracts })

    commit('setSignupContracts', signupContracts)

    // const queryOpts = {
    //   startAt: 1,
    //   limit: 5, // TODO fix select DISTINCT problem and paginate dApps
    //   orderBy: [['unixTimestamp', 'desc']]
    //   // TODO query for accountUserId
    // }
    // const dappName = 'primitives'
    // const typeLocator = 'Signup'

    // const signups = await dispatch('queryDocuments', {
    //   dappName,
    //   typeLocator,
    //   queryOpts
    // })
    // const signupsJSON = signups.map((signup) => {
    //   return signup.toJSON()
    // })
    // console.log({ signupsJSON })
    // commit('setSignupContracts', signupsJSON)
  },
  async initOrCreateAccount({ commit, dispatch, state }, { mnemonicPin }) {
    // Get client to isReady state (with existing mnemonic or creating a new one)
    // Check if we have a balance, if not, get a drip
    // If Getting a drip, wait via setInterval for balance
    // +if error or timeout, instruct for manual balance increase // TODO implement wait for balance timeout
    // Once we have a balance:
    // (check if we have an identity, if not)
    // create identity, commit identity
    // create name, set isRegistered = true // TODO implement recover identity and name from dpp
    // catch errors at each step and self heal // TODO tests
    try {
      console.log('initorcreate, dispatch init')
      await dispatch('initWallet', { mnemonicPin })
    } catch (e) {
      console.dir({ e }, { depth: 5 })
      let message = e.message

      // FIXME decryptMnemonic clearly needs better error handling
      if (message === 'Expect mnemonic to be provided') {
        message = 'You entered the wrong PIN / Password.'
      }
      commit('setClientErrors', 'Connecting to Evonet: ' + message)
    }
    console.log("I'm done awaiting client.isReady()....")

    const balance = client.account.getTotalBalance()
    console.log('Total Balance: ' + balance)
    if (balance > 500000) {
      if (state.identityId === null) {
        try {
          this.registerIdentity()
        } catch (e) {
          console.log('No success in registering an identity, trying again ...')
          dispatch('showSnackbar', {
            text: e.message,
          })
          this.registerIdentity()
        }
      } else {
        console.log('Found existing identityId')
        console.log(state.identityId)
      }
    } else {
      try {
        // TODO reenable faucet
        await dispatch('getMagicInternetMoney')

        // await this.getMagicInternetMoney( // get two drips -> two UTXOs, register idenity and name without waiting for chained confirmations
        // console.log('not getting a drip, faucet is broken')
      } catch (e) {
        commit(
          'setClientErrors',
          e.message +
            ' | Faucet not responding, manually send some evoDash to ' +
            (await dispatch('freshAddress'))
        )
      }

      // TODO need to check if identity belongs to mnemonic
      if (state.identityId === null) {
        dispatch('registerIdentityOnceBalance')
      } else {
        console.log('Found existing identityId')
        console.log(state.identityId)
      }
    }
  },
  resetStateKeepAccounts({ state, commit }) {
    console.log({ state })
    console.log(state.accounts)
    const { accounts } = state
    console.log({ accounts })
    const initState = getInitState()
    console.log({ initState })
    initState.accounts = accounts
    console.log({ initState })
    commit('setState', initState)
    console.log({ state })
  },
  clearSession({ dispatch }) {
    // TODO refactor intervalls in an object and iterate them in clearAllIntervals()
    // TODO wrap setInterval and setTimout in setIntervalIfLoggedIn to clear itself if global stat login var is false
    clearInterval(loginPinInterval)
    clearInterval(registerIdentityInterval)
    clearInterval(registerNameInterval)
    clearInterval(registerUserInterval)
    clearTimeout(clientTimeout)

    if (client) client.disconnect()
    dispatch('resetStateKeepAccounts')
    client = undefined // DANGER Uh oh, we're setting global vars
  },
  async addCurrentAccount({ state, commit, dispatch }, pin) {
    const account = {}
    console.log('add current account', await client.wallet.exportWallet())
    account.mnemonic = await dispatch('encryptMnemonic', {
      mnemonic: await client.wallet.exportWallet(),
      pin,
    })
    // account.mnemonic = this.encryptMnemonic(client.wallet.mnemonic, pin)
    account.identityId = state.identityId
    account.docId = state.name.docId
    account.label = state.name.label

    commit('addAccount', account)
  },
  // async verifyAppRequest({ state }, actionRequest) {
  //   // TODO remove async
  //   const { loginPin } = state
  //   console.log(loginPin)
  //   const dappUserIdentity = await client.platform.identities.get(
  //     '9jm6AbrR5wQTYp3SWfDJAmX7ca3VkwTvFXmUp8hXWjUe'
  //   )
  //   console.log(dappUserIdentity)
  //   const dappUserPublicKey = dappUserIdentity.publicKeys[0].data.toString(
  //     'base64'
  //   )
  //   // foundUser.publicKey = foundUser.identity.publicKeys[0].data;

  //   const curIdentityPrivKey = client.account.getIdentityHDKey(0, 'user')
  //     .privateKey

  //   // const plainUID_PIN = loginPin.toString()
  //   const plainUID_PIN = '54321' // TODO make dynamic

  //   const hashedAndEncryptedUID_PIN = actionRequest.uidPin

  //   const decryptedUID_PIN = DashmachineCrypto.decrypt(
  //     curIdentityPrivKey,
  //     hashedAndEncryptedUID_PIN,
  //     dappUserPublicKey
  //   ).data
  //   const verified = DashmachineCrypto.verify(plainUID_PIN, decryptedUID_PIN)
  //   console.log({ actionRequest }, 'pin verified?', verified)

  //   return verified
  // },
  // TODOO add targetcontractid to contract
  async processActionRequestPayload(
    { state, getters, dispatch },
    { actionRequest }
  ) {
    console.log({ actionRequest })
    const { payload, $ownerId } = actionRequest.doc
    console.log({ payload, $ownerId })
    const userIdentity = await client.platform.identities.get(state.identityId)

    // TODO use  from helper

    const timestampMS = Date.now()
    const timestamp = Math.floor(timestampMS / 1000)

    const primitiveType = Object.keys(payload)[0]
    console.log({ primitiveType })
    const documents = []
    let fragment = {}

    // eslint-disable-next-line no-unused-vars
    let addDelegatedCredentials = false
    if (primitiveType != 'DelegatedCredentials') {
      // TODO DelegatedCredentials should be its own request type, not DocumentActionRequest

      Object.assign(fragment, payload[primitiveType])
      fragment.$createdAt = timestamp
      fragment.accountDocId = getters['curAccountDocId'] // TODO V2 should be userId
      fragment.contractId = actionRequest.doc.$dataContractId
      // dappName TODO currently insecure duplication by dApp Browser
      // dappIcon

      // Create document from fragment and add to batch broadcast array
      const document = await client.platform.documents.create(
        `primitives.${primitiveType}`, // TODO make contractId + typeselector dynamic
        userIdentity,
        fragment // TODO make dynamic
      )
      console.log({ document })
      console.log({ documents })
      documents.push(document)
      console.log({ document })
      console.log({ documents })

      // If user signs up, also log him in
      if (primitiveType === 'Signup' && document.data.isRegistered === true) {
        addDelegatedCredentials = true
      }
    }

    // TODO DelegatedCredentials should be its own request type, not DocumentActionRequest
    if (primitiveType === 'DelegatedCredentials' || addDelegatedCredentials) {
      // Delegated Credentials that are valid for authenticated session length
      const {
        privateKey,
        publicKey,
      } = await deriveDip9DelegatedCredentialsFromTimestamp(timestamp)

      console.log(actionRequest.doc)

      const delegateIdentityId = actionRequest.doc.$ownerId

      fragment = {
        encPvtKey: await dispatch('encryptDelegatedPrivKey', {
          delCredPrivKey: privateKey,
          identityId: delegateIdentityId,
        }),
        pubKey: publicKey,
        delegateIdentityId, // Using the idenity of the doc that was verified against pin
        expiresAt: timestampMS + 1200000, // TODO change 20min (1200s) timeout to variable
        //  timestamp = Math.floor(Date.now() / 1000) // For next contract iteration
      }

      // Decrypt key (e.g. for direct messages), valid across sessions until disabled
      // FIXME this key should be registered in the identity
      const decryptKeyPair = await deriveDip9KeyPair(0)

      console.log('{ privateKey, publicKey } :>> ', { privateKey, publicKey })

      fragment.decryptPubKey = decryptKeyPair.publicKey

      fragment.encDecryptPrivKey = await dispatch('encryptDelegatedPrivKey', {
        delCredPrivKey: decryptKeyPair.privateKey,
        identityId: delegateIdentityId,
      })

      // Create document from fragment and add to batch broadcast array
      const document = await client.platform.documents.create(
        `primitives.DelegatedCredentials`, // TODO make contractId + typeselector dynamic
        userIdentity,
        fragment // TODO make dynamic
      )
      documents.push(document)
    }

    console.log('Broadcasting DocumentActionRequest payload documents:')
    console.dir({ documents })
    const documentBatch = {
      create: documents,
      replace: [],
      delete: [],
    }
    const submitStatus = await client.platform.documents.broadcast(
      documentBatch,
      userIdentity
    )
    console.log({ submitStatus })
  },
  // async encryptStuff({ state }, appDoc) {
  //   const { loginPin } = state
  //   const curIdentityPrivKey = client.account.getIdentityHDKey(0, 'user')
  //     .privateKey
  //   console.log('curIdentityPrivKey', curIdentityPrivKey.toString())

  //   const senderPublicKey = 'Ag/YNnbAfG0IpNeH4pfMzgqIsgooR36s5MzzYJV76TpO' // TODO derive from dash identity

  //   //reference: Vendor userID (Reference)
  //   // //CW decrypts the nonce
  //   const encryptedNonce = appDoc.data.nonce
  //   console.log('encryptedNonce', encryptedNonce)
  //   const decryptedNonce = DashmachineCrypto.decrypt(
  //     curIdentityPrivKey,
  //     encryptedNonce,
  //     senderPublicKey
  //   ).data
  //   console.log('decrypted nonce:', decryptedNonce)
  //   //vid_pin: Encrypted Hash of [Vendor nonce + Vendor userID + CW Pin)
  //   const plainVID_PIN = decryptedNonce.concat(
  //     state.wdsVendorId,
  //     loginPin.toString()
  //   )
  //   console.log('plainVID_PIN', plainVID_PIN)
  //   //hash then encrypt for the vendors PK
  //   const hashedVID_PIN = DashmachineCrypto.hash(plainVID_PIN).data
  //   console.log('hashedVID_PIN', hashedVID_PIN)
  //   const encryptedVID_PIN = DashmachineCrypto.encrypt(
  //     curIdentityPrivKey,
  //     hashedVID_PIN,
  //     senderPublicKey
  //   ).data
  //   console.log('encryptedVID_PIN', encryptedVID_PIN)

  //   //status: Encrypted [status+entropy] (0 = valid)
  //   const statusCode = 0
  //   const status = statusCode
  //     .toString()
  //     .concat(DashmachineCrypto.generateEntropy())
  //   console.log('status', status)
  //   const encryptedStatus = DashmachineCrypto.encrypt(
  //     curIdentityPrivKey,
  //     status,
  //     senderPublicKey
  //   ).data
  //   console.log('encryptedStatus', encryptedStatus)

  //   //LoginResponse DocData
  //   const loginResponseDocOpts = {
  //     reference: state.wdsVendorId,
  //     vid_pin: encryptedVID_PIN,
  //     status: encryptedStatus,
  //     temp_timestamp: appDoc.data.temp_timestamp,
  //   }
  //   console.log('loginResponseDocOpts')
  //   console.dir(loginResponseDocOpts)

  //   const userIdentity = await client.platform.identities.get(state.identityId)
  //   const loginResponseDocument = await client.platform.documents.create(
  //     'wdsContract.TweetResponse',
  //     userIdentity,
  //     loginResponseDocOpts
  //   )
  //   console.log('loginReponse doc:')
  //   console.dir(loginResponseDocument)
  //   const documentBatch = {
  //     create: [loginResponseDocument],
  //     replace: [],
  //     delete: [],
  //   }

  //   const submitStatus = await client.platform.documents.broadcast(
  //     documentBatch,
  //     userIdentity
  //   )
  //   console.log(submitStatus)
  // },
  freshLoginPins({ commit, state }) {
    if (loginPinInterval) clearInterval(loginPinInterval)
    commit('setLoginPin')

    const refreshInterval = 300000
    loginPinInterval = setInterval(function () {
      if (state.loginPinTimeLeft < 1) {
        commit('setLoginPin')
        commit('setLoginPinTimeLeft', refreshInterval)
      } else {
        commit('setLoginPinTimeLeft', state.loginPinTimeLeft - 1000)
      }
    }, 1000)
  },
  showSnackbar({ commit }, { text, color = 'red' }) {
    commit('setSnackBar', { show: true, text, color, time: Date.now() })
  },
  async initWallet({ state, commit, dispatch }, { mnemonicPin }) {
    commit('clearClientErrors')
    console.log('Initializing Dash.Client with mnemonic: ')
    console.log('Encrypted mnemonic:', state.mnemonic)
    console.log(
      'Decrypted mnemonic:',
      await dispatch('decryptMnemonic', {
        encMnemonic: state.mnemonic,
        pin: mnemonicPin,
      })
    ) // TODO DEPLOY ask user for pin
    client = new Dash.Client({
      dapiAddresses: [
        '54.212.206.131:3000',
        // '54.184.89.215:3000',
        '35.167.241.7:3000',
        '54.244.159.60:3000',
        '34.219.79.193:3000',
        '34.223.226.20:3000',
        '34.216.133.190:3000',
        '52.88.13.87:3000',
        '54.203.2.102:3000',
        '18.236.73.143:3000',
        '54.187.128.127:3000',
        '54.190.136.191:3000',
        '35.164.4.147:3000',
        '54.189.121.60:3000',
        '54.149.181.16:3000',
        '54.202.214.68:3000',
        '34.221.5.65:3000',
        '34.219.43.9:3000',
        '54.190.1.129:3000',
        '54.186.133.94:3000',
        '54.190.26.250:3000',
        '52.88.38.138:3000',
        // '34.221.185.231:3000',
        '54.189.73.226:3000',
        '34.220.38.59:3000',
        '54.186.129.244:3000',
        '52.32.251.203:3000',
        '54.184.71.154:3000',
        '54.186.22.30:3000',
        '54.185.186.111:3000',
        '34.222.91.196:3000',
        // '54.245.217.116:3000',
        '54.244.203.43:3000',
        '54.69.71.240:3000',
        '52.88.52.65:3000',
        '18.236.139.199:3000',
        '52.33.251.111:3000',
        '54.188.72.112:3000',
        // '52.33.97.75:3000',
        '54.200.73.105:3000',
        '18.237.194.30:3000',
        '52.25.73.91:3000',
        // '18.237.255.133:3000',
        '34.214.12.133:3000',
        '54.149.99.26:3000',
        '18.236.235.220:3000',
        // '35.167.226.182:3000',
        '34.220.159.57:3000',
        '54.186.145.12:3000',
        // '34.212.169.216:3000',
      ],
      wallet: {
        mnemonic: await dispatch('decryptMnemonic', {
          encMnemonic: state.mnemonic,
          pin: mnemonicPin,
        }),
      },
      apps: {
        // dpns: {
        //   contractId: '7PBvxeGpj7SsWfvDSa31uqEMt58LAiJww7zNcVRP1uEM',
        // },

        users: { contractId: '9xUQuDE95yx5o2oVGWqvG94ETmqdxf6LC5d6Lagiux4K' },
        primitives: {
          contractId: 'J2jZkuK53qXQybna2UUYTHGA48XKRWFucyhi6cLk3foc',
        },
        jembe: { contractId: 'FbsTSaHhPP5DdFtiaXdqE9p9fut9wh3N5a2yVsiEYFpT' },
        PaymentRequest: {
          contractId: '2Hw6XoB289LJ8d6QEvgq9whvvB7qY5vZKKHXSwGvhre9',
        },
      },
    })

    // Timeout isReady() since we can't catch timeout errors
    clientTimeout = setTimeout(() => {
      commit('setClientErrors', 'Connection to Evonet timed out.')
    }, 500000) // TODO DEPLOY set sane timeout
    clearInterval(clientTimeout)

    client.account = await client.wallet.getAccount()
    console.log({ client })
    console.log(client.account.getUnusedAddress())

    console.log(
      'init Funding address',
      await client.account.getUnusedAddress().address
    )
    commit('setFundingAddress', client.account.getUnusedAddress().address)
    commit('setWalletBalance', client.account.getTotalBalance())
    console.log('init Confirmed Balance', client.account.getConfirmedBalance())
    console.log(
      'init Unconfirmed Balance',
      client.account.getUnconfirmedBalance()
    )
  },
  async getMagicInternetMoney() {
    console.log('Awaiting faucet drip..')
    const { account } = client
    const address = account.getUnusedAddress().address
    console.log('... for address: ' + address)
    try {
      // const req = await this.$axios.get(
      //   `https://qetrgbsx30.execute-api.us-west-1.amazonaws.com/stage/?dashAddress=${address}`,
      //   { crossdomain: true }
      // )
      // const req = await this.$axios.get(`http://localhost:5000/evodrip/us-central1/evofaucet/drip/${address}`)
      // const req = await this.$axios.get(
      //   `http://localhost:5000/evodrip/us-central1/evofaucet/drip/${address}`
      // )
      const reqs = [
        this.$axios.get(
          `https://us-central1-evodrip.cloudfunctions.net/evofaucet/bigdrip/${address}`
        ),
        this.$axios.get(`http://134.122.104.155:5050/bigdrip/${address}`),
      ]
      await Promise.race(reqs)
      console.log('... faucet dropped.')
      console.log(reqs)
    } catch (e) {
      console.log(e)
      // throw e
    }
  },
  async registerIdentity({ commit }) {
    console.log('Registering identity...')
    try {
      const identity = await client.platform.identities.register()
      commit('setIdentity', identity.id)
      console.log({ identity })
    } catch (e) {
      console.log('identity register error')
      console.log(e)
    }
  },
  registerIdentityOnceBalance({ dispatch, commit }) {
    if (registerIdentityInterval) clearInterval(registerIdentityInterval)
    console.log({ client })
    registerIdentityInterval = setInterval(async function () {
      const { account } = client
      console.log('Waiting for positive balance to register identity..')
      console.log('init Funding address', account.getUnusedAddress().address)
      console.log(account.getTotalBalance())
      console.log(account.getConfirmedBalance())
      console.log(account.getUnconfirmedBalance())
      commit('setWalletBalance', account.getTotalBalance())
      if (account.getConfirmedBalance() > 10000) {
        dispatch('registerIdentity')
        clearInterval(registerIdentityInterval)
      }
    }, 5000)
  },
  async registerNameOnceBalance({ state, dispatch, commit }) {
    if (registerNameInterval) clearInterval(registerNameInterval)
    console.log('Awaiting client ..')
    console.log({ client })
    const account = await client.wallet.getAccount()

    console.log({ account })
    if (account.getConfirmedBalance() > 10000 && state.identityId) {
      dispatch('registerName')
    } else {
      registerNameInterval = setInterval(function () {
        console.log('Waiting for positive balance to register name..')
        console.log(account.getConfirmedBalance())
        commit('setWalletBalance', account.getTotalBalance())
        if (account.getConfirmedBalance() > 10000 && state.identityId) {
          dispatch('registerName')
          clearInterval(registerNameInterval)
        }
      }, 5000)
    }
  },
  async registerUserOnceBalance({ state, dispatch }, { userDoc }) {
    if (registerUserInterval) clearInterval(registerUserInterval)
    console.log('Awaiting client ..')
    // console.log('..client is ready.', clientReady)
    const { account } = client
    if (account.getConfirmedBalance() > 10000 && state.identityId) {
      dispatch('registerUser', { userDoc })
    } else {
      registerUserInterval = setInterval(function () {
        console.log('Waiting for positive balance to register name..')
        console.log(client.account.getConfirmedBalance())
        if (client.account.getConfirmedBalance() > 10000 && state.identityId) {
          dispatch('registerUser')
          clearInterval(registerUserInterval)
        }
      }, 5000)
    }
  },
  async refreshWalletBalance({ commit }) {
    if (client && client.wallet) {
      const account = await client.wallet.getAccount()
      console.log('refreshing wallet balance :>> ', account.getTotalBalance())
      commit('setWalletBalance', account.getTotalBalance())
    }
  },
  // eslint-disable-next-line no-unused-vars
  async fetchUserDoc({ dispatch }, label) {
    const document = await client.platform.names.resolve(label + '.dash')
    return document
  },
  async submitDocument(
    { dispatch, state },
    { contract, typeLocator, document }
  ) {
    const { identityId } = state

    console.log(
      `Submitting document to ${contract}.${typeLocator} using identityId ${identityId}:`,
      document
    )

    const { platform } = client

    try {
      const identity = await platform.identities.get(identityId)
      // const identity = await cachedOrGetIdentity(client, identityId)
      // console.log({ identity })

      const createdDocument = await platform.documents.create(
        `${contract}.${typeLocator}`,
        identity,
        document
      )
      console.log('Broadcasting created document:', { createdDocument })

      const documentBatch = {
        create: [createdDocument],
        replace: [],
        delete: [],
      }

      const result = await platform.documents.broadcast(documentBatch, identity)
      console.log('result :>> ', result)
    } catch (e) {
      dispatch('showSnackbar', { text: e.message })
      console.error('Something went wrong:', e)
    }
  },
  async registerUser({ dispatch }, { userDoc }) {
    console.log('Registering User with UserDoc: ', userDoc)
    console.log('Registering User with UserDoc json: ', userDoc.toJSON())
    console.log(state)
    console.log(this.state.name.label)
    console.log(this.state.identityId)
    const identity = await client.platform.identities.get(this.state.identityId)
    console.log('Found valid identity:')
    console.log({ identity })

    const { account } = client
    const curIdentityHDKey = account.keyChain.HDPrivateKey
    console.log({ publicKeyString: curIdentityHDKey.publicKey.toString() })

    const publicKey = curIdentityHDKey.publicKey.toString()
    // const identity = await client.platform.identities.get(this.state.identityId)

    console.log('Registering user')
    try {
      const document = {
        name: userDoc.data.label,
        pubkey: publicKey,
        dpnsDocId: userDoc.id,
        identityId: userDoc.ownerId,
      }
      console.log({ document })

      const payloadDocument = await client.platform.documents.create(
        `users.Users`,
        identity,
        document
      )

      const documentBatch = {
        create: [payloadDocument],
        replace: [],
        delete: [],
      }

      const submitStatus = await client.platform.documents.broadcast(
        documentBatch,
        identity
      )
      console.log(submitStatus)
    } catch (e) {
      dispatch('showSnackbar', {
        text: e.message + ' | Choose a new name.',
      })
      this.commit('setSyncing', false)
      console.log({ pub: identity.publicKeys[0].toString() })
    }
  },
  async registerName({ commit, dispatch }) {
    console.log('Registering Name with identityId: ')
    console.log(this.state.name.label)
    console.log(this.state.identityId)
    const identity = await client.platform.identities.get(this.state.identityId)
    console.log('Found valid identity:')
    console.log({ identity })

    console.log('Registering name')
    try {
      const createDocument = await client.platform.names.register(
        this.state.name.label + '.dash',
        { dashUniqueIdentityId: identity.getId() },
        identity
      )
      console.log({ createDocument })
      const [doc] = await client.platform.documents.get('dpns.domain', {
        where: [
          ['normalizedParentDomainName', '==', 'dash'],
          ['normalizedLabel', '==', this.state.name.label.toLowerCase()],
        ],
      })
      console.log({ doc })

      // TODO refactor sessionStorage to match accounts
      commit('setNameDocId', doc.id)
      commit('setNameRegistered', true)
      dispatch('registerUserOnceBalance', { userDoc: doc })
    } catch (e) {
      dispatch('showSnackbar', {
        text: e.message + ' | Choose a new name.',
      })
      this.commit('setSyncing', false)
    }
  },
  async dashNameExists({ dispatch }, name) {
    let queryOpts = {
      where: [
        ['normalizedParentDomainName', '==', 'dash'],
        ['normalizedLabel', '==', name.toLowerCase()],
      ],
      startAt: 0,
      limit: 1,
      orderBy: [['normalizedLabel', 'asc']],
    }
    console.log('Checking if name exists on dpns..')
    try {
      const searchNames = await client.platform.documents.get(
        'dpns.domain',
        queryOpts
      )
      console.log({ searchNames })
      console.log(searchNames.length)
      if (searchNames.length == 1) {
        return true
      } else {
        return false
      }
    } catch (e) {
      dispatch('showSnackbar', { text: e.message })
      console.error('Something went wrong:', e)
    }
  },
  async queryDocuments(
    { dispatch, commit },
    {
      dappName,
      typeLocator,
      queryOpts = {
        limit: 1,
        startAt: 1,
      },
    }
  ) {
    console.log('Querying documents...')
    console.log({ dappName, typeLocator, queryOpts })
    commit('setSyncing', true)
    try {
      const documents = await client.platform.documents.get(
        `${dappName}.${typeLocator}`,
        queryOpts
      )
      console.log({ documents })
      return documents
    } catch (e) {
      dispatch('showSnackbar', { text: e, color: 'red' })
      console.error('Something went wrong:', e)
    } finally {
      commit('setSyncing', false)
    }
  },
  async getContract({ state }) {
    const contract = await client.platform.contracts.get(state.wdsContractId)
    console.log({ contract })
    return contract
  },
}
