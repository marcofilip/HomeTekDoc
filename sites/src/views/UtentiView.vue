<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h3 text-center mb-6">Gestione Utenti</h1>

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
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
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
  </v-container>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.text }}
    <template v-slot:action="{ attrs }">
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
        role: '' // Ensure role is included
      },
      snackbar: {
        show: false,
        text: '',
        color: ''
      },
      deleteDialog: false,
      userToDelete: null
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {

    showSnackbar(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async loadUsers() {
      try {
        const response = await fetch('http://65.109.163.183:3000/utenti')
        if (!response.ok) throw new Error('Errore nel caricamento degli utenti')
        const data = await response.json()
        console.log("Fetched data: ", data);

        this.users = data.utenti.map(user => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          citta: user.citta,
          indirizzo: user.indirizzo,
          role: user.role // Ensure role is included
        }));

      } catch (error) {
        console.error('Load users error:', error)
        this.showSnackbar('Errore nel caricamento degli utenti', 'error')
      }
    },
    async submitUser() {
      if (!this.$refs.form.validate()) return

      try {
        const response = await fetch('http://65.109.163.183:3000/utenti', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
      console.log('User ID to delete:', id); // Check if the correct ID is passed
      this.userToDelete = id;
      this.deleteDialog = true;
    },

    async deleteUser() {
      try {
        console.log('Deleting user with ID:', this.userToDelete); // Debugging
        const response = await fetch(`http://65.109.163.183:3000/utenti/${this.userToDelete}`, {
          method: 'DELETE'
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
  }
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}
</style>