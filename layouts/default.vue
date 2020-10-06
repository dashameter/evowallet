<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" disable-resize-watcher app>
      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-btn icon color="primary" nuxt @click.stop="addAccount()">
              <v-icon>mdi-plus-circle-outline</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="headline">Accounts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item exact nuxt to="/scanuser">
          <v-list-item-action>
            <v-icon color="green">mdi-qrcode-scan</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Scan User</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item exact nuxt to="/paymentRequestsHistory">
          <v-list-item-action>
            <v-icon color="green">mdi-format-list-bulleted</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Payment History</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item exact nuxt to="/home">
          <v-list-item-action>
            <v-icon color="green">mdi-gesture-tap-button</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>dApp Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="(item, i) in accounts"
          :key="i"
          exact
          @click.stop="unlockPrompt(i)"
        >
          <v-list-item-action>
            <v-icon color="green">{{
              $store.state.name.label === item.label ? 'mdi-check' : ''
            }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.label" />
          </v-list-item-content>
          <v-list-item-action>
            <v-icon color="red" @click.stop="$store.commit('removeAccount', i)"
              >mdi-minus-circle-outline</v-icon
            >
          </v-list-item-action>
        </v-list-item>
        <v-divider />
        <v-list-item
          :disabled="!$store.state.name.isRegistered"
          router
          exact
          @click="logout()"
        >
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app flat color="white" class="text-center">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer />
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
      <a href="./">
        <v-img
          :src="require('~/assets/evo-e-70.png')"
          class="mx-2"
          max-height="30"
          max-width="30"
          contain
        />
      </a>
      <v-toolbar-title
        style="font-family: 'Montserrat', sans-serif; font-size: 1.5rem"
        v-text="title"
      />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <nuxt />
      <v-overlay :value="this.$store.state.isClientError">
        <v-alert prominent type="error">
          <v-row align="center">
            <v-col class="headline"> There was an error: </v-col>
          </v-row>
          <v-row align="center">
            <v-col class="headline">
              {{ this.$store.state.clientErrorMsg }}
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col class="grow">
              Check your Network Connection and try to reload the page.
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col justify="center">
              <v-btn href="/"> Reload </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-overlay>
      <v-overlay :value="overlayUnlock">
        <v-alert light>
          <MnemonicPin
            v-model="mnemonicPin"
            :unlock="true"
            :username="this.$store.state.name.label"
            @enterKey="switchAccount()"
          />
          <v-divider vertical="" />
          <v-row>
            <v-btn class="ml-4" @click="addAccount()">
              Create new account
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn class="mr-4" color="primary" @click="switchAccount()">
              Unlock
            </v-btn>
          </v-row></v-alert
        >
      </v-overlay>

      <v-snackbar v-model="snackbar.show" :top="'top'" :color="snackbar.color">
        {{ snackbar.text }}
        <v-btn dark text @click="snackbar.show = false"> Close </v-btn>
      </v-snackbar>
    </v-content>
    <v-footer padless app color="white">
      <span style="width: 100%" class="text-center">
        {{ new Date().getFullYear() }} —
        <strong><a href="https://dash.org" target="_blank">Dash.org</a></strong>
      </span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MnemonicPin from '../components/MnemonicPin'

export default {
  components: { MnemonicPin },
  data() {
    return {
      drawer: false,
      title: 'EvoWallet',
      snackbar: { show: false, text: '', color: 'red' },
      mnemonicPin: '',
      overlayUnlock: false,
      switchAccountIdx: 0,
    }
  },
  computed: {
    ...mapGetters(['accounts']),
  },
  created() {
    console.log(this.$store.state)
    // debugger
    if (this.$store.state.mnemonic && !this.$route.query.name) {
      this.overlayUnlock = true
    } else {
      this.overlayUnlock = false
      this.$store.dispatch('clearSession')
      this.$store.dispatch('initOrCreateAccount', { mnemonicPin: '' })
    }
    this.$store.watch(
      (state) => state.snackbar.time,
      () => {
        this.snackbar = JSON.parse(JSON.stringify(this.$store.state.snackbar))
      }
    )
  },
  methods: {
    ...mapActions([
      'clearSession',
      'initWallet',
      'registerIdentityOnceBalance',
      'registerIdentity',
      'getMagicInternetMoney',
      'showSnackbar',
      'initOrCreateAccount',
      'freshLoginPins',
    ]),
    unlockPrompt(i) {
      // debugger
      console.log('switching account to', i)
      this.clearSession()
      const account = this.$store.state.accounts[i]
      // TODO replace with setAccount action
      console.log(account)
      console.log(account.mnemonic)
      this.$store.commit('setMnemonicAsIs', account.mnemonic)
      this.$store.commit('setIdentity', account.identityId)
      this.$store.commit('setName', account.label)
      this.$store.commit('setNameRegistered', true)
      this.$store.commit('setNameDocId', account.docId)
      this.$store.commit('resetCurActionRequest')
      this.freshLoginPins()
      this.drawer = false
      this.switchAccountIdx = i
      this.overlayUnlock = true
    },
    switchAccount() {
      this.$router.push('/home')
      this.drawer = false
      console.log('state is not', this.$store.state)
      console.log('calling initorcreateaccount')
      this.$store.dispatch('initOrCreateAccount', {
        mnemonicPin: this.mnemonicPin,
      })
      this.mnemonicPin = ''
      this.overlayUnlock = false
      // this.initOrCreateAccount({ mnemonicPin: '12345' })
    },
    logout() {
      this.clearSession()
      this.$router.replace('/logout')
    },
    async addAccount() {
      this.drawer = false
      this.overlayUnlock = false
      await this.$router.push('/')
      this.clearSession()
      // this.initOrCreateAccount()
      this.$store.dispatch('initOrCreateAccount', { mnemonicPin: '' })
    },
  },
}
</script>
