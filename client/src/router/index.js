import { createRouter, createWebHistory } from 'vue-router';
import Search from '../views/Search.vue';
import { useAuthStore } from '../store/useAuthStore';

const routes = [
  {
    path: '/',
    name: 'Search',
    component: Search
  },
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('../views/Signin.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signin.vue'),
    props: { isSignup: true }
  },
  {
    path: '/lists',
    name: 'Lists',
    component: () => import('../views/Lists.vue'),
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) next();
      else next('/signin');
    }
  },
  {
    path: '/anki-settings',
    name: 'AnkiSettings',
    component: () => import('../views/AnkiSettings.vue'),
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) next();
      else next('/signin');
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
