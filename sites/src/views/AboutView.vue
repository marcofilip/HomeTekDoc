<template>
  <div class="about">
    <v-row justify="center">
      <v-col cols="12" md="4">
        <v-card class="mt-5 pa-5">
          <v-card-text>
            <v-btn block @click="showPlaceholder('chi')">Chi siamo?</v-btn>
          </v-card-text>
          <v-card-text>
            <v-btn block @click="showPlaceholder('perche')">Cosa ci ha inspirato a creare il sito?</v-btn>
          </v-card-text>
          <v-card-text>
            <v-btn block @click="showPlaceholder('dove')">Dove siamo?</v-btn>
          </v-card-text>
          <v-card-text v-if="placeholderText">
            {{ placeholderText }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      placeholderText: '',
    };
  },
  methods: {
    showPlaceholder(type) {
      switch (type) {
        case 'chi':
          this.placeholderText = 'Siamo...';
          break;
        case 'perche':
          this.placeholderText = 'Ci ha inspirato...';
          break;
        case 'dove':
          this.placeholderText = 'Ci troviamo...';
          break;
        default:
          this.placeholderText = '';
      }
    },
  },
};
</script>