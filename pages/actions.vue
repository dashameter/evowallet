<template>
  <!-- <v-container :fill-height="!$vuetify.breakpoint.xs"> -->
  <v-container>
    <audio id="notificationSound" :src="require('@/assets/notify.mp3')" />
    <v-card class="mx-auto my-5" max-width="344" outlined>
      <v-list-item>
        <v-list-item-content>
          <div class="overline mb-4">
            Welcome
          </div>
          <v-list-item-title class="headline mb-1 text-center">
            {{ this.$store.state.name.label }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card>

    <v-card
      class="mx-auto my-5"
      max-width="344"
      outlined
      @click="copyPinToClipboard"
    >
      <v-list-item>
        <v-list-item-content>
          <v-overlay :absolute="true" :value="copyPinOverlay">
            <v-btn color="#787878" @onclick="copyPinOverlay = false">
              <v-icon>mdi-clipboard</v-icon>Copied!
            </v-btn>
          </v-overlay>
          <div class="overline mb-4">
            PIN for dapp actions
          </div>
          <v-list-item-title class="headline mb-1 text-center">
            <span ref="loginpin" style="letter-spacing: 0.1em;">{{
              this.$store.state.loginPin
            }}</span>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-progress-linear v-model="loginPinTimeLeft" color="primary" reactive />
      <v-progress-linear
        v-if="showAmberProgress()"
        v-model="loginPinTimeLeftAmber"
        height="10"
        color="amber"
        reactive
      />
    </v-card>
    <v-card class="mx-auto my-5" max-width="344" outlined>
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline mb-4">
            {{ curActionRequest.overline }}
          </div>
          <v-list-item-title class="headline mb-1">
            {{ curActionRequest.headline }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ curActionRequest.payload }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-card-actions v-if="curActionRequest.actionRequired">
        <v-btn outlined color="error" large @click="rejectDoc()">
          <v-icon left>
            mdi-cancel
          </v-icon>

          Cancel
        </v-btn>
        <v-spacer />

        <v-btn
          :loading="curActionRequest.loading"
          color="success"
          large
          @click="approveRequest()"
        >
          <v-icon left> mdi-check-bold </v-icon>Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { Unit } from '@dashevo/dashcore-lib'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  components: {},
  data() {
    return {
      loginPinTimeLeft: 0,
      loginPinTimeLeftAmber: 0,
      copyPinOverlay: false,
    }
  },
  computed: {
    ...mapGetters(['curAccountDocId', 'curActionRequest', 'lastRequest']),
  },
  created() {
    // if (this.$store.state.name.isRegistered === false) this.$router.push('/')
    if (this.$store.state.name.isRegistered === false)
      window.location.href = '/' // TODO use router
    this.resetDoc()
    this.freshLoginPins()
    this.pollDocumentActionRequest()
    this.pollPaymentRequest()
    this.pollPaymentRequestPOS()
  },
  async mounted() {
    this.$store.watch(
      (state) => state.loginPinTimeLeft,
      () => {
        const msLeft = this.$store.state.loginPinTimeLeft
        this.loginPinTimeLeft = 100 - (msLeft / 300000) * 100 //TODO get interval dynamically
        this.loginPinTimeLeftAmber = 100 - (msLeft / 30000) * 100 //TODO get interval dynamically
      }
    )
    // TODO remove debug contract output
    // this.getContract()
    // this.pollContract()
  },
  methods: {
    ...mapActions([
      'initWallet',
      'getMagicInternetMoney',
      'registerIdentity',
      'registerIdentityOnceBalance',
      'showSnackbar',
      'getContract',
      'queryDocuments',
      'freshLoginPins',
      'verifyAppRequest',
      'approveAppRequest',
      'showSnackbar',
      'processActionRequestPayload',
      'setCurActionRequest',
      'setCurActionRequestLoading',
      'sendDash',
      'clientIsReady',
      'getAddressSummary',
    ]),
    copyPinToClipboard() {
      try {
        const el = document.createElement('textarea')
        el.value = this.$store.state.loginPin
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        this.copyPinOverlay = true
        setTimeout(() => {
          this.copyPinOverlay = false
        }, 700)
      } catch (e) {
        this.showSnackbar({ text: e.message })
      }
    },
    showAmberProgress() {
      return Boolean(this.$store.state.loginPinTimeLeft < 30000)
    },
    playNotification() {
      document.getElementById('notificationSound').play()
    },
    rejectDoc() {
      this.resetDoc()
    },
    resetDoc() {
      // Clear Action Card in viewport
      this.$store.commit('resetCurActionRequest')
    },
    async approveRequest() {
      this.$store.commit('setCurActionRequestLoading', true)
      const { curActionRequest } = this
      console.log({ curActionRequest })

      const { $type } = curActionRequest.doc
      console.log({ $type })
      switch ($type) {
        case 'DocumentActionRequest':
          this.approveActionRequest()
          break
        case 'PaymentRequest':
          console.log('approving payment')
          this.approvePaymentRequest()
          break

        default:
          break
      }
    },
    async approvePaymentRequest() {
      const { curActionRequest } = this

      let { toAddress, satoshis } = curActionRequest.doc
      console.log('toAddress :>> ', toAddress)
      console.log('satoshis :>> ', satoshis)
      if (!toAddress) {
        console.log('no address')
        toAddress = curActionRequest.doc.encAddress
      }
      if (!satoshis) {
        console.log('no satoshis')
        satoshis = curActionRequest.needToPaySatoshis
      }
      console.log('toAddress :>> ', toAddress)
      console.log('satoshis :>> ', satoshis)

      satoshis = parseInt(satoshis) // TODO fix type contract

      this.$store.commit('setCurActionRequestLoading', true)
      await this.sendDash({ toAddress, satoshis })
      // this.$router.push('/paymentRequestsHistory')
      this.$store.commit('setCurActionRequestLoading', false)
      this.resetDoc() // Clears viewport
    },
    async approveActionRequest() {
      const { curActionRequest } = this

      this.$store.commit('setCurActionRequestLoading', true)
      try {
        const payload = curActionRequest.doc.payload // in doc in state
        const actionRequestName = Object.keys(payload)[0] // stick this in signDoc in state
        await this.processActionRequestPayload({
          actionRequest: curActionRequest,
        }) // TODO give actionRequests unique identifiers to not hand over a new one due to a race condition
        console.log('WE AWAITED THE SUBMIT')
        this.showSnackbar({
          text: `Approved ${actionRequestName}`,
          color: 'green',
        })
        this.resetDoc() // clears viewport
      } catch (e) {
        this.showSnackbar({ text: e.message })
        console.log(e)
      }
    },
    async pollPaymentRequestPOS() {
      // Stop polling when navigating to a different route
      if (this.$router.currentRoute.path != '/actions') return

      const isReady = await this.clientIsReady()
      if (!isReady) {
        console.log('No client available, waiting for connection..')
        await sleep(1000)
        this.pollPaymentRequestPOS()
        return
      }
      // const { curActionRequest } = this

      // TODO replace with state.loggedIn
      if (!this.$store.state.name.isRegistered) return // Don't poll if there is no user

      console.log('pollingPaymentRequestPOS()', Date(Date.now()).toString())
      const curADId = this.curAccountDocId
      console.log('curAccountDocId for pollingPaymentRequest', curADId)
      const queryOpts = {
        limit: '1',
        startAt: '1',
        orderBy: [['timestamp', 'desc']],
        where: [['requesteeUserId', '==', this.$store.state.name.docId]], // TODO where unixTimestamp less than 1 min old
      }
      console.log(
        'this.$store.state.identityId :>> ',
        this.$store.state.name.docId
      )
      const documents = await this.queryDocuments({
        dappName: 'PaymentRequest',
        typeLocator: 'PaymentRequest',
        queryOpts,
      })

      console.log({ documents })
      let [paymentRequest] = documents

      if (paymentRequest) {
        console.log({ paymentRequest })
        paymentRequest = paymentRequest.toJSON()
        console.log({ paymentRequestJSON: paymentRequest })

        // DEPLOY TODO waiting for encryption lib
        // const verifiedApp = await this.verifyAppRequest(actionRequest) // Doc passes our pin test
        // const isPinVerified = verifiedApp.success
        const { uidPin } = paymentRequest
        const { loginPin } = this.$store.state
        console.log({ uidPin })
        const decryptedRequestPin = await this.$store.dispatch(
          'decryptRequestPin',
          { identityId: paymentRequest.$ownerId }
        )
        console.log('decryptedRequestPin :>> ', decryptedRequestPin)
        const isPinVerified = decryptedRequestPin === loginPin
        console.log({ loginPin })
        console.log({ isPinVerified })

        let isPaymentRequestNew = false
        const lastPaymentRequest = this.lastRequest({
          contractId: paymentRequest.contractId, // TODO next iteration senderContractId
          type: paymentRequest.$type,
        })
        if (
          !lastPaymentRequest ||
          lastPaymentRequest.$id != paymentRequest.$id
        ) {
          isPaymentRequestNew = true
        }
        console.log('lastPaymentRequest :>> ', lastPaymentRequest)
        console.log('paymentRequest :>> ', paymentRequest)
        console.log({ isPaymentRequestNew })

        // We have an new (unseen), legitimate (pinVerified) ActionRequest, set notification details for approval
        // if (isPinVerified && isPaymentRequestNew) { // TODO sync PIN time to delegatedCredentials time
        if (true && isPaymentRequestNew) {
          // eslint-disable-next-line no-constant-condition
          // if (true) {
          const {
            // eslint-disable-next-line no-unused-vars
            memo,
            // eslint-disable-next-line no-unused-vars
            refId,
            // eslint-disable-next-line no-unused-vars
            requesteeUserId,
            // eslint-disable-next-line no-unused-vars
            requesteeUserName,
            // eslint-disable-next-line no-unused-vars
            requesterUserId,
            // eslint-disable-next-line no-unused-vars
            requesterUserName,
            // eslint-disable-next-line no-unused-vars
            timestamp,
            // eslint-disable-next-line no-unused-vars
            encAddress,
            encSatoshis,
            // eslint-disable-next-line no-unused-vars
            encFiatAmount,
            // eslint-disable-next-line no-unused-vars
            encFiatSymbol,
          } = paymentRequest

          console.log('lastPaymentRequest :>> ', lastPaymentRequest)
          // satoshis === 0 means request has been cancelled
          if (encSatoshis === '0') {
            // If the currently shown request is cancelled, clear it. But don't clear unrelated requests.
            if (lastPaymentRequest?.refId === refId) {
              this.rejectDoc()
            }
          } else if (parseInt(encSatoshis) > 0) {
            const totalRequestedSatoshis = parseInt(encSatoshis)
            const alreadyPaidSummary = await this.getAddressSummary(encAddress)

            const needToPaySatoshis =
              totalRequestedSatoshis - alreadyPaidSummary.totalBalanceSat
            // If the currently shown request is cancelled, clear it. But don't clear unrelated requests.
            if (needToPaySatoshis > 0) {
              const dashAmount = Unit.fromSatoshis(needToPaySatoshis).to(
                Unit.BTC
              )

              const totalRequestedFiatAmount = parseFloat(encFiatAmount)
              const conversionRate =
                totalRequestedFiatAmount /
                Unit.fromSatoshis(encSatoshis).toBTC()
              const needToPayFiatAmount =
                Math.round(conversionRate * dashAmount * 100) / 100

              const signDoc = { needToPaySatoshis }
              signDoc.doc = paymentRequest
              signDoc.overline = paymentRequest.dappName
              signDoc.headline = 'PaymentRequest'
              // signDoc.payload = `Send ${dashAmount} Dash to ${encAddress}`
              signDoc.payload = `Pay ${needToPayFiatAmount} ${encFiatSymbol} to ${requesterUserName} with memo: ${memo}. (${dashAmount} Dash)`
              signDoc.actionRequired = true
              console.log({ signDoc })
              this.$store.commit('setCurActionRequest', signDoc) // TODO refactor to CurRequest
              this.playNotification()
            } else {
              if (lastPaymentRequest?.refId === refId) {
                this.rejectDoc()
              }
            }
          }

          console.log({ paymentRequest })
          this.$store.commit('setLastRequest', paymentRequest)
        }
      }
      await sleep(5000)
      this.pollPaymentRequestPOS()
    },
    async pollPaymentRequest() {
      // Stop polling when navigating to a different route
      if (this.$router.currentRoute.path != '/actions') return

      const isReady = await this.clientIsReady()
      if (!isReady) {
        console.log('No client available, waiting for connection..')
        await sleep(5000)
        this.pollPaymentRequest()
        return
      }
      // const { curActionRequest } = this

      // TODO replace with state.loggedIn
      if (!this.$store.state.name.isRegistered) return // Don't poll if there is no user

      console.log('pollingPaymentRequest()', Date(Date.now()).toString())
      const curADId = this.curAccountDocId
      console.log('curAccountDocId for pollingPaymentRequest', curADId)
      const queryOpts = {
        limit: '1',
        startAt: '1',
        orderBy: [['unixTimestamp', 'desc']],
        where: [['accountDocId', '==', curADId]], // TODO where unixTimestamp less than 1 min old
      }

      const documents = await this.queryDocuments({
        dappName: 'primitives',
        typeLocator: 'PaymentRequest',
        queryOpts,
      })

      console.log({ documents })
      let [paymentRequest] = documents

      if (paymentRequest) {
        console.log({ paymentRequest })
        paymentRequest = paymentRequest.toJSON()
        console.log({ paymentRequestJSON: paymentRequest })

        // const payload = JSON.parse(paymentRequest.JSONDocString) // TODO handle invalid json strings

        // DEPLOY TODO waiting for encryption lib
        // const verifiedApp = await this.verifyAppRequest(actionRequest) // Doc passes our pin test
        // const isPinVerified = verifiedApp.success
        const { uidPin } = paymentRequest
        const { loginPin } = this.$store.state
        console.log({ uidPin })
        const decryptedRequestPin = await this.$store.dispatch(
          'decryptRequestPin',
          { identityId: paymentRequest.$ownerId }
        )
        console.log('decryptedRequestPin :>> ', decryptedRequestPin)
        const isPinVerified = decryptedRequestPin === loginPin
        console.log({ loginPin })
        console.log({ isPinVerified })

        let isPaymentRequestNew = false
        const lastPaymentRequest = this.lastRequest({
          contractId: paymentRequest.contractId, // TODO next iteration senderContractId
          type: paymentRequest.$type,
        })
        if (
          !lastPaymentRequest ||
          lastPaymentRequest.$id != paymentRequest.$id
        ) {
          isPaymentRequestNew = true
        }
        console.log('lastPaymentRequest :>> ', lastPaymentRequest)
        console.log('paymentRequest :>> ', paymentRequest)
        console.log({ isPaymentRequestNew })

        // We have an new (unseen), legitimate (pinVerified) ActionRequest, set notification details for approval
        // if (isPinVerified && isPaymentRequestNew) { // TODO sync PIN time to delegatedCredentials time
        if (true && isPaymentRequestNew) {
          const { satoshis, toAddress } = paymentRequest
          const dashAmount = Unit.fromSatoshis(satoshis).to(Unit.BTC)

          const signDoc = {}
          signDoc.doc = paymentRequest
          signDoc.overline = paymentRequest.dappName
          signDoc.headline = 'PaymentRequest'
          signDoc.payload = `Send ${dashAmount} Dash to ${toAddress}`
          signDoc.actionRequired = true
          console.log({ signDoc })
          this.$store.commit('setCurActionRequest', signDoc) // TODO refactor to CurRequest
          this.playNotification()

          console.log({ paymentRequest })
          this.$store.commit('setLastRequest', paymentRequest)
        }
      }
      await sleep(5000)
      this.pollPaymentRequest()
    },
    async pollDocumentActionRequest() {
      // Stop polling when navigating to a different route
      if (this.$router.currentRoute.path != '/actions') return

      const isReady = await this.clientIsReady()
      if (!isReady) {
        console.log('No client available, waiting for connection..')
        await sleep(5000)
        this.pollDocumentActionRequest()
        return
      }
      const { curActionRequest } = this

      // TODO replace with state.loggedIn
      if (!this.$store.state.name.isRegistered) return // Don't poll if there is no user

      console.log('pollingDocumentActionRequest()', Date(Date.now()).toString())
      // const recentTimestamp = Math.floor(Date.now() / 1000) - 60

      const queryOpts = {
        limit: '1',
        startAt: '1',
        orderBy: [['unixTimestamp', 'desc']],
        where: [
          ['accountDocId', '==', this.curAccountDocId],
          // ['unixTimestamp', '<', 110], //recentTimestamp],
        ], // TODO where unixTimestamp less than 1 min old
      }

      const documents = await this.queryDocuments({
        dappName: 'primitives',
        typeLocator: 'DocumentActionRequest',
        queryOpts,
      })

      console.log({ documents })
      let [actionRequest] = documents

      if (actionRequest) {
        console.log({ actionRequest })
        actionRequest = actionRequest.toJSON()
        console.log({ actionRequestJSON: actionRequest })

        // console.log(JSON.parse(actionRequest.JSONDocString))

        const payload = JSON.parse(
          JSON.parse('"' + actionRequest.JSONDocString + '"')
        ) // TODO handle invalid json strings
        console.log(
          'actionRequest.JSONDocString :>> ',
          actionRequest.JSONDocString
        )
        console.log('payload :>> ', payload)

        const { uidPin } = actionRequest
        const { loginPin } = this.$store.state
        console.log({ uidPin })
        const decryptedRequestPin = await this.$store.dispatch(
          'decryptRequestPin',
          { encRequestPin: uidPin, identityId: actionRequest.$ownerId }
        )
        console.log('decryptedRequestPin :>> ', decryptedRequestPin.data)
        const isPinVerified = decryptedRequestPin.data === loginPin
        console.log({ loginPin })
        console.log({ isPinVerified })

        let isActionRequestNew = false
        const lastActionRequest = this.lastRequest({
          contractId: actionRequest.contractId, // TODO v2 should be senderContractId
          type: actionRequest.$type,
        })
        console.log('lastActionRequest :>> ', lastActionRequest)
        console.log('actionRequest.$id :>> ', actionRequest.$id)
        if (!lastActionRequest || lastActionRequest.$id != actionRequest.$id) {
          isActionRequestNew = true
        }
        console.log({ isActionRequestNew })

        // We have an new (unseen), legitimate (pinVerified) ActionRequest, set notification details for approval
        // eslint-disable-next-line no-constant-condition
        if (isPinVerified && isActionRequestNew) {
          // MUST DO undo true
          // TODO sometimes the sound plays but the v-card doesn't update, consider a watcher / state based solution instead
          // Yes should definitely be in state so it can be reset upon account switch
          console.log('THIS SHOULD SHOW IN THE VIEWPORT')
          const signDoc = {}
          signDoc.doc = actionRequest
          signDoc.doc.payload = payload
          signDoc.overline = actionRequest.dappName
          signDoc.headline = Object.keys(payload)[0]
          signDoc.payload = ''
          signDoc.actionRequired = true
          this.$store.commit('setCurActionRequest', signDoc)
          console.log('THIS SHOULD SHOW IN THE VIEWPORT', curActionRequest)
          this.playNotification()

          console.log({ actionRequest })
          this.$store.commit('setLastRequest', actionRequest)
        }
      }
      await sleep(5000)
      this.pollDocumentActionRequest()
    },
    async pollContract() {
      // TODO replace with state.loggedIn
      if (!this.$store.state.name.isRegistered) return

      const { curActionRequest } = this

      console.log('polling', Date(Date.now()).toString())

      const queryOpts = {
        limit: '1',
        startAt: 0,
        orderBy: [['temp_timestamp', 'desc']],
        where: [['reference', '==', this.$store.state.name.docId]], // TODO query > temp_timestamp
      }

      const appRequest = await this.queryDocuments({
        appName: 'wdsContract',
        typeLocator: 'TweetRequest',
        queryOpts,
      })

      let [appDoc] = appRequest
      console.log({ appDoc })

      const appDocExists = !!appDoc
      console.log({ appDocExists })

      if (appDocExists) {
        const verifiedApp = await this.verifyAppRequest(appDoc) // Doc passes our pin test
        const isPinVerified = verifiedApp.success
        console.log({ isPinVerified })

        const isDocNew = !!(appDoc.id != this.$store.state.wdsLastDoc) // It's a fresh, unseen doc
        console.log({ isDocNew })

        // We have a new, legitimate request, set notification details for approval
        if (isPinVerified && isDocNew) {
          // TODO sometimes the sound plays but the v-card doesn't update, consider a watcher / state based solution instead
          // Yes should definitely be in state so it can be reset upon account switch
          console.log('THIS SHOULD SHOW IN THE VIEWPORT')
          const signDoc = {}
          signDoc.doc = appDoc
          signDoc.overline = appDoc.data.temp_dappname
          signDoc.headline = appDoc.type
          signDoc.payload = appDoc.data.tweet
          signDoc.actionRequired = true
          this.$store.commit('setCurActionRequest', signDoc)
          console.log('THIS SHOULD SHOW IN THE VIEWPORT', this.signDoc)
          this.playNotification()

          // We don't want to hear the sound every 5 seconds
          this.$store.commit('setLastDoc', curActionRequest.doc.id) // TODO change from id to doc to query > timestamp
        }
      }
      // this.queryDocuments({ typeLocator: 'LoginResponse' })
      await sleep(5000)
      this.pollContract()
    },
  },
}
// pin 751421
</script>
