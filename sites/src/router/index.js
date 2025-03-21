// sites/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import UtentiView from '../views/UtentiView.vue';
import ClienteView from '../views/ClienteView.vue';
import TecnicoView from '../views/TecnicoView.vue';
import ChatView from '../views/ChatView.vue';
import AboutView from '../views/AboutView.vue';
import axios from 'axios';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/utenti',
    name: 'utenti',
    component: UtentiView,
    meta: { requiresAuth: true, requiredRole: 'admin' }
  },
  {
    path: '/cliente',
    name: 'cliente',
    component: ClienteView,
    meta: { requiresAuth: true, requiredRole: 'cliente' }
  },
  {
    path: '/tecnico',
    name: 'tecnico',
    component: TecnicoView,
    meta: { requiresAuth: true, requiredRole: 'tecnico' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.requiredRole;
  let isAuthenticated = false;
  let userRole = null;

  try {
    const response = await axios.get('http://localhost:3000/auth/check', { withCredentials: true });
    isAuthenticated = response.data.authenticated;
    userRole = response.data.user ? response.data.user.role : null;
  } catch (error) {
    console.error("Error checking authentication:", error);
  }

  if (requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else if (requiredRole && userRole !== requiredRole) {
    next('/'); // Redirect to home or a "forbidden" page
  } else {
    next(); // Proceed to the route
  }
});

export default router