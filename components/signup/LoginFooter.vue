<template>
  <div>
    <p style="font-family: 'Open Sans', sans-serif; font-size: 12pt">
      You can also
      <a class="font-weight-bold" @click="mnemonicDialog = true"> login</a>
      into your existing Dash Account.
    </p>

    <v-dialog
      v-model="mnemonicDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ mnemonicDialogTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-alert dense outlined color="blue">
            <div>
              <strong>Hint:</strong> Paste your 12 words recovery phrase you
              received during signup to log into your Dash Evolution Account.
            </div>
          </v-alert>
          <v-textarea
            ref="mnemonic"
            v-model="mnemonicText"
            :label="mnemonicDialogLabel"
            auto-grow
            outlined
            :loading="mnemonicDialogLoading"
            :readonly="!isMnemonicLogin"
            rows="3"
            row-height="25"
            :clearable="isMnemonicLogin"
            clear-icon="mdi-backspace"
          ></v-textarea>
          <v-text-field
            v-model="mnemonicPin"
            outlined=""
            clearable=""
            counter=""
            label="Enter a PIN or Password to encrypt passphrase"
            @keyup.enter="login"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-6">
          <v-btn x-large @click="mnemonicDialog = false">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!isMnemonicLogin"
            x-large
            color="primary"
            @click="copyMnemonicToClipboard"
            >Copy Phrase</v-btn
          >
          <v-btn v-if="isMnemonicLogin" x-large color="primary" @click="login"
            >Login</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  components: {},
  data() {
    return {
      mnemonicDialog: false,
      mnemonicDialogTitle: 'Login to Dash 2.0 Evolution',
      mnemonicDialogLabel: 'bean draw casual parrot ..',
      mnemonicDialogLoading: false,
      mnemonicText: '',
      isMnemonicLogin: true,
      mnemonicPin: '',
    }
  },
  computed: {},
  created() {},
  methods: {
    ...mapActions([
      'queryDocuments',
      'clearSession',
      'freshLoginPins',
      'addCurrentAccoint',
      'getCurPubKey',
    ]),
    async login() {
      await this.clearSession()
      await this.$store.dispatch('setAndEncMnemonic', {
        mnemonic: this.mnemonicText,
        pin: this.mnemonicPin,
      })
      console.log('calling initorcreateaccount')
      await this.$store.dispatch('initOrCreateAccount', {
        mnemonicPin: this.mnemonicPin,
      })
      const pubkey = await this.getCurPubKey()
      console.log('awaited init')
      const queryOpts = {
        limit: 1,
        startAt: 1,
        where: [['pubkey', '==', pubkey]],
      } // derive pubkey
      const documents = await this.queryDocuments({
        dappName: 'users',
        typeLocator: 'Users',
        queryOpts,
      })
      console.log(documents)
      const [userDoc] = documents

      console.log('Restoring from mnemonic via userhashmap', userDoc)
      // FXIME sort out which are actually async and are causing race conditions

      // this.$store.commit('setMnemonicAsIs', account.mnemonic)
      await this.$store.commit('setIdentity', userDoc.data.identityId)
      console.log('using name', userDoc.data.name)
      await this.$store.commit('setName', userDoc.data.name)
      await this.$store.commit('setNameRegistered', true)
      await this.$store.commit('setNameDocId', userDoc.data.dpnsDocId)

      // Add recovered User to accounts
      const { state } = this.$store
      const account = {}
      console.log('add current account', state.mnemonic)
      account.mnemonic = state.mnemonic
      account.identityId = state.identityId
      account.docId = state.name.docId
      account.label = state.name.label
      this.$store.commit('addAccount', account)

      await this.$store.commit('resetCurActionRequest')
      await this.freshLoginPins()
      // this.drawer = false
      // this.overlayUnlock = true
      // NEED TO ADD AN ACCOUNT
      // const account = this.$store.state.accounts[i]
      // TODO replace with setAccount action
      // console.log(account)
      // console.log(account.mnemonic)
      this.$router.push(`/home`)
      // this.drawer = false
      console.log('state is now', this.$store.state)

      this.mnemonicPin = ''
      // this.overlayUnlock = false
    },
  },
}
</script>
