<template>
  <v-container :fill-height="!$vuetify.breakpoint.xs">
    <!-- <v-alert dense outlined color="blue">
      <div>
        <strong>Heads Up:</strong> There is no working auto-faucet, use the
        faucet or console to send some eDuffs to:
        {{ this.$store.state.fundingAddress }}
      </div>
    </v-alert> -->

    <Mobile class="hidden-sm-and-up" /> <Desktop class="hidden-xs-only mt-n4" />
    <v-overlay :value="!!mnemonic">
      <v-stepper v-model="stepperOnboard" light style="max-width: 545px">
        <v-stepper-header>
          <v-stepper-step :complete="stepperOnboard > 1" step="1"
            >Save passphrase</v-stepper-step
          >
          <v-divider></v-divider>
          <v-stepper-step :complete="stepperOnboard > 2" step="2"
            >Choose PIN</v-stepper-step
          >
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card flat elevation="0">
              <v-card-title>
                <span class="headline">Save passphrase</span>
              </v-card-title>
              <v-card-text>
                <v-alert dense outlined color="blue">
                  <div>
                    <div>
                      <strong>Important:</strong> Backup your recovery phrase or
                      loose your coins!
                    </div>
                  </div>
                </v-alert>
                <v-textarea
                  ref="mnemonicBackup"
                  :value="mnemonic"
                  auto-grow
                  outlined
                  readonly=""
                  rows="3"
                  row-height="25"
                ></v-textarea>
              </v-card-text>
              <v-card-actions class="mt-n10">
                <v-btn class="ml-2" @click="copyMnemonicToClipboard"
                  >Copy Phrase</v-btn
                >
              </v-card-actions>
            </v-card>
            <v-divider vertical="" />
            <v-row>
              <v-spacer></v-spacer>
              <v-btn class="mr-8" color="primary" @click="stepperOnboard = 2">
                Continue
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <MnemonicPin v-model="mnemonicPin" @enterKey="finish()" />
            <v-divider vertical="" />
            <v-row>
              <v-spacer></v-spacer>
              <v-btn text @click="stepperOnboard = 1"> Back </v-btn>
              <v-btn class="mr-4" color="primary" @click="finish">
                Finish
              </v-btn>
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Mobile from '../components/signup/Mobile'
import Desktop from '../components/signup/Desktop'
import MnemonicPin from '../components/MnemonicPin'

export default {
  components: { Mobile, Desktop, MnemonicPin },
  data() {
    return {
      mnemonic: '',
      mnemonicPin: '',
      // overlayOnboard: false,
      stepperOnboard: 1,
    }
  },
  computed: {
    ...mapGetters(['']),
  },
  mounted() {
    // TODO replace with global isLoggedIn var
    if (this.$store.state.name.isRegistered) this.$router.push('actions')
    // eslint-disable-next-line no-unused-vars
    this.$store.watch(
      (state) => state.name.docId,
      async () => {
        this.mnemonic = await this.$store.dispatch('mnemonicPlaintext')
      }
    )
  },
  methods: {
    ...mapActions([
      'initWallet',
      'getMagicInternetMoney',
      'registerIdentity',
      'registerIdentityOnceBalance',
      'mnemonicPlaintext',
    ]),
    async finish() {
      const { mnemonicPin } = this
      console.log('finish mnemonic', this.mnemonic)
      await this.$store.dispatch('setAndEncMnemonic', {
        mnemonic: this.mnemonic,
        pin: mnemonicPin,
      })
      await this.$store.dispatch('addCurrentAccount', mnemonicPin) // TODO DEPLOY ask user for pin
      // this.mnemonic = ''

      window.$nuxt.$router.push('/home')
    },
    copyMnemonicToClipboard() {
      let mnemonic = this.$refs.mnemonicBackup.$el.querySelector('textarea')
      mnemonic.select()
      document.execCommand('copy')
      window.getSelection().removeAllRanges()
    },
  },
}
</script>
