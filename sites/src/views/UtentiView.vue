<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h3 text-center mb-6">Gestione Utenti</h1>

        <!-- Tabs for Users and Technicians -->
        <v-tabs v-model="activeTab" centered class="mb-6" @change="handleTabChange">
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
                <v-data-table 
                  :headers="techHeaders" 
                  :items="technicians" 
                  :loading="loadingTechnicians"
                  class="elevation-1"
                >
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
    // Non caricare i tecnici qui, lo facciamo quando si cambia tab
  },
  methods: {
    showSnackbar(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async loadUsers() {
      try {
        const response = await fetch('http://localhost:3000/utenti', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Errore nel caricamento degli utenti');
        const data = await response.json();
        console.log("Fetched data: ", data);
        
        // Dividi gli utenti in base al ruolo
        this.clientUsers = data.utenti.filter(user => user.role === 'cliente').map(user => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          citta: user.citta,
          indirizzo: user.indirizzo,
          role: user.role
        }));
        
        this.technicianUsers = data.utenti.filter(user => user.role === 'tecnico').map(user => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          citta: user.citta,
          indirizzo: user.indirizzo,
          role: user.role
        }));
        
        // Per default mostra i clienti
        this.users = this.clientUsers;
      } catch (error) {
        console.error('Load users error:', error);
        this.showSnackbar('Errore nel caricamento degli utenti', 'error');
      }
    },
    
    async loadTechnicians() {
      this.loadingTechnicians = true;
      try {
        // Richiedi i dati dettagliati dei tecnici dal backend
        const response = await fetch('http://localhost:3000/tecnici', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei tecnici dettagliati');
        }
        const data = await response.json();
        console.log("Dettagli tecnici ricevuti:", data.tecnici);

        // Unisci i dati dettagliati ai dati base ottenuti in loadUsers (da technicianUsers)
        const mergedTechnicians = this.technicianUsers.map(baseTech => {
          const detail = data.tecnici.find(dt => dt.auth_user_id === baseTech.id);
          return detail ? { ...baseTech, ...detail } : baseTech;
        });
        
        this.users = mergedTechnicians;
        console.log("Tecnici unificati:", mergedTechnicians);
      } catch (error) {
        console.error('Errore caricamento tecnici:', error);
        this.showSnackbar('Errore nel caricamento dei tecnici', 'error');
        this.users = [];
      } finally {
        this.loadingTechnicians = false;
      }
    },
    
    async submitUser() {
      if (!this.$refs.form.validate()) return

      try {
        const response = await fetch('http://localhost:3000/utenti', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(this.newUser)
        })

        if (!response.ok) throw new Error('Errore nell\'aggiunta dell\'utente')

        this.showSnackbar('Utente aggiunto con successo', 'success')
        this.$refs.form.reset()
        this.newUser = {
          nome: '',
          email: '',
          citta: '',
          indirizzo: '',
          role: '' // Reset role
        }
        await this.loadUsers()
      } catch (error) {
        console.error('Submit user error:', error)
        this.showSnackbar('Errore nell\'aggiunta dell\'utente', 'error')
      }
    },

    confirmDelete(id) {
      console.log('User ID to delete:', id);
      this.userToDelete = id;
      this.deleteDialog = true;
    },

    async deleteUser() {
      try {
        console.log('Deleting user with ID:', this.userToDelete);
        const response = await fetch(`http://localhost:3000/utenti/${this.userToDelete}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Errore nell\'eliminazione dell\'utente');

        this.showSnackbar('Utente eliminato con successo', 'success');
        this.deleteDialog = false;
        await this.loadUsers();
      } catch (error) {
        console.error('Delete user error:', error);
        this.showSnackbar('Errore nell\'eliminazione dell\'utente', 'error');
      }
    },

    editTechnician(technician) {
      // Implement technician editing functionality if needed
      console.log('Edit technician:', technician);
    },

    confirmDeleteTechnician(id) {
      this.technicianToDelete = id;
      this.deleteTechDialog = true;
    },

    async deleteTechnicianConfirmed() {
      try {
        const response = await fetch(`http://localhost:3000/tecnici/${this.technicianToDelete}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Errore nell\'eliminazione del tecnico');
        }

        this.showSnackbar('Tecnico eliminato con successo', 'success');
        this.deleteTechDialog = false;
        await this.loadTechnicians();
      } catch (error) {
        console.error('Delete technician error:', error);
        this.showSnackbar('Errore nell\'eliminazione del tecnico', 'error');
      }
    },

    openEditDialog(user) {
      // Copia i dati dell'utente selezionato in editUserData
      this.editUserData = { ...user };
      this.editDialog = true;
    },

    async updateUser() {
      if (!this.$refs.editForm.validate()) return;
      try {
        const response = await fetch(`http://localhost:3000/utenti/${this.editUserData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nome: this.editUserData.nome,
            email: this.editUserData.email,
            citta: this.editUserData.citta,
            indirizzo: this.editUserData.indirizzo,
          })
        });
        if (response.ok) {
          this.showSnackbar('Utente aggiornato con successo', 'success');
          this.editDialog = false;
          await this.loadUsers();
        } else {
          const data = await response.json();
          this.showSnackbar(data.error || 'Errore nell\'aggiornamento', 'error');
        }
      } catch (error) {
        console.error('Update user error:', error);
        this.showSnackbar('Errore nell\'aggiornamento', 'error');
      }
    },

    openEditTechnicianDialog(tech) {
      // Analogamente, implementa la modifica per i tecnici (eventualmente aprendo un dialog con campi specifici)
      console.log("Modifica tecnico:", tech);
    },
    
    handleTabChange(tabIndex) {
      console.log("Cambio tab a:", tabIndex);
      if (tabIndex === 0) {
        // Mostra la lista dei clienti
        this.users = this.clientUsers;
      } else if (tabIndex === 1) {
        // Carica i dati dei tecnici (basati su technicianUsers)
        this.loadTechnicians();
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