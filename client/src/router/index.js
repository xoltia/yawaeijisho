import { createRouter, createWebHistory } from 'vue-router';
import Search from '../views/Search.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
