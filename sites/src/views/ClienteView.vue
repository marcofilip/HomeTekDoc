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
        <!-- AGGIORNAMENTO: Aggiunta colonna Titolo e Nome Tecnico -->
        <v-data-table :headers="assistenzeHeaders" :items="assistenze" :loading="loadingAssistenze" class="elevation-1">
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="getStatusColor(item.raw.status)" small>
              {{ item.raw.status }}
            </v-chip>
          </template>
          <template v-slot:[`item.urgente`]="{ item }">
            <v-icon v-if="item.raw.urgente" color="red">mdi-alert</v-icon>
            <v-icon v-else>mdi-check</v-icon>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
             <!-- Passiamo item.raw che contiene l'oggetto completo -->
            <v-btn small color="primary" text @click="openFeedbackDialog(item.raw)"
              :disabled="item.raw.status !== 'completato' || item.raw.feedbackSent">
              {{ item.raw.feedbackSent ? 'Feedback inviato' : 'Lascia feedback' }}
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
                <v-text-field v-model="nameFilter" append-icon="mdi-magnify" hide-details dense outlined></v-text-field>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Specializzazione:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field v-model="specializzazioneFilter" append-icon="mdi-magnify" hide-details dense
                  outlined></v-text-field>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Disponibilità:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field v-model="disponibilitaFilter" hide-details dense outlined></v-text-field>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-row no-gutters align="center">
              <v-col cols="4">
                <label class="font-weight-medium">Rating minimo:</label>
              </v-col>
              <v-col cols="8">
                <v-text-field v-model="minRatingFilter" type="number" hide-details dense outlined></v-text-field>
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
                <p><v-icon small>mdi-hammer-wrench</v-icon> <strong>Specializzazione:</strong> {{ tech.specializzazione
                }}
                </p>
                <p><v-icon small>mdi-briefcase</v-icon> Esperienza: {{ tech.esperienza_anni || 'N/A' }} anni</p>
                <p><v-icon small>mdi-cash</v-icon> Tariffa: {{ tech.tariffa_oraria || 'N/A' }}€/ora</p>
                <p v-if="tech.disponibilita"><v-icon small>mdi-calendar</v-icon> {{ tech.disponibilita }}</p>
                <p v-if="tech.note" class="mt-2 font-italic">{{ tech.note }}</p>
              </v-card-text>
              <v-card-actions>
                 <!-- Passa l'intero oggetto tech -->
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
      <!-- Assicurati che selectedAssistenza abbia technician_id e technician_name -->
      <FeedbackForm v-if="selectedAssistenza.technician_id"
        :technicianId="selectedAssistenza.technician_id"
        :technicianName="selectedAssistenza.technician_name || 'Tecnico'"
        @feedbackSent="handleFeedbackSent" />
       <v-card v-else>
           <v-card-text>Dati tecnico mancanti per il feedback.</v-card-text>
       </v-card>
    </v-dialog>

    <!-- Dialog per la richiesta di assistenza -->
    <v-dialog v-model="assistanceDialog" max-width="500px">
      <v-card v-if="selectedTechnician.id"> <!-- Aggiunto v-if per sicurezza -->
        <v-card-title>Richiesta di Assistenza</v-card-title>
        <v-card-text>
          <v-form ref="assistanceForm" v-model="assistanceFormValid">
            <p class="mb-4">Stai richiedendo assistenza a: <strong>{{ selectedTechnician.nome }}</strong> ({{
              selectedTechnician.specializzazione }})</p>

            <!-- NUOVO CAMPO TITOLO -->
            <v-text-field
              v-model="assistanceTitle"
              label="Titolo Richiesta"
              :rules="[v => !!v || 'Titolo obbligatorio']"
              required
              outlined
              class="mb-4"
            ></v-text-field>
            <!-- FINE NUOVO CAMPO TITOLO -->

            <v-textarea v-model="assistanceDescription" label="Descrivi il problema"
              :rules="[v => !!v || 'Descrizione obbligatoria']" required rows="4" outlined></v-textarea>

            <v-checkbox v-model="assistanceUrgent" label="Richiesta Urgente"></v-checkbox>
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

