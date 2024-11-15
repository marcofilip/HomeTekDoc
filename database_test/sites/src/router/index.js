import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UtentiView from '../views/UtentiView.vue'

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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
