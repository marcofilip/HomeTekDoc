<template>
    <v-container>
      <v-form @submit.prevent="submitTecnico">
        <v-text-field v-model="specializzazione" label="Specializzazione" required></v-text-field>
        <v-text-field v-model="esperienza_anni" label="Anni di esperienza" type="number" required></v-text-field>
        <v-text-field v-model="tariffa_oraria" label="Tariffa oraria (€)" type="number" required></v-text-field>
        <v-text-field v-model="disponibilita" label="Disponibilità"></v-text-field>
        <v-textarea v-model="note" label="Note"></v-textarea>
        <v-btn type="submit" color="primary">Completa Registrazione Tecnico</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TecnicoForm',
    data() {
      return {
        specializzazione: '',
        esperienza_anni: null,
        tariffa_oraria: null,
        disponibilita: '',
        note: ''
      }
    },
    methods: {
      async submitTecnico() {
        try {
          // Chiamata API al backend per registrare il tecnico
          const response = await axios.post('http://localhost:3000/tecnici', {
            specializzazione: this.specializzazione,
            esperienza_anni: this.esperienza_anni,
            tariffa_oraria: this.tariffa_oraria,
            disponibilita: this.disponibilita,
            note: this.note
          }, { withCredentials: true });
          
          if (response.data.id) {
            this.$router.push('/'); // o mostrare un messaggio di successo
          }
        } catch (error) {
          console.error("Errore nella registrazione del tecnico:", error);
        }
      }
    }
  }
  </script>
  