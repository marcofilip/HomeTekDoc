// sites/src/App.vue

<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>HomeTekDoc</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/about">About</v-btn>
      <!-- Bottone per FAQ -->
      <v-btn text to="/faq">FAQ</v-btn>
      <v-btn text to="/utenti" :disabled="!isAuthenticated || !canAccess('admin')">Utenti</v-btn>
      <v-btn text to="/cliente" :disabled="!isAuthenticated || !canAccess('cliente')">Cliente</v-btn>
      <v-btn text to="/tecnico" :disabled="!isAuthenticated || !canAccess('tecnico')">Tecnico</v-btn>
      <v-btn text to="/chat">Chat</v-btn>
      <v-spacer></v-spacer>
      <v-btn text v-if="!isAuthenticated" to="/login">Login</v-btn>
      <v-btn text v-else @click="logout">Logout</v-btn>
      <v-btn text v-if="!isAuthenticated" to="/register">Register</v-btn>
      <div id="googleSignInButton" ref="googleButton"></div>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
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