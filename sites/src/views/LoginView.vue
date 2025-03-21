<template>
  <v-container fluid class="fill-height login-bg">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12" class="rounded-lg">
          <!-- Card Header -->
          <v-card-title class="text-center justify-center py-6">
            <h1 class="font-weight-bold text-h4 primary--text">
              Ben tornato!
            </h1>
          </v-card-title>

          <!-- Login Form -->
          <v-card-text>
            <v-form @submit.prevent="login" ref="form">
              <v-text-field v-model="loginData.username" prepend-inner-icon="mdi-account" label="Username" type="text"
                outlined dense :rules="[v => !!v || 'Username necessario']" class="mb-3"></v-text-field>

              <v-text-field v-model="loginData.password" prepend-inner-icon="mdi-lock" label="Password"
                :type="showPassword ? 'text' : 'password'" outlined dense :rules="[v => !!v || 'Password necessaria']"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"></v-text-field>

              <v-btn type="submit" color="primary" block x-large elevation="2" :loading="loading" class="mt-4">
                Sign In
              </v-btn>
            </v-form>

            <div class="text-center mt-6">
              <span class="grey--text text--darken-2">Non hai ancora un account?</span>
              <v-btn text color="primary" @click="$router.push('/register')" class="ml-2">
                Registrati
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
      loginData: {
        username: '',
        password: ''
      },
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
    async login() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://65.109.163.183:3000/auth/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              this.showSnackbarMessage('Login successful!', 'success');
              setTimeout(() => {
                const redirect = {
                  admin: '/utenti',
                  tecnico: '/tecnico',
                  cliente: '/cliente'
                }[data.user.role] || '/';
                this.$router.push(redirect);
              }, 1000);
            } else {
              this.showSnackbarMessage(data.error, 'error');
            }
            this.loading = false;
          }
        };

        xhr.send(JSON.stringify(this.loginData));
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
.login-bg {
  background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
}
</style>