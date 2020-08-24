<template>
  <div>
    <v-card
      max-width="600px"
      style="background: #787878; color: white;"
      class="mx-auto text-center headline"
    >
      Scan / Drag&Drop QR Code
      <QrcodeDropZone
        class="drop-area"
        :class="{ dragover: dragover }"
        @detect="onDetect"
        @dragover="onDragOver"
        @init="logErrors"
      >
        <QrcodeStream @decode="onDecode" @init="onInit" />
      </QrcodeDropZone>

      <QrcodeCapture v-if="noStreamApiSupport" @decode="onDecode" />
    </v-card>
  </div>
</template>

<script>
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'
import { mapActions } from 'vuex'

const timestamp = () => Math.floor(Date.now() / 1000)

export default {
  // eslint-disable-next-line vue/no-unused-components
  components: { QrcodeStream, QrcodeDropZone, QrcodeCapture },

  data() {
    return {
      requesterUserName: '',
      invoiceId: '',
      dragover: false,
      error: null,
      noStreamApiSupport: false,
    }
  },

  methods: {
    ...mapActions([
      'submitDocument',
      'freshAddress',
      'fetchUserDoc',
      'showSnackbar',
    ]),
    async sendPaymentIntent() {
      const {
        submitDocument,
        freshAddress,
        fetchUserDoc,
        invoiceId,
        showSnackbar,
      } = this
      showSnackbar({
        text: `Sending PaymentIntent to: ${this.requesterUserName}`,
        color: '#008de4',
      })
      const userDoc = await fetchUserDoc(this.requesterUserName)

      const contract = 'PaymentRequest'
      const typeLocator = 'PaymentIntent'

      const requesteeUserId = this.$store.state.name.docId
      const requesteeUserName = this.$store.state.name.label
      const requesterUserId = userDoc.id
      const requesterUserName = userDoc.data.label
      const encRefundAddress = await freshAddress()

      const document = {
        requesterUserId,
        requesterUserName,
        requesteeUserId,
        requesteeUserName,
        invoiceId,
        encRefundAddress,
        timestamp: timestamp(),
      }
      await submitDocument({ contract, typeLocator, document })
      this.$store.dispatch('showSnackbar', {
        text: 'PaymentIntent sent!',
        color: 'green',
      })
      this.$router.push('/home')
    },
    async onDetect(promise) {
      try {
        const { content } = await promise

        const decoded = content.split('#')
        this.requesterUserName = decoded[0]
        this.invoiceId = decoded[1] ? decoded[1] : ''

        this.error = null
        this.sendPaymentIntent()
      } catch (error) {
        if (error.name === 'DropImageFetchError') {
          this.error = "Sorry, you can't load cross-origin images :/"
        } else if (error.name === 'DropImageDecodeError') {
          this.error = "Ok, that's not an image. That can't be decoded."
        } else {
          this.error = 'Ups, what kind of error is this?! ' + error.message
        }
        this.$store.dispatch('showSnackbar', { text: this.error })
      }
    },
    onDragOver(isDraggingOver) {
      this.dragover = isDraggingOver
    },
    onDecode(result) {
      const decoded = result.split('#')
      this.requesterUserName = decoded[0]
      this.invoiceId = decoded[1] ? decoded[1] : ''
      this.sendPaymentIntent()
    },

    logErrors(promise) {
      promise.catch(console.error)
    },

    async onInit(promise) {
      try {
        await promise
      } catch (error) {
        console.log('error :>> ', error)
        if (error.name === 'StreamApiNotSupportedError') {
          this.noStreamApiSupport = true
        }
      }
    },
  },
}
</script>
<style>
.drop-area {
  background-color: #008de4;
}

.dragover {
  background-color: #012060;
}

.drop-error {
  color: red;
  font-weight: bold;
}
</style>
