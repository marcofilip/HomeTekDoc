import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UtentiView from '../views/UtentiView.vue'
import ClienteView from '../views/ClienteView.vue'
import TecnicoView from '../views/TecnicoView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/utenti',
    name: 'utenti',
    component: UtentiView,
    beforeEnter: async (to, from, next) => {
      try {
        const response = await fetch('http://65.109.163.183:3000/auth/check', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.authenticated && data.user.isAdmin) {
          next();
        } else {
          alert('Accesso negato: non autorizzato.');
          next('/login');
        }
      } catch (error) {
        alert('Errore di autenticazione.');
        next('/login');
      }
    }
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
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/cliente',
    name: 'cliente',
    component: ClienteView,
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/tecnico',
    name: 'tecnico',
    component: TecnicoView,
    meta: { requiresAuth: true, role: 'tecnico' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      const response = await fetch('http://65.109.163.183:3000/auth/check', {
        credentials: 'include'
      });
      const data = await response.json();
      if (!data.authenticated) {
        next({ name: 'login' });
      } else if (to.meta.role && to.meta.role !== data.user.role) {
        alert('Accesso negato');
        next('/login');
      } else {
        next();
      }
    } catch (error) {
      next({ name: 'login' });
    }
  } else {
    next();
  }
});

export default router
