<template>
  <v-container>
    <h1 class="text-h3 text-center mb-6">Benvenuto Cliente</h1>

    <!-- Sezione Le Mie Assistenze -->
    <v-card class="mb-6">
      <v-card-title>
        Le Mie Assistenze
        <v-spacer></v-spacer>
        <v-btn color="primary" small @click="fetchAssistenze">
          <v-icon left>mdi-refresh</v-icon>
          Aggiorna
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table :headers="assistenzeHeaders" :items="assistenze" :loading="loadingAssistenze" class="elevation-1">
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="getStatusColor(item.status)" small>
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:[`item.urgente`]="{ item }">
            <v-icon v-if="item.urgente" color="red">mdi-alert</v-icon>
            <v-icon v-else>mdi-check</v-icon>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small color="primary" text @click="openFeedbackDialog(item)"
              :disabled="item.status !== 'completata' || item.feedbackSent">
              {{ item.feedbackSent ? 'Feedback inviato' : 'Lascia feedback' }}
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="info" text class="ma-0">
              Non hai ancora richieste di assistenza.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Sezione Trova un Tecnico -->
    <v-card class="mb-6">
      <v-card-title>
        Trova un Tecnico
      </v-card-title>
      
      <!-- Filtri con etichette chiare -->
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Nome:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="nameFilter"
                  append-icon="mdi-magnify"
                  hide-details
                  dense
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Specializzazione:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="specializzazioneFilter"
                  append-icon="mdi-magnify"
                  hide-details
                  dense
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Disponibilità:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="disponibilitaFilter"
                  hide-details
                  dense
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Rating minimo:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="minRatingFilter"
                  type="number"
                  hide-details
                  dense
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

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
                <p><v-icon small>mdi-hammer-wrench</v-icon> <strong>Specializzazione:</strong> {{ tech.specializzazione }}</p>
                <p><v-icon small>mdi-briefcase</v-icon> Esperienza: {{ tech.esperienza_anni || 'N/A' }} anni</p>
                <p><v-icon small>mdi-cash</v-icon> Tariffa: {{ tech.tariffa_oraria || 'N/A' }}€/ora</p>
                <p v-if="tech.disponibilita"><v-icon small>mdi-calendar</v-icon> {{ tech.disponibilita }}</p>
                <p v-if="tech.note" class="mt-2 font-italic">{{ tech.note }}</p>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="primary" block @click="openAssistanceDialog(tech)">
                  <v-icon left>mdi-account-wrench</v-icon>
                  Richiedi Assistenza
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert v-if="tecniciFiltrati.length === 0" type="info" text class="mt-4">
          Nessun tecnico trovato con i filtri selezionati.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog per il feedback -->
    <v-dialog v-model="feedbackDialog" max-width="500px">
      <FeedbackForm :technicianId="selectedAssistenza.technician_id" :technicianName="selectedAssistenza.technicianName"
        @feedbackSent="handleFeedbackSent" />
    </v-dialog>

    <!-- Dialog per la richiesta di assistenza -->
    <v-dialog v-model="assistanceDialog" max-width="500px">
      <v-card>
        <v-card-title>Richiesta di Assistenza</v-card-title>
        <v-card-text>
          <v-form ref="assistanceForm" v-model="assistanceFormValid">
            <p class="mb-4">Stai richiedendo assistenza a: <strong>{{ selectedTechnician.nome }}</strong> ({{ selectedTechnician.specializzazione }})</p>
            
            <v-textarea
              v-model="assistanceDescription"
              label="Descrivi il problema"
              :rules="[v => !!v || 'Descrizione obbligatoria']"
              required
              rows="4"
              outlined
            ></v-textarea>
            
            <v-checkbox
              v-model="assistanceUrgent"
              label="Richiesta Urgente"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="assistanceDialog = false">Annulla</v-btn>
          <v-btn color="primary" :disabled="!assistanceFormValid || assistanceLoading" @click="submitAssistanceRequest">
            <span v-if="!assistanceLoading">Invia Richiesta</span>
            <v-progress-circular v-else indeterminate size="20" width="2" class="mr-2"></v-progress-circular>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar per notifiche -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" bottom>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Chiudi
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import TechnicianMap from '@/components/TechnicianMap.vue';
import FeedbackForm from '@/components/FeedbackForm.vue';
import axios from 'axios';

