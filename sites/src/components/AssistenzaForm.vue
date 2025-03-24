<template>
  <v-card>
    <v-card-title>Richiesta di Assistenza</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-textarea
          v-model="description"
          label="Descrivi il problema"
          :rules="[v => !!v || 'Descrizione obbligatoria']"
          required
        ></v-textarea>
        <v-checkbox
          v-model="urgent"
          label="Richiesta Urgente"
        ></v-checkbox>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitRequest" :disabled="!valid || loading">
        <span v-if="!loading">Invia Richiesta</span>
        <span v-else>Invio...</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AssistenzaForm',
  data() {
    return {
      description: '',
      urgent: false,
      valid: false,
      loading: false,
    }
  },
  methods: {
    async submitRequest() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:3000/assistenza', {
          description: this.description,
          urgente: this.urgent,
        }, { withCredentials: true });
        if(response.data.message){
          this.$emit('requestSent', response.data);
          // Puoi anche mostrare una notifica o resettare il form
          this.description = '';
          this.urgent = false;
          this.$refs.form.resetValidation();
        }
      } catch (error) {
        console.error('Errore durante l\'invio della richiesta:', error);
        // Gestisci l'errore (es. mostrando uno snackbar)
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Eventuali stili personalizzati */
</style>