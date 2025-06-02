// sites/src/App.vue

<template>
  <v-app>
    <v-app-bar app elevation="1" color="white">
      <v-container class="py-0 fill-height">
        <v-img :src="require('@/assets/logo.png')" alt="HomeTekDoc Logo" max-height="72" max-width="72" contain
          class="mr-2"></v-img>
        <v-toolbar-title class="font-weight-bold primary--text">HomeTekDoc</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn text rounded to="/" class="mx-1">
          <v-icon left>mdi-home</v-icon>
          Home
        </v-btn>
        <v-btn text rounded to="/about" class="mx-1">
          <v-icon left>mdi-information</v-icon>
          About
        </v-btn>
        <v-btn text rounded to="/faq" class="mx-1">
          <v-icon left>mdi-help-circle</v-icon>
          FAQ
        </v-btn>

        <v-btn text rounded to="/utenti" class="mx-1" :disabled="!isAdmin"> <!-- Usa computed -->
          <v-icon left>mdi-account-group</v-icon>
          Utenti
        </v-btn>
        <v-btn text rounded to="/cliente" class="mx-1" :disabled="!isCliente"> <!-- Usa computed -->
          <v-icon left>mdi-account</v-icon>
          Cliente
        </v-btn>
        <v-btn text rounded to="/tecnico" class="mx-1" :disabled="!isTecnico"> <!-- Usa computed -->
          <v-icon left>mdi-wrench</v-icon>
          Tecnico
        </v-btn>
        <v-btn text rounded to="/chat" class="mx-1">
          <v-icon left>mdi-chat</v-icon>
          Chat
        </v-btn>

        <v-divider vertical class="mx-2"></v-divider>

        <template v-if="!isAuthenticated">
          <v-btn text rounded to="/login" color="primary" class="mx-1">
            <v-icon left>mdi-login</v-icon>
            Login
          </v-btn>
          <v-btn outlined rounded to="/register" color="primary" class="ml-1">
            <v-icon left>mdi-account-plus</v-icon>
            Register
          </v-btn>
        </template>
        <template v-else>
          <v-btn text rounded @click="logout" color="grey darken-1">
            <v-icon left>mdi-logout</v-icon>
            Logout
          </v-btn>
          <v-avatar size="32" class="ml-2">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
        </template>

        <div id="googleSignInButton" ref="googleButton" class="ml-2"></div>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app padless class="mt-4">
      <v-card flat width="100%" class="text-center">
        <v-card-text class="py-2 grey--text text--darken-3">
          {{ new Date().getFullYear() }} — <strong>HomeTekDoc</strong> - Assistenza elettronica domiciliare veloce
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      userRole: null, // Initially null, fetched from the server
      isAuthenticated: false,
      authCheckCompleted: false,
      googleSignInInitialized: false,
    };
  },
  computed: {
    isAdmin() {
      return this.isAuthenticated && this.userRole === 'admin';
    },
    isCliente() {
      return this.isAuthenticated && this.userRole === 'cliente';
    },
    isTecnico() {
      return this.isAuthenticated && this.userRole === 'tecnico';
    }
  },
  mounted() {
    this.checkAuthentication(); // Call on component mount
    this.initGoogleSignIn(); // Initialize Google Sign-In
  },
  methods: {
    async checkAuthentication() {
      console.log("App.vue: Esecuzione checkAuthentication iniziale...");
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/auth/check', true);
        xhr.withCredentials = true;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            console.log("App.vue: Risposta da /auth/check:", data);
            if (data.authenticated) {
              this.userRole = data.user.role;
              this.isAuthenticated = true;
              // Salva l'email se presente per il logout Google
              if (data.user.email) {
                localStorage.setItem('user_email', data.user.email);
              }
            } else {
              this.userRole = null;
              this.isAuthenticated = false;
              localStorage.removeItem('user_email'); // Rimuovi se non autenticato
            }
          } else {
            console.error("App.vue: Errore HTTP da /auth/check:", xhr.status, xhr.statusText);
            this.userRole = null;
            this.isAuthenticated = false;
            localStorage.removeItem('user_email');
          }
          this.authCheckCompleted = true; // Segna il check come completato
          console.log("App.vue: Stato Auth aggiornato:", { isAuthenticated: this.isAuthenticated, userRole: this.userRole });
        };

        xhr.onerror = () => {
          console.error("App.vue: Errore di rete chiamando /auth/check");
          this.userRole = null;
          this.isAuthenticated = false;
          localStorage.removeItem('user_email');
          this.authCheckCompleted = true; // Segna comunque come completato (fallito)
        };

        xhr.send();

      } catch (error) {
        // Questo catch potrebbe non catturare errori XHR asincroni, gestiti in onerror
        console.error("App.vue: Errore imprevisto in checkAuthentication:", error);
        this.userRole = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user_email');
        this.authCheckCompleted = true;
      }
    },

    async logout() {
      console.log("App.vue: Esecuzione logout...");
      try {
        // Usiamo XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/auth/logout', true);
        xhr.withCredentials = true;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("App.vue: Logout backend riuscito.");
            // Resetta stato locale IMMEDIATAMENTE
            this.userRole = null;
            this.isAuthenticated = false;
            this.authCheckCompleted = true; // Lo stato è noto (non autenticato)

            // Revoca Google e reindirizza
            if (window.google && window.google.accounts && window.google.accounts.id) {
              const userEmail = localStorage.getItem('user_email');
              if (userEmail) {
                console.log("App.vue: Revocazione consenso Google per", userEmail);
                window.google.accounts.id.revoke(userEmail, () => {
                  console.log('App.vue: Consenso Google revocato.');
                  localStorage.removeItem('user_email');
                  this.$router.push('/login'); // Reindirizza DOPO revoca
                });
              } else {
                localStorage.removeItem('user_email'); // Sicurezza
                this.$router.push('/login'); // Reindirizza se non c'era email Google
              }
            } else {
              localStorage.removeItem('user_email'); // Sicurezza
              this.$router.push('/login'); // Reindirizza se Google non è inizializzato
            }
          } else {
            console.error("App.vue: Errore HTTP durante logout:", xhr.status, xhr.statusText);
            // Potremmo voler resettare lo stato frontend comunque? Sì.
            this.userRole = null;
            this.isAuthenticated = false;
            this.authCheckCompleted = true;
            localStorage.removeItem('user_email');
            this.$router.push('/login'); // Reindirizza comunque alla login
          }
        };

        xhr.onerror = () => {
          console.error("App.vue: Errore di rete durante logout.");
          // Resetta lo stato frontend
          this.userRole = null;
          this.isAuthenticated = false;
          this.authCheckCompleted = true;
          localStorage.removeItem('user_email');
          this.$router.push('/login'); // Reindirizza comunque
        };

        xhr.send();

      } catch (error) {
        console.error("App.vue: Errore imprevisto durante logout:", error);
        // Resetta lo stato frontend
        this.userRole = null;
        this.isAuthenticated = false;
        this.authCheckCompleted = true;
        localStorage.removeItem('user_email');
        this.$router.push('/login'); // Reindirizza comunque
      }
    },

    initGoogleSignIn() {
      if (this.googleSignInInitialized) return; // Inizializza solo una volta

      console.log("App.vue: Tentativo inizializzazione Google Sign In...");
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log("App.vue: Google API pronta. Inizializzazione...");
        this.renderGoogleButton();
        this.googleSignInInitialized = true;
      } else {
        console.log("App.vue: Google API non ancora pronta. Aggiungo listener 'load'...");
        // Aggiungi un listener all'evento 'load' della finestra
        // Usa un flag per assicurarsi che venga aggiunto una sola volta
        if (!window.googleApiLoadListenerAdded) {
          window.addEventListener('load', this.tryRenderGoogleButtonAgain);
          window.googleApiLoadListenerAdded = true; // Imposta il flag
        }
        // Aggiungi anche un timeout come fallback se 'load' fosse già passato
        setTimeout(this.tryRenderGoogleButtonAgain, 1000);
      }
    },

    tryRenderGoogleButtonAgain() {
      if (this.googleSignInInitialized) return;
      console.log("App.vue: Riprovo rendering pulsante Google (da load/timeout)...");
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log("App.vue: Google API ora pronta.");
        this.renderGoogleButton();
        this.googleSignInInitialized = true;
        // Rimuovi il listener se non serve più
        window.removeEventListener('load', this.tryRenderGoogleButtonAgain);
      } else {
        console.log("App.vue: Google API ancora non pronta dopo il ritardo/load.");
        // Potremmo voler riprovare dopo un altro timeout o loggare un errore persistente
      }
    },

    renderGoogleButton() {
      // Verifica che l'elemento esista nel DOM
      const buttonContainer = this.$refs.googleButton;
      if (!buttonContainer) {
        console.error("App.vue: Elemento googleButton non trovato nel DOM.");
        // Riprova dopo un breve ritardo se il componente non è ancora renderizzato completamente
        setTimeout(this.renderGoogleButton, 100);
        return;
      }
      // Pulisci il contenitore prima di renderizzare nuovamente (se necessario)
      buttonContainer.innerHTML = '';

      try {
        console.log("App.vue: Inizializzazione Google Accounts ID...");
        window.google.accounts.id.initialize({
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID, // Assicurati sia definito nel .env del frontend
          callback: this.handleCredentialResponse
        });

        console.log("App.vue: Rendering pulsante Google...");
        window.google.accounts.id.renderButton(
          buttonContainer, // Usa il ref all'elemento DOM
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular'
          }
        );

        // Optionally display the One Tap prompt
        // window.google.accounts.id.prompt(); // Potrebbe essere fastidioso, commentalo se non desiderato
        console.log("App.vue: Pulsante Google renderizzato.");
      } catch (error) {
        console.error("App.vue: Errore durante l'inizializzazione o rendering di Google Sign In:", error);
      }
    },

    handleCredentialResponse(response) {
      console.log("App.vue: Credenziale Google ricevuta.");
      const credential = response.credential;
      this.verifyTokenWithServer(credential);
    },

    async verifyTokenWithServer(token) {
      console.log("App.vue: Invio token Google al server...");
      try {
        // Usiamo XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/auth/google', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            console.log("App.vue: Risposta verifica token server:", data);
            if (data.authenticated) {
              // Aggiorna stato locale IMMEDIATAMENTE
              this.userRole = data.user.role;
              this.isAuthenticated = true;
              this.authCheckCompleted = true; // Lo stato è noto
              if (data.user.email) {
                localStorage.setItem('user_email', data.user.email);
              }
              console.log("App.vue: Login Google riuscito. Reindirizzamento...");
              // Reindirizza alla home o alla dashboard appropriata
              this.$router.push('/');
            } else {
              console.error("App.vue: Autenticazione Google fallita sul server:", data.error);
              // Non aggiornare lo stato locale se fallisce
              // Mostra un messaggio all'utente?
            }
          } else {
            console.error("App.vue: Errore HTTP durante verifica token Google:", xhr.status, xhr.statusText);
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error("Server error details:", errorData);
              // Mostra errore specifico all'utente?
            } catch (e) { /* ignore json parse error */ }
          }
        };

        xhr.onerror = () => {
          console.error("App.vue: Errore di rete durante verifica token Google.");
        };

        xhr.send(JSON.stringify({ token }));

      } catch (error) {
        console.error("App.vue: Errore imprevisto in verifyTokenWithServer:", error);
      }
    },
    updateAuthStatus(status, role) {
      this.isAuthenticated = status;
      this.userRole = role;
      this.authCheckCompleted = true; // Segna come completato
      console.log("App.vue: Stato Auth aggiornato manualmente:", { isAuthenticated: this.isAuthenticated, userRole: this.userRole });
    }
  },
  watch: {
  }
}
</script>

<style>
#googleSignInButton {
  display: inline-block;
  margin-left: 8px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.v-application {
  .theme--light.v-card {
    background-color: rgba(255, 255, 255, 0.95);
  }

  .v-btn {
    text-transform: none;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .v-text-field--outlined fieldset {
    border-color: rgba(0, 0, 0, 0.15);
  }

  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state)>.v-input__control>.v-input__slot fieldset {
    border-color: rgba(0, 0, 0, 0.15);
  }
}

.fill-height {
  min-height: 100vh;
}
</style>