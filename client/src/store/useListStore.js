import { defineStore } from 'pinia';
import axios from '../axios';

export const useListStore = defineStore({
  id: 'list',
  state: () => {
    return {
      lists: [],
      isLoading: false,
      intialized: false,
      // May want to sync with API later
      activeList: localStorage.getItem('activeList')
    };
  },
  actions: {
    async fetchLists() {
      this.isLoading = true;
      const response = await axios.get('/api/lists/mylists');
      this.lists = response.data;
      
      // Every time lists are fetched make sure that the active
      // list is still valid
      if (this.activeList && !this.lists.some(list => list._id == this.activeList)) {
        this.activeList = null;
        localStorage.removeItem('activeList');
      }
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
    },
    setActiveList(listId) {
      this.activeList = listId;
      localStorage.setItem('activeList', listId);
    },
    async addWordToList(listId, wordId) {
      const response = await axios.put(`/api/lists/${listId}/words`, [wordId]);
      if (response.status !== 200)
        throw new Error(response.data);
    },
    async addWordToActiveList(wordId) {
      if (!this.activeList)
        throw new Error('Tried adding word to active list but there is no active list.');

      const response = await axios.put(`/api/lists/${this.activeList}/words`, [wordId]);
      if (response.status !== 200)
        throw new Error(response.data);
    }
  }
});
