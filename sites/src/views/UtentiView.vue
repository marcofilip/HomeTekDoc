<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h3 text-center mb-6">Gestione Utenti</h1>

        <!-- Tabs for Users and Technicians -->
        <v-tabs v-model="activeTab" centered class="mb-6">
          <v-tab>Utenti</v-tab>
          <v-tab>Tecnici</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <!-- Users Tab -->
          <v-tab-item>
            <!-- Users List -->
            <v-card>
              <v-card-title>Lista Utenti</v-card-title>
              <v-card-text>
                <v-list v-if="users.length > 0">
                  <v-list-item v-for="user in users" :key="user.id">
                    <v-list-item-content>
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
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon color="error" @click="confirmDelete(user.id)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
                <v-alert v-else type="info" text>
                  Nessun utente trovato!
                </v-alert>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <!-- Technicians Tab -->
          <v-tab-item>
            <v-card>
              <v-card-title>
                Lista Tecnici
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="techSearch"
                  append-icon="mdi-magnify"
                  label="Cerca per specializzazione"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="techHeaders"
                  :items="technicians"
                  :search="techSearch"
                  :loading="loadingTechnicians"
                  class="elevation-1"
                > 
                <!--eslint-disable-next-line--> 
                  <template #item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editTechnician(item)">
                      mdi-pencil
                    </v-icon>
                    <v-icon small @click="confirmDeleteTechnician(item.id)">
                      mdi-delete
                    </v-icon>
                  </template>
                  <template #no-data>
                    <v-alert type="info" class="ma-0">
                      Nessun tecnico trovato
                    </v-alert>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
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
        { text: 'Nome', value: 'nome' },
        { text: 'Specializzazione', value: 'specializzazione' },
        { text: 'Esperienza (anni)', value: 'esperienza_anni' },
        { text: 'Tariffa (€/h)', value: 'tariffa_oraria' },
        { text: 'Email', value: 'email' },
        { text: 'Città', value: 'citta' },
        { text: 'Azioni', value: 'actions', sortable: false }
      ],
      deleteTechDialog: false,
      technicianToDelete: null
    }
  },
  mounted() {
    this.loadUsers();
    this.loadTechnicians();
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
        if (!response.ok) throw new Error('Errore nel caricamento degli utenti')
        const data = await response.json()
        console.log("Fetched data: ", data);

        this.users = data.utenti.map(user => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          citta: user.citta,
          indirizzo: user.indirizzo,
          role: user.role
        }));

      } catch (error) {
        console.error('Load users error:', error)
        this.showSnackbar('Errore nel caricamento degli utenti', 'error')
      }
    },

    async loadTechnicians() {
      this.loadingTechnicians = true;
      try {
        const response = await fetch('http://localhost:3000/tecnici', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Errore nel caricamento dei tecnici');
        }

        const data = await response.json();
        this.technicians = data.tecnici;
      } catch (error) {
        console.error('Load technicians error:', error);
        this.showSnackbar('Errore nel caricamento dei tecnici', 'error');
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
    }
  }
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}
</style>