export default {
  name: 'ClienteView',
  components: {
    TechnicianMap,
    FeedbackForm
  },
  data() {
    return {
      technicians: [],
      // New filter models
      nameFilter: '',
      specializzazioneFilter: '',
      disponibilitaFilter: '',
      minRatingFilter: '',
      clientLocation: null,
      loading: false,
      error: null,

      // Nuovi dati per le assistenze e i feedback
      assistenze: [],
      loadingAssistenze: false,
      assistenzeHeaders: [
        { text: 'Data', value: 'created_at' },
        { text: 'Descrizione', value: 'description' },
        { text: 'Urgente', value: 'urgente' },
        { text: 'Stato', value: 'status' },
        { text: 'Tecnico', value: 'technicianName' },
        { text: 'Azioni', value: 'actions', sortable: false }
      ],
      
      // Per il dialog di feedback
      feedbackDialog: false,
      selectedAssistenza: {},
      
      // Per il dialog di richiesta assistenza
      assistanceDialog: false,
      selectedTechnician: {},
      assistanceDescription: '',
      assistanceUrgent: false,
      assistanceFormValid: false,
      assistanceLoading: false,

      // Per le notifiche
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },
  computed: {
    tecniciFiltrati() {
      return this.technicians.filter(tech => {
        const nameMatch = !this.nameFilter || tech.nome.toLowerCase().includes(this.nameFilter.toLowerCase());
        const specMatch = !this.specializzazioneFilter || tech.specializzazione.toLowerCase().includes(this.specializzazioneFilter.toLowerCase());
        const availMatch = !this.disponibilitaFilter || tech.disponibilita?.toLowerCase().includes(this.disponibilitaFilter.toLowerCase());
        return nameMatch && specMatch && availMatch;
      });
    }
  },
  mounted() {
    this.fetchTechnicians();
    this.getClientLocation();
    this.fetchAssistenze();
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

    // Carica le assistenze dell'utente
    async fetchAssistenze() {
      this.loadingAssistenze = true;
      try {
        const response = await axios.get('http://localhost:3000/assistenze', {
          withCredentials: true
        });
        this.assistenze = response.data.assistenze.map(a => ({
          ...a,
          created_at: new Date(a.created_at).toLocaleString(),
          urgente: Boolean(a.urgente),
          feedbackSent: Boolean(a.feedback_id)
        }));
      } catch (error) {
        console.error('Errore nel recupero delle assistenze:', error);
        this.showSnackbar('Impossibile caricare le assistenze', 'error');
      } finally {
        this.loadingAssistenze = false;
      }
    },

    async getClientLocation() {
      try {
        // First get the current user's profile
        const response = await axios.get('http://localhost:3000/auth/profile', {
          withCredentials: true
        });
        
        if (response.data && response.data.user) {
          const userAddress = `${response.data.user.indirizzo}, ${response.data.user.citta}`;
          
          // Use geocoding to convert address to coordinates
          const geocodeResponse = await axios.get('http://localhost:3000/geocode', {
            params: { address: userAddress },
            withCredentials: true
          });
          
          if (geocodeResponse.data && geocodeResponse.data.lat && geocodeResponse.data.lng) {
            this.clientLocation = {
              lat: geocodeResponse.data.lat,
              lng: geocodeResponse.data.lng
            };
            this.fetchTechnicians();
          }
        }
      } catch (error) {
        console.error("Error getting client location from profile:", error);
      }
    },

    handleRequestSent(data) {
      this.showSnackbar(data.message || 'Richiesta inviata con successo', 'success');
      this.fetchAssistenze(); // Aggiorna la lista delle assistenze
    },

    getStatusColor(status) {
      if (status === 'in attesa') return 'orange';
      if (status === 'in corso') return 'blue';
      if (status === 'completata') return 'green';
      return 'grey';
    },

    openFeedbackDialog(assistenza) {
      this.selectedAssistenza = assistenza;
      this.feedbackDialog = true;
    },

    handleFeedbackSent(result) {
      this.feedbackDialog = false;
      if (result.success) {
        this.showSnackbar('Feedback inviato con successo', 'success');
        this.fetchAssistenze(); // Aggiorna la lista
      } else {
        this.showSnackbar(result.message || 'Errore nell\'invio del feedback', 'error');
      }
    },

    // Nuovo metodo per aprire il dialog di richiesta assistenza
    openAssistanceDialog(technician) {
      this.selectedTechnician = technician;
      this.assistanceDescription = '';
      this.assistanceUrgent = false;
      this.assistanceDialog = true;
    },

    // Nuovo metodo per inviare la richiesta di assistenza
    async submitAssistanceRequest() {
      if (!this.$refs.assistanceForm.validate()) return;

      this.assistanceLoading = true;
      try {
        // Invia la richiesta al backend
        const response = await axios.post('http://localhost:3000/assistenza', {
          description: this.assistanceDescription,
          urgente: this.assistanceUrgent,
          technician_id: this.selectedTechnician.id
        }, { withCredentials: true });

        if (response.data) {
          this.showSnackbar('Richiesta inviata con successo', 'success');
          
          // Apri l'email con il testo del problema
          const mailtoUrl = `mailto:${this.selectedTechnician.email}?subject=Richiesta assistenza tecnica&body=Salve ${this.selectedTechnician.nome},%0D%0A%0D%0ASono un cliente HomeTekDoc e vorrei richiedere la sua assistenza per:%0D%0A%0D%0A${encodeURIComponent(this.assistanceDescription)}%0D%0A%0D%0ATipo di assistenza: ${this.assistanceUrgent ? 'Urgente' : 'Standard'}%0D%0AIndirizzo: ${this.selectedTechnician.citta}%0D%0ADisponibilità: [Indicare quando si è disponibili]%0D%0A%0D%0AGrazie,%0D%0A[Il tuo nome]`;
          
          window.location.href = mailtoUrl;
          
          // Chiudi il dialog e aggiorna le richieste
          this.assistanceDialog = false;
          this.fetchAssistenze();
        }
      } catch (error) {
        console.error('Errore nell\'invio della richiesta:', error);
        this.showSnackbar('Errore nell\'invio della richiesta', 'error');
      } finally {
        this.assistanceLoading = false;
      }
    },

    showSnackbar(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  },
  watch: {
    specializzazioneFilter: "fetchTechnicians",
    disponibilitaFilter: "fetchTechnicians",
    minRatingFilter: "fetchTechnicians",
    nameFilter: "fetchTechnicians"
  }
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>