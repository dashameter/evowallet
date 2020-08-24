<template>
  <div class="text-center">
    <QReader class="mt-10" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import QReader from '../components/QReader'
// const timestamp = () => Math.floor(Date.now() / 1000)

export default {
  components: { QReader },
  created() {
    if (this.$store.state.name.isRegistered === false)
      window.location.href = '/' // TODO use router
  },
  methods: {
    ...mapActions(['submitDocument', 'freshAddress']),
  },
}
</script>

<style></style>
