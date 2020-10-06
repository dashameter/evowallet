<template>
  <div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Date time</th>
            <th class="text-left">Username</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Status</th>
            <!-- <th class="text-left">Info</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(paymentRequest, idx) in paymentRequests" :key="idx">
            <td>
              <timeago
                class="subtitle-1"
                :datetime="date(paymentRequest.docs[0].timestamp)"
                :auto-update="60"
              />
            </td>
            <td>{{ paymentRequest.docs[0].requesterUserName }}</td>
            <td>
              {{
                paymentRequest.docs[0].encFiatAmount === '0'
                  ? '-'
                  : paymentRequest.docs[0].encFiatAmount
              }}
              {{ paymentRequest.docs[0].encFiatSymbol }}
            </td>
            <td
              v-if="
                (paymentRequest.status === 'Underpaid' ||
                  paymentRequest.status === 'Pending') &&
                idx === 0
              "
            >
              <v-btn text color="primary" dense nuxt to="/home" class="ml-n5"
                >Pay</v-btn
              >
            </td>
            <td v-else>{{ paymentRequest.status }}</td>
            <!-- <td>{{ info(idx) }}</td> -->
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Vue.extend({
  data: () => {
    return {
      paymentRequests: {},
    }
  },
  created() {
    if (this.$store.state.name.isRegistered === false)
      window.location.href = '/' // TODO use router
    this.pollFetchPaymentRequests()
  },
  methods: {
    ...mapActions([
      'fetchPaymentRequests',
      'refundPaymentRequest',
      'requestPayment',
      'cancelPaymentRequest',
      'clientIsReady',
    ]),
    async refreshPaymentRequests() {
      this.paymentRequests = await this.fetchPaymentRequests()
    },
    async pollFetchPaymentRequests() {
      if (
        this.$router.currentRoute.path != '/paymentRequestsHistory' ||
        this.$router.currentRoute.path != '/home'
      ) {
        const isReady = await this.clientIsReady()
        if (!isReady) {
          console.log('No client available, waiting for connection..')
          await sleep(5000)
          this.pollFetchPaymentRequests()
          return
        }

        this.paymentRequests = await this.fetchPaymentRequests()

        await sleep(1000)

        this.pollFetchPaymentRequests()
      }
    },
    date($createdAt) {
      return new Date($createdAt)
    },
    amountPaid(idx) {
      // const pr: any = {this.paymentRequests[idx].docs[0]
      const total = this.paymentRequests[idx].utxos.items.reduce((acc, val) => {
        return acc + val.satoshis
      }, 0)
      return total
    },
    info(idx) {
      const { amountPaid, paymentRequests } = this
      const pr = {
        ...paymentRequests[idx].docs[0],
        summary: paymentRequests[idx].summary,
        utxos: paymentRequests[idx].utxos,
      }
      const infoT =
        pr.encAddress +
        ' ' +
        pr.encSatoshis +
        ' ' +
        amountPaid(idx) +
        ' ' +
        // JSON.stringify(pr.utxos) +
        pr.refId.slice(-4) +
        ' ' +
        pr.summary.txAppearances
      return infoT
    },
  },
})
</script>

<style scoped></style>
