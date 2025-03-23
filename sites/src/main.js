import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
  icons: {
    iconfont: "mdi",
  },
  components,
  directives,
  theme: {
    defaultTheme: "dark",
  },
});

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.mount("#app");

const script = document.createElement('script');
script.src = "https://accounts.google.com/gsi/client";
script.async = true;
script.defer = true;
document.head.appendChild(script);
