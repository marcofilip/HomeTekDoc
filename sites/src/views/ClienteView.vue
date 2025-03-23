<template>
  <v-container>
    <h1 class="text-h3 text-center mb-6">Benvenuto Cliente</h1>

    <v-card class="mb-6">
      <v-card-title>
        Trova un Tecnico
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Cerca per specializzazione"
          single-line
          hide-details
          class="mx-4"
          @input="filterTechnicians"
        ></v-text-field>
      </v-card-title>

      <v-card-text>
        <!-- Componente Mappa -->
        <technician-map :technicians="filteredTechnicians" class="mb-4"></technician-map>

        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="tech in filteredTechnicians" :key="tech.id" class="pa-2">
            <v-card elevation="2" class="h-100">
              <v-card-title class="text-h6">
                {{ tech.nome }}
                <v-chip color="primary" class="ml-2" small>{{ tech.specializzazione }}</v-chip>
              </v-card-title>
              <v-card-text>
                <p><v-icon small>mdi-email</v-icon> {{ tech.email }}</p>
                <p><v-icon small>mdi-map-marker</v-icon> {{ tech.citta }}, {{ tech.indirizzo }}</p>
                <p><v-icon small>mdi-briefcase</v-icon> Esperienza: {{ tech.esperienza_anni || 'N/A' }} anni</p>
                <p><v-icon small>mdi-cash</v-icon> Tariffa: {{ tech.tariffa_oraria || 'N/A' }}€/ora</p>
                <p v-if="tech.disponibilita"><v-icon small>mdi-calendar</v-icon> {{ tech.disponibilita }}</p>
                <p v-if="tech.note" class="mt-2 font-italic">{{ tech.note }}</p>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="primary">
                  Contatta
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="filteredTechnicians.length === 0" type="info" text class="mt-4">
          Nessun tecnico trovato con questa specializzazione.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import TechnicianMap from '@/components/TechnicianMap.vue';

export default {
  name: 'ClienteView',
  components: {
    TechnicianMap
  },
  data() {
    return {
      technicians: [],
      search: '',
      filteredTechnicians: [],
      loading: false,
      error: null
    }
  },
  mounted() {
    this.fetchTechnicians();
  },
  methods: {
    async fetchTechnicians() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:3000/tecnici', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Errore nel caricamento dei tecnici');
        }

        const data = await response.json();
        // Assicurati che i dati dei tecnici includano latitudine e longitudine
        this.technicians = data.tecnici.map(tech => ({
          ...tech,
          latitudine: parseFloat(tech.latitudine) || null,
          longitudine: parseFloat(tech.longitudine) || null
        }));
        this.filteredTechnicians = this.technicians;
      } catch (error) {
        console.error('Error fetching technicians:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    filterTechnicians() {
      if (!this.search) {
        this.filteredTechnicians = this.technicians;
        return;
      }

      const searchTerm = this.search.toLowerCase();
      this.filteredTechnicians = this.technicians.filter(tech => {
        return tech.specializzazione.toLowerCase().includes(searchTerm);
      });
    }
  }
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
