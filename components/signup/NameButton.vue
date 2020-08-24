<template>
  <v-btn
    x-large
    class="mx-auto mb-4"
    color="primary"
    :disabled="!this.$store.state.name.isValid"
    :loading="this.$store.state.isSyncing"
    @click="signUp()"
  >
    Signup
  </v-btn>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {
    ...mapActions(['registerNameOnceBalance']),
    signUp() {
      this.$store.commit('setSyncing', true)
      this.registerNameOnceBalance()
    },
  },
}
</script>
