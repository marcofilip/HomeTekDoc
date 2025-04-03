// sites/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import UtentiView from "../views/UtentiView.vue";
import ClienteView from "../views/ClienteView.vue";
import TecnicoView from "../views/TecnicoView.vue";
import ChatView from "../views/ChatView.vue";
import AboutView from "../views/AboutView.vue";
// Rimosso: import axios from "axios"; // Non più necessario qui

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/utenti",
    name: "utenti",
    component: UtentiView,
    // Le meta informazioni rimangono utili per il futuro o per logica nel componente
    meta: { requiresAuth: true, requiredRole: "admin" },
  },
  {
    path: "/cliente",
    name: "cliente",
    component: ClienteView,
    meta: { requiresAuth: true, requiredRole: "cliente" },
  },
  {
    path: "/tecnico",
    name: "tecnico",
    component: TecnicoView,
    meta: { requiresAuth: true, requiredRole: "tecnico" },
  },
  {
    path: "/chat",
    name: "chat",
    component: ChatView,
    // Aggiungere meta se necessario, es: { requiresAuth: true }
  },
  {
    path: "/faq",
    name: "faq",
    component: () => import("@/views/FAQView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// --- INIZIO MODIFICA ---
// La vecchia logica con la chiamata API è stata rimossa.
// Per la modalità sviluppo, permettiamo tutte le navigazioni.
// La protezione vera avverrà a livello API nel backend e tramite
// l'abilitazione/disabilitazione dei link/pulsanti in App.vue.
router.beforeEach((to, from, next) => {
  console.log(`Router Guard: Navigating from ${from.path} to ${to.path}.`);
  // In futuro, qui si leggerà lo stato da Pinia/Vuex per decidere se
  // permettere (next()), reindirizzare a login (next('/login')),
  // o reindirizzare altrove (next('/forbidden')).
  next(); // Permette sempre la navigazione
});
// --- FINE MODIFICA ---

export default router;