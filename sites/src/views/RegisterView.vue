<template>
  <v-container fluid class="fill-height register-bg">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12" class="rounded-lg">
          <!-- Card Header -->
          <v-card-title class="text-center justify-center py-6">
            <h1 class="font-weight-bold text-h4 primary--text">
              Crea Account
            </h1>
          </v-card-title>

          <!-- Registration Form -->
          <v-card-text>
            <v-form @submit.prevent="register" ref="form">
              <!-- Campi Base -->
              <v-text-field 
                v-model="registerData.username" 
                prepend-inner-icon="mdi-account" 
                label="Username" 
                type="text" 
                outlined dense 
                :rules="[v => !!v || 'Username richiesto']"
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="registerData.nome" 
                prepend-inner-icon="mdi-account-circle" 
                label="Name" 
                type="text" 
                outlined dense 
                :rules="[v => !!v || 'Nome richiesto']" 
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="registerData.email" 
                prepend-inner-icon="mdi-email" 
                label="Email" 
                type="email" 
                outlined dense 
                :rules="[v => !!v || 'Email richiesta']" 
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="registerData.citta" 
                prepend-inner-icon="mdi-city" 
                label="City" 
                type="text" 
                outlined dense 
                :rules="[v => !!v || 'Città richiesta']"
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="registerData.indirizzo" 
                prepend-inner-icon="mdi-map-marker" 
                label="Indirizzo" 
                type="text" 
                outlined dense 
                :rules="[
                  v => !!v || 'Indirizzo richiesto',
                  v => /^[a-zA-Z0-9\s,.'-]{3,}$/.test(v) || 'Inserisci un indirizzo valido.'
                ]"
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="registerData.password" 
                prepend-inner-icon="mdi-lock" 
                label="Password" 
                :type="showPassword ? 'text' : 'password'" 
                outlined dense 
                :rules="[
                  v => !!v || 'Password richiesta',
                  v => v.length >= 6 || 'La password deve avere almeno 6 caratteri.'
                ]"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                class="mb-3">
              </v-text-field>

              <v-text-field 
                v-model="confirmPassword" 
                prepend-inner-icon="mdi-lock-check" 
                label="Confirm Password"
                :type="showPassword ? 'text' : 'password'" 
                outlined dense 
                :rules="[
                  v => !!v || 'Conferma la password.',
                  v => v === registerData.password || 'Le password sono differenti.'
                ]"
                class="mb-3">
              </v-text-field>

              <!-- Selezione Ruolo -->
              <v-select
                v-model="registerData.role"
                :items="roles"
                label="Role"
                outlined dense
                prepend-inner-icon="mdi-account-cog"
                class="mb-3"
              ></v-select>

              <!-- Form aggiuntivi in base al ruolo -->
              <div v-if="registerData.role === 'cliente'">
                <!-- ClienteForm.vue gestisce eventuali dati extra per i clienti -->
                <ClienteForm v-model="clienteData" />
              </div>
              <div v-else-if="registerData.role === 'tecnico'">
                <!-- TecnicoForm.vue gestisce i dati extra per i tecnici -->
                <TecnicoForm v-model="tecnicoData" />
              </div>

              <!-- Bottone di submit -->
              <v-btn type="submit" color="primary" block x-large elevation="2" :loading="loading" class="mt-4">
                Sign Up
              </v-btn>
            </v-form>

            <div class="text-center mt-6">
              <span class="grey--text text--darken-2">Hai già un account?</span>
              <v-btn text color="primary" @click="$router.push('/login')" class="ml-2">
                Accedi
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar per le notifiche -->
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
import ClienteForm from '@/components/ClienteForm.vue'
import TecnicoForm from '@/components/TecnicoForm.vue'

export default {
  name: 'RegisterView',
  components: {
    ClienteForm,
    TecnicoForm
  },
  data() {
    return {
      registerData: {
        username: '',
        password: '',
        nome: '',
        email: '',
        citta: '',
        indirizzo: '',
        role: 'cliente'
      },
      roles: ['cliente', 'tecnico'],
      confirmPassword: '',
      showPassword: false,
      // Oggetti per contenere i dati extra forniti tramite i form dedicati
      clienteData: {},
      tecnicoData: {},
      loading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },
  methods: {
    async register() {
      if (!this.$refs.form.validate()) return;

      if (this.registerData.password !== this.confirmPassword) {
        this.showSnackbarMessage('Le password non corrispondono', 'error');
        return;
      }

      this.loading = true;
      try {
        // Unisci i dati base con quelli extra in base al ruolo
        let payload = { ...this.registerData };

        if (this.registerData.role === 'cliente') {
          payload = { ...payload, ...this.clienteData };
        } else if (this.registerData.role === 'tecnico') {
          payload = { ...payload, ...this.tecnicoData };
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/auth/register', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              this.showSnackbarMessage('La registrazione è avvenuta con successo! Effettua il login.', 'success');
              this.$refs.form.reset();
              this.registerData = {
                username: '',
                password: '',
                nome: '',
                email: '',
                citta: '',
                indirizzo: '',
                role: 'cliente'
              };
              this.clienteData = {};
              this.tecnicoData = {};
              this.confirmPassword = '';
              setTimeout(() => {
                this.$router.push('/login');
              }, 2000);
            } else {
              this.showSnackbarMessage(data.error || 'Registrazione fallita', 'error');
            }
            this.loading = false;
          }
        };

        xhr.send(JSON.stringify(payload));
      } catch (error) {
        this.showSnackbarMessage(error.message, 'error');
        this.loading = false;
      }
    },

    showSnackbarMessage(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  }
}
</script>

<style scoped>
.register-bg {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF000D 100%);
}
</style>
