<template>
  <v-container>
    <h1 class="text-h3 text-center mb-6">Mappa dei Tecnici in Zona</h1>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Filtra per specializzazione"
      single-line
      hide-details
      class="mb-4"
      @input="filterTechnicians"
    ></v-text-field>
    <technician-map :technicians="filteredTechnicians"></technician-map>
    <v-alert v-if="filteredTechnicians.length === 0" type="info" text class="mt-4">
      Nessun tecnico trovato
    </v-alert>
  </v-container>
</template>

<script>
import TechnicianMap from '@/components/TechnicianMap.vue'
import axios from 'axios'

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
    async fetchTechnicians() {
      try {
        const response = await axios.get('http://localhost:3000/tecnici', { withCredentials: true })
        // Supponiamo che l'API ritorni un oggetto { tecnici: [...] }
        this.technicians = response.data.tecnici.map(tech => ({
          ...tech,
          latitudine: parseFloat(tech.latitudine) || null,
          longitudine: parseFloat(tech.longitudine) || null
        }))
        this.filteredTechnicians = this.technicians
      } catch (error) {
        console.error("Errore nel caricamento dei tecnici:", error)
      }
    },
    filterTechnicians() {
      if (!this.search.trim()) {
        this.filteredTechnicians = this.technicians
      } else {
        const term = this.search.toLowerCase()
        this.filteredTechnicians = this.technicians.filter(tech =>
          tech.specializzazione.toLowerCase().includes(term)
        )
      }
    }
  }
}
</script>

<style scoped>
</style>