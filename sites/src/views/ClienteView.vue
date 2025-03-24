<template>
  <v-container>
    <h1 class="text-h3 text-center mb-6">Benvenuto Cliente</h1>

    <!-- Sezione per la richiesta di assistenza -->
    <v-row class="mb-6" justify="center">
      <v-col cols="12" sm="8" md="6">
        <AssistenzaForm @requestSent="handleRequestSent"/>
      </v-col>
    </v-row>

    <!-- Resto della vista, ad esempio la mappa e l'elenco dei tecnici -->
    <v-card class="mb-6">
      <v-card-title>
        Trova un Tecnico
        <v-spacer></v-spacer>
        <!-- Campi filtro -->
        <v-text-field
          v-model="specializzazioneFilter"
          append-icon="mdi-magnify"
          label="Cerca per specializzazione"
          single-line
          hide-details
          class="mx-2"
        ></v-text-field>
        <v-text-field
          v-model="disponibilitaFilter"
          label="Disponibilità"
          single-line
          hide-details
          class="mx-2"
        ></v-text-field>
        <v-text-field
          v-model="minRatingFilter"
          label="Valutazione minima"
          type="number"
          single-line
          hide-details
          class="mx-2"
        ></v-text-field>
      </v-card-title>

      <v-card-text>
        <!-- Componente Mappa -->
        <technician-map :technicians="technicians" :clientLocation="clientLocation" class="mb-4"></technician-map>
        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="tech in tecniciFiltrati" :key="tech.id" class="pa-2">
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
                <v-btn text color="primary" :href="`mailto:${tech.email}?subject=Richiesta di assistenza&body=Ciao ${tech.nome},%0D%0AVorrei richiedere assistenza per...`">
                  Contatta
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert v-if="tecniciFiltrati.length === 0" type="info" text class="mt-4">
          Nessun tecnico trovato con questa specializzazione.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import TechnicianMap from '@/components/TechnicianMap.vue';
import AssistenzaForm from '@/components/AssistenzaForm.vue';

export default {
  name: 'ClienteView',
  components: {
    TechnicianMap,
    AssistenzaForm
  },
  data() {
    return {
      technicians: [],
      specializzazioneFilter: '',
      disponibilitaFilter: '',
      minRatingFilter: '',
      clientLocation: null,
      loading: false,
      error: null
    }
  },
  computed: {
    tecniciFiltrati() {
      return this.technicians;
    }
  },
  mounted() {
    this.fetchTechnicians();
    this.getClientLocation();
  },
  methods: {
    async fetchTechnicians() {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (this.specializzazioneFilter) params.append("specializzazione", this.specializzazioneFilter);
        if (this.disponibilitaFilter) params.append("disponibilita", this.disponibilitaFilter);
        if (this.minRatingFilter) params.append("min_rating", this.minRatingFilter);
        if (this.clientLocation) {
          params.append("client_lat", this.clientLocation.lat);
          params.append("client_lng", this.clientLocation.lng);
        }
        const response = await fetch(`http://localhost:3000/tecnici?${params.toString()}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei tecnici');
        }
        const data = await response.json();
        this.technicians = data.tecnici.map(tech => ({
          ...tech,
          latitudine: parseFloat(tech.latitudine) || null,
          longitudine: parseFloat(tech.longitudine) || null
        }));
      } catch (error) {
        console.error('Error fetching technicians:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    getClientLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.clientLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.fetchTechnicians();
          },
          (error) => {
            console.error("Errore nel rilevare la posizione:", error);
          }
        );
      } else {
        console.warn("Geolocalizzazione non supportata dal browser.");
      }
    },
    handleRequestSent(data) {
      // Puoi mostrare uno snackbar o gestire la notifica della richiesta inviata
      console.log("Richiesta inviata:", data.message);
    }
  },
  watch: {
    specializzazioneFilter: "fetchTechnicians",
    disponibilitaFilter: "fetchTechnicians",
    minRatingFilter: "fetchTechnicians",
  }
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
