import { defineStore } from 'pinia';

const ANKI_CONNECT_VERSION = 6;

export const useAnkiStore = defineStore({
  id: 'anki',
  state: () => {
    return {
      isOnline: false,
      selectedModel: localStorage.getItem('selectedModel'),
      selectedDeck: localStorage.getItem('selectedDeck'),
      ankiConnectHost: localStorage.getItem('ankiConnectHost') || '127.0.0.1:8765'
    };
  },
  getters: {
    isInitialized: (state) => {
      return state.isOnline && state.selectedModel && state.selectedDeck;
    }
  },
  actions: {
    invoke(action, params={}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => {
          this.isOnline = false;
          reject('failed to issue request');
        });
        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (Object.getOwnPropertyNames(response).length != 2)
              throw 'response has an unexpected number of fields';
            if (!Object.prototype.hasOwnProperty.call(response, 'error'))
              throw 'response is missing required error field';
            if (!Object.prototype.hasOwnProperty.call(response, 'result')) 
              throw 'response is missing required result field';
            if (response.error)
              throw response.error;

            resolve(response.result);
          } catch (e) {
            reject(e);
          }
        });

        xhr.open('POST', `http://${this.ankiConnectHost}`);
        xhr.send(JSON.stringify({action, version: ANKI_CONNECT_VERSION, params}));
      });
    },
    async tryConnect() {
      // Try to see if anki-connect is online
      try {
        await this.invoke('version');
        this.isOnline = true;
        return true;
      } catch {
        return false;
      }
    },
    getModelNames() {
      return this.invoke('modelNames');
    },
    getDeckNames() {
      return this.invoke('deckNames');
    },
    setAddress(host) {
      this.ankiConnectHost = host;
      localStorage.setItem('ankiConnectHost', host);
    },
    setActiveDeck(deckName) {
      this.selectedDeck = deckName
      localStorage.setItem('selectedDeck', deckName);
    },
    setActiveModel(modelName) {
      this.selectedDeck = modelName;
      localStorage.setItem('selectedModel', modelName);
    },
    async verifyNote(note) {
      const modelFields = await this.invoke('modelFieldNames', { modelName: this.selectedModel });
      const noteFields = Object.keys(note);
      return modelFields.every(field => noteFields.includes(field));
    },
    async addNote(fields) {
      if (!this.isInitialized)
        throw new Error('cannot create note');

      const response = await this.invoke('addNote', {
        note: {
          deckName: this.selectedDeck,
          modelName: this.selectedModel,
          options: {
            allowDuplicate: false,
            duplicateScope: "deck",
            duplicateScopeOptions: {
              deckName: this.selectedDeck,
              checkChildren: false,
              checkAllModels: false
            }
          },
          fields
        }
      });

      return response;
    }
  }
});
