<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col />
      <v-col>
        <v-card class="mx-auto" min-width="600px">
          <v-card-text>
            <Headline class="display-1" />
            <Subline class="headline" />
            <NameField />
          </v-card-text>
          <v-card-actions>
            <NameButton />
          </v-card-actions>
        </v-card>
        <LoginFooter class="mt-6" />
      </v-col>
      <v-col />
    </v-row>
  </v-container>
</template>

<script>
import NameField from './NameField'
import NameButton from './NameButton'
import Headline from './Headline'
import Subline from './Subline'
import LoginFooter from './LoginFooter'

export default {
  components: { NameField, NameButton, Headline, Subline, LoginFooter },
}
</script>
