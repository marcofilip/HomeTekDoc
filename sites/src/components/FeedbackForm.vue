<template>
  <v-card>
    <v-card-title>Valuta il tecnico</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-row class="mb-3">
          <v-col cols="12" class="text-center">
            <v-rating
              v-model="rating"
              color="amber"
              half-increments
              hover
              length="5"
              size="large"
              :rules="[v => !!v || 'Una valutazione è richiesta']"
              required
            ></v-rating>
          </v-col>
        </v-row>
        <v-textarea
          v-model="comment"
          label="Commento (opzionale)"
          rows="3"
        ></v-textarea>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitFeedback" :disabled="!valid || loading">
        <span v-if="!loading">Invia Feedback</span>
        <span v-else>Invio...</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  name: 'FeedbackForm',
  props: {
    technicianId: {
      type: Number,
      required: true
    },
    technicianName: {
      type: String,
      required: true
    },
    assistenzaId: {
      type: Number,
      required: true // Richiesto per legare il feedback
    }
  },
  data() {
    return {
      rating: 0,
      comment: '',
      valid: false,
      loading: false
    }
  },
  methods: {
    submitFeedback() {
      // La validazione v-rating dovrebbe essere gestita dal :rules nel template,
      // ma un controllo extra non fa male
      if (!this.rating || this.rating < 0.5) { // v-rating con half-increments può dare 0.5
        // Potremmo mostrare un messaggio o semplicemente non fare nulla
        console.warn("Rating non valido selezionato.");
        return;
      }
      if(!this.$refs.form.validate()) return; // Usa la validazione del form

      this.loading = true;

      const payload = {
        technician_id: this.technicianId,
        rating: this.rating,
        comment: this.comment,
        assistenza_id: this.assistenzaId // Aggiunto ID assistenza
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/feedback', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
            if (xhr.status >= 200 && xhr.status < 300) {
                const responseData = JSON.parse(xhr.responseText);
                this.$emit('feedbackSent', {
                    success: true,
                    message: responseData.message || 'Feedback inviato con successo'
                });
                this.resetForm();
            } else {
                 console.error("Errore HTTP invio feedback:", xhr.status, xhr.statusText);
                 const errorData = JSON.parse(xhr.responseText);
                 this.$emit('feedbackSent', { // Usa lo stesso evento ma con success: false
                    success: false,
                    message: errorData.error || 'Errore durante l\'invio del feedback'
                 });
            }
        } catch(e) {
             console.error("Errore parsing JSON invio feedback:", e);
              this.$emit('feedbackSent', {
                 success: false,
                 message: 'Errore nella risposta del server (feedback)'
              });
        } finally {
            this.loading = false;
        }
      };

      xhr.onerror = () => {
         console.error('Errore di rete invio feedback');
         this.$emit('feedbackSent', {
             success: false,
             message: 'Errore di rete'
         });
         this.loading = false;
      };

      xhr.send(JSON.stringify(payload));
    },
    resetForm() {
      this.rating = 0;
      this.comment = '';
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    }
  }
}
</script>