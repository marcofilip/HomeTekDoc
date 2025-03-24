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

        <v-btn text rounded to="/utenti" class="mx-1" :disabled="!isAuthenticated || !canAccess('admin')">
          <v-icon left>mdi-account-group</v-icon>
          Utenti
        </v-btn>
        <v-btn text rounded to="/cliente" class="mx-1" :disabled="!isAuthenticated || !canAccess('cliente')">
          <v-icon left>mdi-account</v-icon>
          Cliente
        </v-btn>
        <v-btn text rounded to="/tecnico" class="mx-1" :disabled="!isAuthenticated || !canAccess('tecnico')">
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
import axios from 'axios'; // Import Axios

export default {
  components: {
  },
  data() {
    return {
      userRole: null, // Initially null, fetched from the server
      isAuthenticated: false,
    };
  },
  mounted() {
    this.checkAuthentication(); // Call on component mount
    this.initGoogleSignIn(); // Initialize Google Sign-In
  },
  methods: {
    canAccess(role) {
      return this.userRole === role;
    },

    updateUserRole() {
      this.checkAuthentication();
    },

    async checkAuthentication() {
      try {
        const response = await axios.get('http://localhost:3000/auth/check', { withCredentials: true });
        if (response.data.authenticated) {
          this.userRole = response.data.user.role;
          this.isAuthenticated = true;
        } else {
          this.userRole = null;
          this.isAuthenticated = false;
        }
      }
      catch (error) {
        console.error("Error checking authentication:", error);
        this.userRole = null;
        this.isAuthenticated = false;
      }
    },

    async logout() {
      try {
        await axios.get('http://localhost:3000/auth/logout', { withCredentials: true });

        // Optionally revoke Google token
        if (window.google && window.google.accounts) {
          window.google.accounts.id.revoke(localStorage.getItem('user_email') || '', () => {
            console.log('Consent revoked');
          });
        }

        this.userRole = null;
        this.isAuthenticated = false;
        this.$router.push('/login');
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    initGoogleSignIn() {
      // Make sure the Google Identity Services script is loaded
      if (window.google && window.google.accounts) {
        this.renderGoogleButton();
      } else {
        // If not loaded yet, wait and try again
        window.addEventListener('load', () => {
          // Allow some time for the script to initialize
          setTimeout(() => {
            this.renderGoogleButton();
          }, 100);
        });
      }
    },

    renderGoogleButton() {
      if (!window.google || !window.google.accounts) {
        console.error("Google Identity Services not loaded");
        return;
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
        callback: this.handleCredentialResponse
      });

      // Render the button
      window.google.accounts.id.renderButton(
        this.$refs.googleButton,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );

      // Optionally display the One Tap prompt
      window.google.accounts.id.prompt();
    },

    handleCredentialResponse(response) {
      console.log("User signed in successfully");

      // The response contains the JWT ID token
      const credential = response.credential;

      // Decode the JWT payload (second part of the token)
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const email = payload.email;
      console.log("Email: ", email);

      // Send the token to your server for verification
      this.verifyTokenWithServer(credential);
    },

    async verifyTokenWithServer(token) {
      try {
        // Send the token to your backend to verify and create a session
        const response = await axios.post('http://localhost:3000/auth/google',
          { token },
          { withCredentials: true }
        );

        if (response.data.authenticated) {
          this.userRole = response.data.user.role;
          this.isAuthenticated = true;
          // Redirect as needed
          this.$router.push('/');
        }
      } catch (error) {
        console.error("Error verifying token with server:", error);
      }
    },
  },
  watch: {
    '$route'() {
      this.updateUserRole();
    }
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