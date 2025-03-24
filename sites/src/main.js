import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import 'leaflet/dist/leaflet.css';
// Import Vuetify from plugins
import vuetify from './plugins/vuetify';
import "@mdi/font/css/materialdesignicons.css";
// Importa i CSS globali
import './assets/styles.css';  // Se hai creato questo file

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.mount("#app");

const script = document.createElement('script');
script.src = "https://accounts.google.com/gsi/client";
script.async = true;
script.defer = true;
document.head.appendChild(script);
