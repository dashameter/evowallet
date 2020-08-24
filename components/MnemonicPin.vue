<template>
  <v-card flat elevation="0">
    <v-card-title>
      <span v-if="unlock" class="headline">Unlock {{ username }}</span>
      <span v-else class="headline">Choose PIN</span>
    </v-card-title>
    <v-card-text>
      <v-alert dense outlined color="blue">
        <div v-if="unlock">
          <strong>Unlock your account:</strong> Enter the PIN you chose during
          Signup / Login to unlock your account.
        </div>
        <div v-else>
          <strong>Encrypt your account:</strong> Choose a PIN to encrypt your
          account while it's stored in the browser.
        </div>
      </v-alert>
      <v-text-field
        v-model="mnemonicPin"
        autofocus=""
        outlined=""
        clearable=""
        counter=""
        label="Enter a PIN or Password"
        @keyup.enter="$emit('enterKey', true)"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    value: { type: String, default: '' },
    username: { type: String, default: '' },
    unlock: Boolean,
  },
  data() {
    return {}
  },
  computed: {
    mnemonicPin: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
  },
}
</script>
