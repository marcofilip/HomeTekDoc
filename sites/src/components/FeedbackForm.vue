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
import axios from 'axios';

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
    async submitFeedback() {
      if (!this.rating) {
        return;
      }
      
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:3000/feedback', {
          technician_id: this.technicianId,
          rating: this.rating,
          comment: this.comment
        }, { withCredentials: true });
        
        if (response.data) {
          this.$emit('feedbackSent', {
            success: true,
            message: 'Feedback inviato con successo'
          });
          this.resetForm();
        }
      } catch (error) {
        console.error('Errore durante l\'invio del feedback:', error);
        this.$emit('feedbackSent', {
          success: false,
          message: error.response?.data?.error || 'Errore durante l\'invio del feedback'
        });
      } finally {
        this.loading = false;
      }
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