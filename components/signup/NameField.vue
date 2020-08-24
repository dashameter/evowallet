<template>
  <v-text-field
    v-model="name"
    single
    label="Choose username"
    :value="this.$store.state.name.label"
    :disabled="this.$store.state.isSyncing"
    :rules="nameRules"
    :error-messages="nameErrors"
    :success-messages="nameSuccess"
    :messages="nameMessages"
    @keyup="validateName($event)"
  />
</template>

<script>
import { mapActions } from 'vuex'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
export default {
  components: {},
  data() {
    return {
      name: '',
      nameErrors: [],
      nameSuccess: [],
      nameMessages: [],
      nameRules: [
        (v) => !!v || 'Be yourself, choose name.',
        (v) => (!!v && v.length < 64) || 'Name can be max 63 characters.',
        (v) =>
          /^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])$/.test(v) ||
          'Name can consists of A-Z,  0-9 and - within the name',
      ],
    }
  },
  computed: {},
  async created() {
    this.name = this.$store.state.name.label
    if (this.$route.query.name) {
      // this.$store.dispatch('initOrCreateAccount', { mnemonicPin: '' })
      await sleep(1000)
      this.name = this.$route.query.name
      this.validateName({})
    }
  },
  methods: {
    ...mapActions(['dashNameExists', 'registerNameOnceBalance']),
    signUp() {
      console.log('signup')
      console.log(this.$store.state.name.isValid)
      if (this.$store.state.name.isValid) {
        this.$store.commit('setSyncing', true)
        this.registerNameOnceBalance()
      }
    },
    async validateName(event) {
      this.nameErrors = []
      this.nameSuccess = []
      this.nameMessages = []

      // Save v-model value in store.state
      // TODO replace with get / set
      this.setName(this.name)

      // Set invalid until proven valid
      this.$store.commit('setNameValid', false)

      // Clear old timeouts so we don't hit dapi with stale requests
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      // Debounce typing input
      this.timer = setTimeout(() => {
        if (
          this.name &&
          /^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])$/.test(this.name) &&
          this.name.length < 64
        )
          this.checkIfNameExists(this.name, event)
      }, 300)
    },
    async checkIfNameExists(searchName, event) {
      console.log('Checking if name is taken: ', searchName)
      // Did the user change the name since the last debounce interval? Then return early..
      if (this.name !== searchName) return

      // Hit dapi to check if dpns name exists
      this.nameMessages = ['Checking if name is taken..']
      const nameExists = await this.dashNameExists(searchName)

      // Did the user change the name since hitting dapi? Return early..
      if (this.name !== searchName) return

      // Name exists or it doesn't :-)
      if (nameExists) {
        this.nameErrors = [
          `${searchName} exists, please choose a different name`,
        ]
        this.nameSuccess = []
        this.$store.commit('setNameValid', false)
        this.setName(this.name)
      } else {
        this.nameErrors = []
        this.nameSuccess = [`${searchName} is available, go ahead and register`]
        this.$store.commit('setNameValid', true)
        this.setName(this.name)
        if (event.keyCode === 13) this.signUp()
      }
    },
    setName(name) {
      this.$store.commit('setName', name)
    },
  },
}
</script>
