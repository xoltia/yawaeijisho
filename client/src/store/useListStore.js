import { defineStore } from 'pinia';
import axios from '../axios';

export const useListStore = defineStore({
  id: 'list',
  state: () => {
    return {
      lists: [],
      isLoading: false,
      intialized: false
    };
  },
  actions: {
    async fetchLists() {
      this.isLoading = true;
      const response = await axios.get('/api/lists/mylists');
      this.lists = response.data;
      this.isLoading = false;
    },
    async getLists() {
      if (!this.intialized) {
        await this.fetchLists();
        this.intialized = true;
      }
      return this.lists;
    },
    async createList(list) {
      const response = await axios.post('/api/lists', list)
      if (response.status !== 200)
        throw new Error(response.data);
      this.lists.push(response.data);
      return response.data;
    },
    async deleteList(listId) {
      // Preemptively remove list from state (shouldn't fail)
      this.lists = this.lists.filter(list => list._id !== listId);
      // Tell API to delete list and remove from state list
      const response = await axios.delete('/api/lists/' + listId);
      if (response.status !== 200)
        throw new Error(response.data);
    }
  }
});
