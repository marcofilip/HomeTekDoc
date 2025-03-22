// sites/src/App.vue

<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>HomeTekDoc</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/utenti" :disabled="!isAuthenticated || !canAccess('admin')">Utenti</v-btn>
      <v-btn text to="/cliente" :disabled="!isAuthenticated || !canAccess('cliente')">Cliente</v-btn>
      <v-btn text to="/tecnico" :disabled="!isAuthenticated || !canAccess('tecnico')">Tecnico</v-btn>
      <v-btn text to="/chat">Chat</v-btn>
      <v-spacer></v-spacer>
      <v-btn text v-if="!isAuthenticated" to="/login">Login</v-btn>
      <v-btn text v-else @click="logout">Logout</v-btn>
      <v-btn text v-if="!isAuthenticated" to="/register">Register</v-btn>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'; // Import Axios

export default {
  data() {
    return {
      userRole: null, // Initially null, fetched from the server
      isAuthenticated: false,
    };
  },
  mounted() {
    this.checkAuthentication(); // Call on component mount
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
      } catch (error) {
        console.error("Error checking authentication:", error);
        this.userRole = null;
        this.isAuthenticated = false;
      }
    },
    async logout() {
      try {
        await axios.get('http://localhost:3000/auth/logout', { withCredentials: true });
        this.userRole = null;
        this.isAuthenticated = false;
        this.$router.push('/login'); // Redirect to login after logout
      } catch (error) {
        console.error("Logout error:", error);
        // Handle logout error (e.g., show a message to the user)
      }
    }
  },
  watch: {
    '$route'() {
      this.updateUserRole();
    }
  }
}
</script>

<style>
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