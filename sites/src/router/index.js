import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UtentiView from '../views/UtentiView.vue'
import ClienteView from '../views/ClienteView.vue'
import TecnicoView from '../views/TecnicoView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/utenti',
    name: 'utenti',
    component: UtentiView,
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('isAdmin') === 'true') {
        next();
      } else {
        alert('Accesso negato: non autorizzato.');
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('role');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'login' });
    } else if (to.meta.role && to.meta.role !== userRole) {
      alert('Accesso negato');
      next('/login'); // Redirect to login page
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router
