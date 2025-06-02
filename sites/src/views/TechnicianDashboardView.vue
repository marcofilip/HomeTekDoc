<template>
    <v-container>
      <h1 class="text-h4 mb-6">Dashboard Tecnico - Richieste Assegnate</h1>
  
      <v-card>
        <v-card-title>
          Le Mie Richieste
          <v-spacer></v-spacer>
          <v-btn color="primary" icon @click="fetchAssignedRequests" :loading="loadingRequests">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="requestHeaders"
            :items="assignedRequests"
            :loading="loadingRequests"
            class="elevation-1"
            item-value="id"
          >
            <!-- Slot per visualizzare lo stato con chip colorati -->
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.raw.status)" small>
                {{ item.raw.status }}
              </v-chip>
            </template>
  
            <!-- Slot per visualizzare flag urgente -->
             <template v-slot:[`item.urgente`]="{ item }">
              <v-icon v-if="item.raw.urgente" color="red">mdi-alert-octagon</v-icon>
              <span v-else>-</span>
            </template>
  
            <!-- Slot per le azioni -->
            <template v-slot:[`item.actions`]="{ item }">
              <!-- Bottone "Inizia" -->
              <v-btn
                v-if="item.raw.status === 'da iniziare'"
                color="blue"
                small text
                @click="updateRequestStatus(item.raw, 'in corso')"
                :loading="loadingAction === item.raw.id + '-start'"
              >
                <v-icon left small>mdi-play</v-icon>
                Inizia
              </v-btn>
  
              <!-- Bottone "Completa" -->
              <v-btn
                v-if="item.raw.status === 'in corso'"
                color="green"
                small text
                @click="updateRequestStatus(item.raw, 'completato')"
                 :loading="loadingAction === item.raw.id + '-complete'"
              >
                <v-icon left small>mdi-check</v-icon>
                Completa
              </v-btn>
  
               <!-- Bottone "Annulla" (Opzionale) -->
               <v-btn
                 v-if="item.raw.status === 'da iniziare' || item.raw.status === 'in corso'"
                 color="red"
                 small text
                 @click="updateRequestStatus(item.raw, 'annullata')"
                 :loading="loadingAction === item.raw.id + '-cancel'"
               >
                 <v-icon left small>mdi-cancel</v-icon>
                 Annulla
               </v-btn>
            </template>
  
            <!-- Messaggio se non ci sono richieste -->
            <template v-slot:no-data>
              <v-alert type="info" class="ma-0">
                Nessuna richiesta di assistenza assegnata al momento.
              </v-alert>
            </template>
  
          </v-data-table>
        </v-card-text>
      </v-card>
  
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
  export default {
    name: 'TechnicianDashboardView',
    data() {
      return {
        assignedRequests: [],
        loadingRequests: false,
        loadingAction: null, // Per mostrare caricamento su un bottone specifico: "id-azione"
        requestHeaders: [
          { title: 'Data Richiesta', key: 'created_at', sortable: true },
          { title: 'Titolo', key: 'title', sortable: true },
          { title: 'Cliente', key: 'customer_name', sortable: true },
          { title: 'Telefono Cliente', key: 'customer_phone', sortable: false },
          { title: 'Indirizzo', key: 'customer_address', sortable: false },
          { title: 'Città', key: 'customer_city', sortable: false },
          { title: 'Urgente', key: 'urgente', sortable: false, align: 'center' },
          { title: 'Stato', key: 'status', sortable: true },
          { title: 'Azioni', key: 'actions', sortable: false },
        ],
        snackbar: {
          show: false,
          text: '',
          color: 'success'
        }
      }
    },
    mounted() {
      this.fetchAssignedRequests();
    },
    methods: {
      fetchAssignedRequests() {
        this.loadingRequests = true;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/tecnici/me/assistenze', true);
        xhr.withCredentials = true; // Necessario per inviare il cookie di sessione
  
        xhr.onload = () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              this.assignedRequests = data.assistenze || [];
            } else if (xhr.status === 401 || xhr.status === 403) {
               console.error('Errore Autorizzazione fetchAssignedRequests:', xhr.status);
               this.showSnackbar('Accesso non autorizzato.', 'error');
               this.$router.push('/login'); // Reindirizza se non autorizzato
            } else {
              console.error('Errore HTTP fetchAssignedRequests:', xhr.status, xhr.statusText);
              this.showSnackbar('Errore nel caricamento delle richieste assegnate', 'error');
              this.assignedRequests = [];
            }
          } catch (e) {
            console.error('Errore parsing JSON fetchAssignedRequests:', e);
            this.showSnackbar('Errore nella risposta del server (richieste tecnico)', 'error');
            this.assignedRequests = [];
          } finally {
            this.loadingRequests = false;
          }
        };
  
        xhr.onerror = () => {
          console.error('Errore di rete fetchAssignedRequests');
          this.showSnackbar('Errore di rete nel caricamento delle richieste', 'error');
          this.assignedRequests = [];
          this.loadingRequests = false;
        };
  
        xhr.send();
      },
  
      updateRequestStatus(request, newStatus) {
        const actionType = newStatus === 'in corso' ? 'start' : (newStatus === 'completato' ? 'complete' : 'cancel');
        this.loadingAction = `${request.id}-${actionType}`; // Imposta ID univoco per il loading del bottone
  
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `/assistenze/${request.id}/status`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
  
        xhr.onload = () => {
           try {
              if (xhr.status >= 200 && xhr.status < 300) {
                  const responseData = JSON.parse(xhr.responseText);
                  this.showSnackbar(responseData.message || `Stato aggiornato a ${newStatus}`, 'success');
                  this.fetchAssignedRequests(); // Ricarica la lista per riflettere il cambiamento
              } else {
                   console.error("Errore HTTP updateRequestStatus:", xhr.status, xhr.statusText);
                   const errorData = JSON.parse(xhr.responseText);
                   this.showSnackbar(errorData.error || `Errore aggiornando stato a ${newStatus}`, 'error');
              }
           } catch(e) {
                console.error("Errore parsing JSON updateRequestStatus:", e);
                this.showSnackbar('Errore nella risposta del server (update status)', 'error');
           } finally {
               this.loadingAction = null; // Resetta il loading del bottone
           }
        };
  
         xhr.onerror = () => {
            console.error('Errore di rete updateRequestStatus');
            this.showSnackbar('Errore di rete nell\'aggiornamento dello stato', 'error');
            this.loadingAction = null; // Resetta il loading del bottone
        };
  
        xhr.send(JSON.stringify({ status: newStatus }));
      },
  
      getStatusColor(status) {
        switch (status) {
          case 'da iniziare': return 'grey';
          case 'in corso': return 'blue';
          case 'completato': return 'green';
          case 'annullata': return 'red';
          default: return 'grey';
        }
      },
  
      showSnackbar(text, color) {
        this.snackbar.text = text;
        this.snackbar.color = color;
        this.snackbar.show = true;
      }
    }
  }
  </script>
  
  <style scoped>
  /* Aggiungi stili se necessario */
  </style>