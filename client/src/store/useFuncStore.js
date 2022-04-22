import { defineStore } from 'pinia';
import axios from '../axios';

export const useFuncStore = defineStore({
  id: 'func',
  state: () => {
    return {
      funcs: [],
      isLoading: false,
      selectedFunc: localStorage.getItem('selectedFunc')
    };
  },
  getters: {
    hasSelectedFunc: (state) => {
      return state.selectedFunc !== null;
    },
    selectedFuncScript: (state) => {
      return state.funcs.find(f => f._id === state.selectedFunc).script;
    }
  },
  actions: {
    async fetchFuncs() {
      this.isLoading = true;
      const response = await axios.get('/api/funcs/myfuncs');
      this.funcs = response.data; 
      
      // verify that the selectedFunc is still valid
      if (this.selectedFunc && !this.funcs.find(func => func._id === this.selectedFunc)) {
        this.selectedFunc = null;
        localStorage.removeItem('selectedFunc');
      }

      this.isLoading = false;
    },
    async createFunc(func) {
      const response = await axios.post('/api/funcs', func);
      if (response.status !== 200)
        throw new Error(response.data);
      const newFunc = response.data;
      this.funcs.push(newFunc);
      return newFunc;
    },
    async updateFunc(funcId, func) {
      const response = await axios.patch(`/api/funcs/${funcId}`, func);
      if (response.status !== 200)
        throw new Error(response.data);
      const updatedFunc = response.data;
      const index = this.funcs.findIndex(f => f._id === funcId);
      this.funcs[index] = updatedFunc;
      return updatedFunc;
    },
    setSelectedFunc(funcId) {
      this.selectedFunc = funcId;
      localStorage.setItem('selectedFunc', funcId);
    }
  }
});
