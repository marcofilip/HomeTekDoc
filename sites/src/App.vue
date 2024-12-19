<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>HomeTekDoc</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/utenti" :disabled="!canAccess('admin')">Utenti</v-btn>
      <v-btn text to="/cliente" :disabled="!canAccess('cliente')">Cliente</v-btn>
      <v-btn text to="/tecnico" :disabled="!canAccess('tecnico')">Tecnico</v-btn>
      <v-btn text to="/chat">Chat</v-btn>
      <v-spacer></v-spacer>
      <v-btn text to="/login">Login</v-btn>
      <v-btn text to="/register">Register</v-btn>
    </v-app-bar>
    <v-main>
      <router-view @route-change="updateUserRole"/>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      userRole: localStorage.getItem('role')
    }
  },
  methods: {
    canAccess(role) {
      return this.userRole === role;
    },
    updateUserRole() {
      this.userRole = localStorage.getItem('role');
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

  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
    border-color: rgba(0, 0, 0, 0.15);
  }
}

.fill-height {
  min-height: 100vh;
}
</style>
