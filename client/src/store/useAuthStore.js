import { defineStore } from 'pinia';

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => {
    return {
      token: localStorage.getItem('token'),
      userData: null,
    };
  },
  getters: {
    // Later may need to check iat
    isAuthenticated: (state) => state.token !== null
  },
  actions: {
    async register(username, password) {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json', 'Accept-Language': 'jp' }
      });

      if (response.ok) {
        this.token = await response.text();
        localStorage.setItem('token', this.token);
        return this.token;
      } else {
        const error = await response.json();
        throw (error.errors || [error]);
      }
    },
    async login(username, password) {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json', 'Accept-Language': 'jp' }
      });

      if (response.ok) {
        this.token = await response.text();
        localStorage.setItem('token', this.token);
        return this.token;
      } else {
        const error = await response.json();
        throw (error.errors || [error]);
      }
    },
    async getUserInfo(fromCache=true) {
      if (!this.isAuthenticated)
        return Promise.reject('Invalid or no token.');

      if (this.userData && fromCache)
        return this.userData;

      const response = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      this.userData = response.json();
      return this.userData;
    },
    logout() {
      this.token = null;
      localStorage.removeItem('token');
    },
    // Make an authenticated request
    makeRequest(url, options) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${this.token}`;
      
      return fetch(url, options);
    }
  }
});
