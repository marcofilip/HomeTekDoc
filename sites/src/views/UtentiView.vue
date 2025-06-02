<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h3 text-center mb-6">Gestione Utenti</h1>

        <!-- Tabs for Users and Technicians -->
        <v-tabs v-model="activeTab" centered class="mb-6"
          @update:modelValue="newValue => { console.log('v-tabs emitted:', newValue); handleTabChange(newValue); }">
          <v-tab>Utenti</v-tab>
          <v-tab>Tecnici</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Users Tab -->
          <v-window-item>
            <v-card>
              <v-card-title>Lista Utenti</v-card-title>
              <v-card-text>
                <v-list v-if="users.length > 0">
                  <v-list-item v-for="user in users" :key="user.id">
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        <v-icon color="white">mdi-account</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">
                      {{ user.nome }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Email: {{ user.email }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      Città: {{ user.citta }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      Ruolo: {{ user.role }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      Indirizzo: {{ user.indirizzo }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-btn icon color="primary" @click="openEditDialog(user)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon color="error" @click="confirmDelete(user.id)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <v-alert v-else type="info" text>
                  Nessun utente trovato!
                </v-alert>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Technicians Tab -->
          <v-window-item>
            <v-card>
              <v-card-title>Lista Tecnici</v-card-title>
              <v-card-text>
                <v-data-table :headers="techHeaders" :items="technicians" :loading="loadingTechnicians"
                  class="elevation-1">
                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon color="primary" size="small" @click="editTechnician(item.raw)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" size="small" @click="confirmDeleteTechnician(item.raw.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:no-data>
                    <v-alert type="info" class="ma-0">
                      Nessun tecnico trovato
                    </v-alert>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- Delete User Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title>Conferma eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare questo utente?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">
            Annulla
          </v-btn>
          <v-btn color="error" text @click="deleteUser">
            Elimina
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Technician Confirmation Dialog -->
    <v-dialog v-model="deleteTechDialog" max-width="300">
      <v-card>
        <v-card-title>Conferma eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare questo tecnico?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteTechDialog = false">
            Annulla
          </v-btn>
          <v-btn color="error" text @click="deleteTechnicianConfirmed">
            Elimina
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit User Dialog -->
    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>
          Modifica Utente
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm" v-model="valid">
            <v-text-field v-model="editUserData.nome" label="Nome"
              :rules="[v => !!v || 'Nome richiesto']"></v-text-field>
            <v-text-field v-model="editUserData.email" label="Email"
              :rules="[v => !!v || 'Email richiesta']"></v-text-field>
            <v-text-field v-model="editUserData.citta" label="Città"
              :rules="[v => !!v || 'Città richiesta']"></v-text-field>
            <v-text-field v-model="editUserData.indirizzo" label="Indirizzo"
              :rules="[v => !!v || 'Indirizzo richiesto']"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">Annulla</v-btn>
          <v-btn color="primary" text @click="updateUser">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.text }}
    <template #action="{ attrs }">
      <v-btn text v-bind="attrs" @click="snackbar.show = false">
        Chiudi
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      newUser: {
        nome: '',
        email: '',
        citta: '',
        indirizzo: '',
        role: ''
      },
      snackbar: {
        show: false,
        text: '',
        color: ''
      },
      deleteDialog: false,
      userToDelete: null,
      activeTab: 0,
      technicians: [],
      techSearch: '',
      loadingUsers: false,
      loadingTechnicians: false,
      techHeaders: [
        { title: 'Nome', key: 'nome' },
        { title: 'Specializzazione', key: 'specializzazione' },
        { title: 'Esperienza (anni)', key: 'esperienza_anni' },
        { title: 'Tariffa (€/h)', key: 'tariffa_oraria' },
        { title: 'Email', key: 'email' },
        { title: 'Città', key: 'citta' },
        { title: 'Azioni', key: 'actions', sortable: false }
      ],
      deleteTechDialog: false,
      technicianToDelete: null,
      editDialog: false,
      editUserData: {},
      valid: false,
      clientUsers: [],
      technicianUsers: [],
    }
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    showSnackbar(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    loadUsers() {
      this.loadingUsers = true;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/utenti', true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            console.log("Fetched data (UtentiView): ", data);
            // Divisione utenti (logica invariata)
            this.clientUsers = (data.utenti || [])
              .filter(user => user.role === 'cliente')
              .map(user => ({ // <-- Ripristina questa funzione
                id: user.id,
                nome: user.nome,
                email: user.email,
                citta: user.citta,
                indirizzo: user.indirizzo,
                role: user.role
              }));

            this.technicianUsers = (data.utenti || [])
              .filter(user => user.role === 'tecnico')
              .map(user => ({ // <-- Ripristina questa funzione
                id: user.id,
                nome: user.nome,
                email: user.email,
                citta: user.citta,
                indirizzo: user.indirizzo,
                role: user.role
              }));
            // Mostra i clienti di default
            this.handleTabChange(this.activeTab); // Chiama handleTabChange per aggiornare this.users
          } else {
            console.error("Errore HTTP loadUsers:", xhr.status, xhr.statusText);
            this.showSnackbar('Errore nel caricamento degli utenti', 'error');
            this.clientUsers = [];
            this.technicianUsers = [];
            this.users = [];
          }
        } catch (e) {
          console.error("Errore parsing JSON loadUsers:", e);
          this.showSnackbar('Errore nella risposta del server (utenti)', 'error');
          this.clientUsers = [];
          this.technicianUsers = [];
          this.users = [];
        } finally {
          this.loadingUsers = false;
        }
      };

      xhr.onerror = () => {
        console.error("Errore di rete loadUsers");
        this.showSnackbar('Errore di rete nel caricamento utenti', 'error');
        this.loadingUsers = false;
      };

      xhr.send();
    },

    loadTechnicians() {
      this.loadingTechnicians = true;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/tecnici', true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            console.log("Dettagli tecnici ricevuti (UtentiView):", data.tecnici);
            // Unisci dati (logica invariata)
            const mergedTechnicians = this.technicianUsers.map(baseTech => {
              const detail = (data.tecnici || []).find(dt => dt.auth_user_id === baseTech.id);
              return detail ? { ...baseTech, ...detail } : baseTech;
            });
            this.technicians = mergedTechnicians; // Aggiorna la lista visualizzata
          } else {
            console.error("Errore HTTP loadTechnicians:", xhr.status, xhr.statusText);
            this.showSnackbar('Errore nel caricamento dei tecnici', 'error');
            this.technicians = [];
          }
        } catch (e) {
          console.error("Errore parsing JSON loadTechnicians:", e);
          this.showSnackbar('Errore nella risposta del server (tecnici)', 'error');
          this.technicians = [];
        } finally {
          this.loadingTechnicians = false;
        }
      };

      xhr.onerror = () => {
        console.error("Errore di rete loadTechnicians");
        this.showSnackbar('Errore di rete nel caricamento tecnici', 'error');
        this.loadingTechnicians = false;
      };

      xhr.send();
    },

    confirmDelete(id) {
      console.log('User ID to delete:', id);
      this.userToDelete = id;
      this.deleteDialog = true;
    },

    deleteUser() {
      console.log('Deleting user with ID:', this.userToDelete);
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', `/utenti/${this.userToDelete}`, true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            this.showSnackbar(data.message || 'Utente eliminato con successo', 'success');
            this.deleteDialog = false;
            this.loadUsers(); // Ricarica utenti dopo eliminazione
          } else {
            console.error("Errore HTTP deleteUser:", xhr.status, xhr.statusText);
            const errorData = JSON.parse(xhr.responseText);
            this.showSnackbar(errorData.error || 'Errore nell\'eliminazione dell\'utente', 'error');
          }
        } catch (e) {
          console.error("Errore parsing JSON deleteUser:", e);
          this.showSnackbar('Errore nella risposta del server (delete user)', 'error');
        } finally {
          // Nascondi dialogo anche in caso di errore? Forse sì.
          this.deleteDialog = false;
        }
      };

      xhr.onerror = () => {
        console.error("Errore di rete deleteUser");
        this.showSnackbar('Errore di rete nell\'eliminazione', 'error');
        this.deleteDialog = false;
      };

      xhr.send();
    },

    editTechnician(technician) {
      // Implement technician editing functionality if needed
      console.log('Edit technician:', technician);
    },

    confirmDeleteTechnician(id) {
      this.technicianToDelete = id;
      this.deleteTechDialog = true;
    },

    deleteTechnicianConfirmed() {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', `/tecnici/${this.technicianToDelete}`, true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            this.showSnackbar(data.message || 'Tecnico eliminato con successo', 'success');
            this.deleteTechDialog = false;
            this.loadUsers(); // Ricarica tutto per aggiornare anche la lista base dei tecnici
          } else {
            console.error("Errore HTTP deleteTechnician:", xhr.status, xhr.statusText);
            const errorData = JSON.parse(xhr.responseText);
            this.showSnackbar(errorData.error || 'Errore nell\'eliminazione del tecnico', 'error');
          }
        } catch (e) {
          console.error("Errore parsing JSON deleteTechnician:", e);
          this.showSnackbar('Errore nella risposta del server (delete tech)', 'error');
        } finally {
          this.deleteTechDialog = false;
        }
      };

      xhr.onerror = () => {
        console.error("Errore di rete deleteTechnician");
        this.showSnackbar('Errore di rete nell\'eliminazione', 'error');
        this.deleteTechDialog = false;
      };

      xhr.send();
    },

    openEditDialog(user) {
      // Copia i dati dell'utente selezionato in editUserData
      this.editUserData = { ...user };
      this.editDialog = true;
    },

    updateUser() {
      if (!this.$refs.editForm.validate()) return;
      const payload = {
        nome: this.editUserData.nome,
        email: this.editUserData.email,
        citta: this.editUserData.citta,
        indirizzo: this.editUserData.indirizzo,
      };

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `/utenti/${this.editUserData.id}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            this.showSnackbar(data.message || 'Utente aggiornato con successo', 'success');
            this.editDialog = false;
            this.loadUsers(); // Ricarica
          } else {
            console.error("Errore HTTP updateUser:", xhr.status, xhr.statusText);
            const errorData = JSON.parse(xhr.responseText);
            this.showSnackbar(errorData.error || 'Errore nell\'aggiornamento', 'error');
          }
        } catch (e) {
          console.error("Errore parsing JSON updateUser:", e);
          this.showSnackbar('Errore nella risposta del server (update user)', 'error');
        }
        // Non chiudere il dialogo in caso di errore? Forse sì
        // this.editDialog = false;
      };

      xhr.onerror = () => {
        console.error("Errore di rete updateUser");
        this.showSnackbar('Errore di rete nell\'aggiornamento', 'error');
      };

      xhr.send(JSON.stringify(payload));
    },

    openEditTechnicianDialog(tech) {
      // Analogamente, implementa la modifica per i tecnici (eventualmente aprendo un dialog con campi specifici)
      console.log("Modifica tecnico:", tech);
    },

    handleTabChange(tabIndex) {
      // Logica leggermente modificata per chiamare loadTechnicians solo se necessario
      console.log("Cambio tab a:", tabIndex);
      if (tabIndex === 0) { // Utenti (Clienti)
        this.users = this.clientUsers;
      } else if (tabIndex === 1) { // Tecnici
        // Mostra i tecnici già caricati se presenti, altrimenti caricali
        if (this.technicianUsers.length > 0 && this.users !== this.technicianUsers) { // Evita ricariche non necessarie
          this.loadTechnicians();
        } else if (this.technicianUsers.length === 0) { // Se non ci sono proprio tecnici base
          this.users = []; // Svuota la lista
        } else {
          // Se this.users sono già i tecnici uniti, non fare nulla
        }
      }
    }
  }
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}
</style>