export default {
  name: 'ClienteView',
  components: {
    TechnicianMap,
    FeedbackForm
  },
  data() {
    return {
      technicians: [],
      nameFilter: '',
      specializzazioneFilter: '',
      disponibilitaFilter: '',
      minRatingFilter: '',
      clientLocation: null,
      loading: false,
      error: null,

      assistenze: [],
      loadingAssistenze: false,
      // AGGIORNAMENTO HEADERS TABELLA ASSISTENZE
      assistenzeHeaders: [
        { title: 'Data', key: 'created_at', sortable: true },
        { title: 'Titolo', key: 'title', sortable: true }, // Aggiunto Titolo
        { title: 'Tecnico', key: 'technician_name', sortable: true }, // Aggiunto Tecnico
        { title: 'Urgente', key: 'urgente', sortable: false },
        { title: 'Stato', key: 'status', sortable: true },
        { title: 'Azioni', key: 'actions', sortable: false }
        // Rimosso descrizione per brevità, può essere in un dettaglio
      ],
      // FINE AGGIORNAMENTO HEADERS

      feedbackDialog: false,
      selectedAssistenza: {}, // Conterrà l'oggetto assistenza completo

      assistanceDialog: false,
      selectedTechnician: {}, // Conterrà l'oggetto tecnico completo
      assistanceTitle: '', // NUOVO: v-model per il titolo
      assistanceDescription: '',
      assistanceUrgent: false,
      assistanceFormValid: false,
      assistanceLoading: false,

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
    fetchTechnicians() {
      this.loading = true;
      this.error = null;
      const params = new URLSearchParams();
      if (this.specializzazioneFilter) params.append("specializzazione", this.specializzazioneFilter);
      if (this.disponibilitaFilter) params.append("disponibilita", this.disponibilitaFilter);
      if (this.minRatingFilter) params.append("min_rating", this.minRatingFilter);
      if (this.clientLocation) {
        params.append("client_lat", this.clientLocation.lat);
        params.append("client_lng", this.clientLocation.lng);
      }
      const url = `/tecnici?${params.toString()}`;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            this.technicians = (data.tecnici || []).map(tech => ({ // Aggiunto controllo || []
              ...tech,
              latitudine: parseFloat(tech.latitudine) || null,
              longitudine: parseFloat(tech.longitudine) || null
            }));
          } else {
            console.error('Errore HTTP fetchTechnicians:', xhr.status, xhr.statusText);
            this.error = `Errore ${xhr.status} nel caricamento dei tecnici`;
            this.technicians = []; // Svuota in caso di errore
          }
        } catch (e) {
          console.error('Errore parsing JSON fetchTechnicians:', e);
          this.error = 'Errore nella risposta del server (tecnici)';
          this.technicians = [];
        } finally {
          this.loading = false;
        }
      };

      xhr.onerror = () => {
        console.error('Errore di rete fetchTechnicians');
        this.error = 'Errore di rete nel caricamento dei tecnici';
        this.technicians = [];
        this.loading = false;
      };

      xhr.send();
    },

    fetchAssistenze() {
      this.loadingAssistenze = true;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/assistenze', true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
             // AGGIORNAMENTO: ora riceviamo technician_id e technician_name
            this.assistenze = data.assistenze || []; // Il backend già mappa bene
          } else {
            console.error('Errore HTTP fetchAssistenze:', xhr.status, xhr.statusText);
            this.showSnackbar('Impossibile caricare le assistenze', 'error');
            this.assistenze = [];
          }
        } catch (e) {
          console.error('Errore parsing JSON fetchAssistenze:', e);
          this.showSnackbar('Errore nella risposta del server (assistenze)', 'error');
          this.assistenze = [];
        } finally {
          this.loadingAssistenze = false;
        }
      };
      xhr.onerror = () => {
         console.error('Errore di rete fetchAssistenze');
         this.showSnackbar('Errore di rete nel caricamento delle assistenze', 'error');
         this.assistenze = [];
         this.loadingAssistenze = false;
       };
      xhr.send();
    },

    getClientLocation() {
      // Step 1: Get profile
      const profileXhr = new XMLHttpRequest();
      profileXhr.open('GET', '/auth/profile', true);
      profileXhr.withCredentials = true;

      profileXhr.onload = () => {
        if (profileXhr.status >= 200 && profileXhr.status < 300) {
          try {
            const profileData = JSON.parse(profileXhr.responseText);
            if (profileData && profileData.user) {
              const userAddress = `${profileData.user.indirizzo}, ${profileData.user.citta}`;

              // Step 2: Geocode address
              const geocodeXhr = new XMLHttpRequest();
              const geocodeUrl = `/geocode?address=${encodeURIComponent(userAddress)}`;
              geocodeXhr.open('GET', geocodeUrl, true);
              geocodeXhr.withCredentials = true; // Anche se forse non serve per geocode

              geocodeXhr.onload = () => {
                if (geocodeXhr.status >= 200 && geocodeXhr.status < 300) {
                  try {
                    const geocodeData = JSON.parse(geocodeXhr.responseText);
                    if (geocodeData && geocodeData.lat && geocodeData.lng) {
                      this.clientLocation = {
                        lat: geocodeData.lat,
                        lng: geocodeData.lng
                      };
                      this.fetchTechnicians(); // Richiama con la nuova posizione
                    } else {
                      console.warn("Geocoding non ha restituito coordinate valide.");
                    }
                  } catch (e) {
                    console.error("Errore parsing JSON geocode:", e);
                  }
                } else {
                  console.error("Errore HTTP geocode:", geocodeXhr.status, geocodeXhr.statusText);
                }
              };
              geocodeXhr.onerror = () => console.error("Errore di rete geocode.");
              geocodeXhr.send();

            } else {
              console.warn("Dati profilo utente non trovati.");
            }
          } catch (e) {
            console.error("Errore parsing JSON profilo:", e);
          }
        } else {
          console.error("Errore HTTP profilo:", profileXhr.status, profileXhr.statusText);
        }
      };
      profileXhr.onerror = () => console.error("Errore di rete profilo.");
      profileXhr.send();
    },

    submitAssistanceRequest() {
      if (!this.$refs.assistanceForm.validate()) return;

      this.assistanceLoading = true;
      // AGGIORNAMENTO PAYLOAD
      const payload = {
          description: this.assistanceDescription,
          urgente: this.assistanceUrgent,
          technician_id: this.selectedTechnician.id, // Assicurati che l'ID sia corretto
          title: this.assistanceTitle // Aggiunto titolo
      };
      // FINE AGGIORNAMENTO PAYLOAD

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/assistenza', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;

      xhr.onload = () => {
         try {
            if (xhr.status >= 200 && xhr.status < 300) { // Controlla anche 201
                const responseData = JSON.parse(xhr.responseText);
                this.showSnackbar(responseData.message || 'Richiesta inviata con successo', 'success');

                // AGGIORNAMENTO MAILTO: Includi il titolo
                const mailtoUrl = `mailto:${this.selectedTechnician.email}?subject=${encodeURIComponent(this.assistanceTitle)}&body=Salve ${this.selectedTechnician.nome},%0D%0A%0D%0ASono un cliente HomeTekDoc e vorrei richiedere la sua assistenza per:%0D%0A${encodeURIComponent(this.assistanceTitle)}%0D%0A%0D%0A${encodeURIComponent(this.assistanceDescription)}%0D%0A%0D%0ATipo di assistenza: ${this.assistanceUrgent ? 'Urgente' : 'Standard'}%0D%0A%0D%0AGrazie,%0D%0A[Il tuo nome]`;
                window.location.href = mailtoUrl;
                // FINE AGGIORNAMENTO MAILTO

                this.assistanceDialog = false;
                this.fetchAssistenze();
            } else {
                 console.error("Errore HTTP submitAssistanceRequest:", xhr.status, xhr.statusText);
                 const errorData = JSON.parse(xhr.responseText);
                 this.showSnackbar(errorData.error || 'Errore nell\'invio della richiesta', 'error');
            }
         } catch(e) {
              console.error("Errore parsing JSON submitAssistanceRequest:", e);
              this.showSnackbar('Errore nella risposta del server (assistenza)', 'error');
         } finally {
              this.assistanceLoading = false;
         }
      };
      xhr.onerror = () => {
          console.error('Errore di rete submitAssistanceRequest');
          this.showSnackbar('Errore di rete nell\'invio della richiesta', 'error');
          this.assistanceLoading = false;
      };
      xhr.send(JSON.stringify(payload));
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
      this.selectedAssistenza = { ...assistenza }; // Copia per evitare mutazioni accidentali
      this.feedbackDialog = true;
    },

    handleFeedbackSent(result) {
      this.feedbackDialog = false;
      if (result.success) {
        this.showSnackbar('Feedback inviato con successo', 'success');
        this.fetchAssistenze();
      } else {
        this.showSnackbar(result.message || 'Errore nell\'invio del feedback', 'error');
      }
    },

    // Nuovo metodo per aprire il dialog di richiesta assistenza
    // AGGIORNAMENTO: Passa l'intero oggetto tecnico
    openAssistanceDialog(technician) {
      this.selectedTechnician = { ...technician }; // Copia
      this.assistanceTitle = ''; // Resetta titolo
      this.assistanceDescription = '';
      this.assistanceUrgent = false;
      this.assistanceDialog = true;
      this.$nextTick(() => { // Assicura che il form sia nel DOM prima di resettare la validazione
           if (this.$refs.assistanceForm) {
              this.$refs.assistanceForm.resetValidation();
           }
      });
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