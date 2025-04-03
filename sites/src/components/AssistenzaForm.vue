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
// Rimosso: import axios from 'axios';

export default {
  name: 'AssistenzaForm',
  data() {
    // ... (dati esistenti)
  },
  methods: {
    submitRequest() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;

      const payload = {
        description: this.description,
        urgente: this.urgent,
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/assistenza', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
           if (xhr.status >= 200 && xhr.status < 300) {
              const responseData = JSON.parse(xhr.responseText);
              if (responseData.message) {
                 this.$emit('requestSent', responseData); // Emette l'evento al genitore
                 // Reset form
                 this.description = '';
                 this.urgent = false;
                 if (this.$refs.form) {
                     this.$refs.form.resetValidation();
                 }
              } else {
                   // Caso strano: successo HTTP ma manca messaggio?
                   console.warn("Richiesta assistenza inviata, ma manca messaggio di conferma nella risposta.");
                   this.$emit('requestSent', { message: 'Richiesta inviata (senza conferma specifica).' }); // Emetti comunque?
              }
           } else {
               console.error("Errore HTTP invio assistenza:", xhr.status, xhr.statusText);
               const errorData = JSON.parse(xhr.responseText);
               this.$emit('requestError', errorData.error || 'Errore sconosciuto'); // Emetti un evento di errore
           }
        } catch(e) {
            console.error("Errore parsing JSON invio assistenza:", e);
            this.$emit('requestError', 'Errore nella risposta del server'); // Emetti errore generico
        } finally {
           this.loading = false;
        }
      };

      xhr.onerror = () => {
        console.error('Errore di rete invio assistenza');
        this.$emit('requestError', 'Errore di rete'); // Emetti errore di rete
        this.loading = false;
      };

      xhr.send(JSON.stringify(payload));
    }
  }
}
</script>

<style scoped>
</style>