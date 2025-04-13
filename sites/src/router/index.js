// sites/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import UtentiView from "../views/UtentiView.vue";
import ClienteView from "../views/ClienteView.vue";
import TechnicianDashboardView from "../views/TechnicianDashboardView.vue"; // NUOVO IMPORT
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
    component: TechnicianDashboardView, // Punta alla nuova dashboard
    meta: { requiresAuth: true, requiredRole: "tecnico" },
  },
  {
    path: "/chat",
    name: "chat",
    component: ChatView,
    meta: { requiresAuth: true }, // Richiede login per chattare?
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

router.beforeEach((to, from, next) => {
  console.log(`Router Guard: Navigating from ${from.path} to ${to.path}.`);
  next();
});

export default router;