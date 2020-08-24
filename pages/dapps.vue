<template>
  <div>
    <v-btn @click="fetchSignups">Fetch Signups</v-btn>
    <v-btn @click="fetchSignupContracts">Fetch SignupContracts</v-btn>
    <v-card
      v-for="(signup, i) in signups"
      :key="i"
      max-width="344"
      class="mx-auto my-6"
    >
      <v-list-item>
        <v-list-item-avatar>
          <v-img :src="signup.dappIcon"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="headline">{{
            signup.dappName
          }}</v-list-item-title>
          <v-list-item-subtitle>by Publisher</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action color="#008de4">
          <v-btn dark nuxt color="#008de4">
            open
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-card-text>
        These are the dApps that power the tubes.
      </v-card-text>
      <v-card-actions>
        <v-btn text class="signup-actions">
          5 Reviews
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon class="signup-actions">mdi-heart</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon class="signup-actions">mdi-share-variant</v-icon>
        </v-btn>
        <!-- TODO needs remove / uninstall feature -->
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['signups']),
  },
  async created() {
    await this.fetchSignups()
    await this.fetchSignupContracts()
  },
  methods: {
    ...mapActions(['fetchSignups', 'fetchSignupContracts']),
  },
}
</script>

<style scoped>
.signup-actions {
  color: #012060;
}
.signup-actions:hover {
  color: #008de4;
}
</style>
