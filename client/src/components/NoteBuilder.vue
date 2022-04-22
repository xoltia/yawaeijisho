<template>
  <Modal :show="showModal" :style="{ textAlign: 'center', maxWidth: '600px' }" :showX="true" @close="cancel">
    <Loader v-if="this.waitingForPrompt"/>
    <div v-else>
      <h3>{{ prompt }}</h3>
      <a class="btn"
        v-for="option in options"
        :key="option"
        style="margin: 10px"
        @click="selectOption(option)">{{ option }}</a>
    </div>
  </Modal>
</template>

<script>
import Modal from './Modal.vue';
import Loader from './Loader.vue';
import { useAuthStore } from '../store/useAuthStore';
import { useAnkiStore } from '../store/useAnkiStore';

export default {
  name: 'NoteBuilder',
  components: {
    Modal,
    Loader
  },
  emits: ['finished'],
  props: {
    wordId: String,
    script: String
  },
  data() {
    return {
      // Current prompt information
      prompt: '',
      options: [],
      // Set to true while waiting for a message from the WS server
      waitingForPrompt: true,
      // The WebSocket connection to the func WS server.
      ws: null
    }
  },
  setup() {
    const authStore = useAuthStore();
    const ankiStore = useAnkiStore();

    return { authStore, ankiStore };
  },
  computed: {
    showModal() {
      return !!this.wordId;
    }
  },
  watch: {
    // Wait for word id to be set by parent component.
    // Parent will set this value back to null to indicate
    // that the note builder should be hidden (and any current operation cancelled).
    wordId: {
      immediate: true,
      handler(value) {
        if (!value) {
          // Neceessary in case value is set to null before previous
          // word was finished (ex. if user cancelled).
          if (this.ws)
            this.ws.close();
          this.ws = null;
          //al = false;
          return;
        }

        //this.showModal = true;
        this.waitingForPrompt = true;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const path = '/ws/sync';
        const host =  process.env.NODE_ENV === 'development' ?
          window.location.hostname + ':3080' :
          window.location.host;
        const query = '?token=' + this.authStore.token;
        const wsUrl = `${protocol}//${host}${path}${query}`;

        this.ws = new WebSocket(wsUrl);
        this.ws.onmessage = this.handleWebSocketMessage;
        this.ws.onopen = this.sendInitalPayload;
        // TODO: Handle websocket errors?
        // I don't this is necessary because the WS connection is
        // closed only after either an error or a result is received.
        // this.ws.onclose = this.handleWebSocketClose;
      }
    }
  },
  methods: {
    createNewWebSocketConnection() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const path = '/ws/sync';
      const host =  process.env.NODE_ENV === 'development' ?
        window.location.hostname + ':3080' :
        window.location.host;
      const query = '?token=' + this.authStore.token;
      const wsUrl = `${protocol}//${host}${path}${query}`;
      this.ws = new WebSocket(wsUrl);
    },
    sendInitalPayload() {
      this.ws.send(JSON.stringify({
        script: this.script,
        wordId: this.wordId
      }));
    },
    handleWebSocketMessage(ev) {
      const message = JSON.parse(ev.data);
      if (message.event === 'Prompt') {
        this.waitingForPrompt = false;
        this.options = message.options;
        this.prompt = message.prompt;
      } else if (message.event === 'Result') {
        this.handleFuncResult(message.result);
      } else if (message.error) {
        alert(this.$t('func-error') + '\n' + (message.message || message.error));
        console.error(message.error);
        this.$emit('finished');
      }
    },
    async handleFuncResult(result) {
      const isValidNote = await this.ankiStore.verifyNote(result); 
      if (!isValidNote) {
        this.$emit('finished');
        alert(this.$t('anki-invalid-note-err'));
        return;
      }
      
      try {
        await this.ankiStore.addNote(result);
        alert(this.$t('anki-note-created'));
      } catch (e) {
        console.error('Error adding note to Anki:', e);
        alert(this.$t('anki-add-error') + '\n' + e);
      } finally {
        this.$emit('finished');
      }
    },
    selectOption(option) {
      if (!this.ws) {
        console.error('WebSocket not initialized');
        return;
      }

      this.ws.send(option);
      this.waitingForPrompt = true;
    },
    cancel() {
      this.ws.close();
      this.$emit('finished');

      // TOOD: fix this
      // for some reason the modal is not doing this when show prop changes
      document.documentElement.style.overflow = 'auto';
    }
  }
}
</script>
