import axios from 'axios';
import { useAuthStore } from './store/useAuthStore';

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(function(config) {
  const authStore = useAuthStore();
  config.headers['Accept-Language'] = localStorage.getItem('preferences.lang') || navigator.language.split('-')[0];
  if (authStore.isAuthenticated)
    config.headers['Authorization'] = `Bearer ${authStore.token}`;
  return config;
});

export default instance;
