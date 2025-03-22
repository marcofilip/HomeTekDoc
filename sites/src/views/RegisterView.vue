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
              <!-- Username Field -->
              <v-text-field v-model="registerData.username" prepend-inner-icon="mdi-account" label="Username"
                type="text" outlined dense :rules="[v => !!v || 'Username richiesto']" class="mb-3">
              </v-text-field>

              <!-- Name Field -->
              <v-text-field v-model="registerData.nome" prepend-inner-icon="mdi-account-circle" label="Name" type="text"
                outlined dense :rules="[v => !!v || 'Nome richiesto']" class="mb-3">
              </v-text-field>

              <!-- Email Field -->
              <v-text-field v-model="registerData.email" prepend-inner-icon="mdi-email" label="Email" type="email"
                outlined dense :rules="[v => !!v || 'Email richiesta']" class="mb-3">
              </v-text-field>

              <!-- City (Citta) Field -->
              <v-text-field v-model="registerData.citta" prepend-inner-icon="mdi-city" label="City" type="text" outlined
                dense :rules="[v => !!v || 'Città richiesta']" class="mb-3">
              </v-text-field>

              <!-- Indirizzo Field -->
              <v-text-field v-model="registerData.indirizzo" prepend-inner-icon="mdi-map-marker" label="Indirizzo" type="text"
                outlined dense :rules="[
                  v => !!v || 'Indirizzo richiesto',
                  v => /^[a-zA-Z0-9\s,.'-]{3,}$/.test(v) || 'Inserisci un indirizzo valido.'
                ]" class="mb-3">
              </v-text-field>

              <!-- Password Field -->
              <v-text-field v-model="registerData.password" prepend-inner-icon="mdi-lock" label="Password"
                :type="showPassword ? 'text' : 'password'" outlined dense :rules="[
                  v => !!v || 'Password richiesta',
                  v => v.length >= 6 || 'La password deve avere almeno 6 caratteri.'
                ]" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword"
                class="mb-3">
              </v-text-field>

              <!-- Confirm Password Field -->
              <v-text-field v-model="confirmPassword" prepend-inner-icon="mdi-lock-check" label="Confirm Password"
                :type="showPassword ? 'text' : 'password'" outlined dense :rules="[
                  v => !!v || 'Conferma la password.',
                  v => v === registerData.password || 'Le password sono differenti.'
                ]">
              </v-text-field>

              <!-- Role Selection Field -->
              <v-select
                v-model="registerData.role"
                :items="roles"
                label="Role"
                outlined
                dense
                prepend-inner-icon="mdi-account-cog"
                class="mb-3"
              ></v-select>

              <!-- Submit Button -->
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

    <!-- Snackbar for notifications -->
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
  data() {
    return {
      registerData: {
        username: '',
        password: '',
        nome: '',  // Added name field
        email: '', // Added email field
        citta: '',  // Added city field
        role: 'cliente',  // Default role
        indirizzo: '' // Changed to indirizzo
      },
      roles: [
        'cliente',
        'tecnico'
        // Note: 'admin' role is not available during registration
      ],
      confirmPassword: '',
      showPassword: false,
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
        this.showSnackbarMessage('Passwords do not match', 'error');
        return;
      }

      this.loading = true;
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/auth/register', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              this.showSnackbarMessage('Registration successful! Please login.', 'success');
              this.$refs.form.reset();
              this.registerData = {
                username: '',
                password: '',
                nome: '',
                email: '',
                citta: '',
                role: '',
                indirizzo: ''
              };
              this.confirmPassword = '';
              setTimeout(() => {
                this.$router.push('/login');
              }, 2000);
            } else {
              this.showSnackbarMessage(data.error || 'Registration failed', 'error');
            }
            this.loading = false;
          }
        };

        xhr.send(JSON.stringify(this.registerData));
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
