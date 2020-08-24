<template>
  <v-container fill-height fluid class="backmation">
    <v-row align="center" justify="center">
      <v-img
        justify="center"
        class="text-center"
        max-width="400"
        :src="require('~/assets/white-d-1000.png')"
      >
      </v-img>
      <br />
      <span
        class="display-2"
        style="
          color: #ffffff59;
          font-family: 'Montserrat', sans-serif !important;
        "
      >
        EvoWallet
      </span>
    </v-row>
    <v-row align="center" justify="center"> </v-row>
  </v-container>
</template>
<style scoped>
/* #008de4 */
/* #012060 */
/* #0b0f3b */
/* #111921 */
/* #787878 */
/* #ffffff */

.backmation {
  background: linear-gradient(
    -45deg,
    #111921,
    #0b0f3b,
    #012060,
    #008de4,
    #008de4,
    #ffffff,
    #ffffff
  );
  background-size: 800% 800%;
  animation: gradient 20s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
