<template>
  <v-container>
    <h1 class="text-h3 text-center mb-6">Mappa dei Tecnici in Zona</h1>
    <v-text-field v-model="search" append-icon="mdi-magnify" label="Filtra per specializzazione" single-line
      hide-details class="mb-4" @input="filterTechnicians"></v-text-field>
    <technician-map :technicians="filteredTechnicians"></technician-map>
    <v-alert v-if="filteredTechnicians.length === 0" type="info" text class="mt-4">
      Nessun tecnico trovato
    </v-alert>
  </v-container>
</template>

<script>
import TechnicianMap from '@/components/TechnicianMap.vue'

export default {
  name: 'TecnicoView',
  components: { TechnicianMap },
  data() {
    return {
      technicians: [],
      filteredTechnicians: [],
      search: ''
    }
  },
  mounted() {
    this.fetchTechnicians()
  },
  methods: {
    fetchTechnicians() {
      this.loading = true;
      this.error = null;
      const xhr = new XMLHttpRequest();
      // Assumendo che questa vista debba mostrare TUTTI i tecnici (senza filtri avanzati qui)
      xhr.open('GET', 'http://localhost:3000/tecnici', true);
      xhr.withCredentials = true; // Importante se la route /tecnici richiede auth

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            this.technicians = (data.tecnici || []).map(tech => ({
              ...tech,
              latitudine: parseFloat(tech.latitudine) || null,
              longitude: parseFloat(tech.longitudine) || null
            }));
            this.filterTechnicians(); // Filtra dopo aver caricato
          } else {
            console.error("Errore HTTP fetchTechnicians (TecnicoView):", xhr.status, xhr.statusText);
            this.error = `Errore ${xhr.status} nel caricamento dei tecnici`;
            this.technicians = [];
            this.filteredTechnicians = [];
          }
        } catch (e) {
          console.error("Errore parsing JSON fetchTechnicians (TecnicoView):", e);
          this.error = 'Errore nella risposta del server';
          this.technicians = [];
          this.filteredTechnicians = [];
        } finally {
          this.loading = false;
        }
      };

      xhr.onerror = () => {
        console.error("Errore di rete fetchTechnicians (TecnicoView)");
        this.error = 'Errore di rete';
        this.technicians = [];
        this.filteredTechnicians = [];
        this.loading = false;
      };

      xhr.send();
    },
    filterTechnicians() {
      // Logica di filtro rimane invariata, opera su this.technicians
      if (!this.search.trim()) {
        this.filteredTechnicians = this.technicians;
      } else {
        const term = this.search.toLowerCase();
        this.filteredTechnicians = this.technicians.filter(tech =>
          tech.specializzazione && tech.specializzazione.toLowerCase().includes(term) // Aggiunto controllo esistenza
        );
      }
    }
  }
}
</script>

<style scoped></style>