<template>
  <div v-if="!ankiConnect.isOnline" class="big-warning">
    {{ $t('anki-not-connected') }}
  </div>
  <Input
    :title="$t('anki-connect-addr')"
    :value="ankiConnectHost"
    @input="setAnkiHost"
    :errors="[]"
  />
  <Input
    :title="$t('anki-deck')"
    inputType="select"
    :value="selectedDeck"
    @input="setSelectedDeck"
    :options="asOptions(ankiDecks)"
  />
  <Input
    :title="$t('anki-model')"
    inputType="select"
    :value="selectedModel"
    @input="setSelectedModel"
    :options="asOptions(ankiModels)"
  />
  <Input
    :title="$t('word-function')"
    inputType="select"
    :value="selectedFunc"
    @input="setSelectedFunc"
    :options="funcOptions"
  />
  <a :class="['btn', unsavedChanges ? '' : 'disabled']" style="margin-top: 15px" @click="saveSettings">{{$t('save')}}</a>
</template>

<script>
import Input from '../components/Input.vue';
import { useAnkiStore } from '../store/useAnkiStore';
import { useFuncStore } from '../store/useFuncStore';

export default {
  name: 'AnkiConnectSettings',
  components: { Input },
  setup() {
    const ankiConnect = useAnkiStore();
    const funcStore = useFuncStore();

    return {
      ankiConnect,
      funcStore
    };
  },
  data() {
    return {
      unsavedChanges: false,
      ankiDecks: [],
      ankiModels: [],
      selectedDeck: '',
      selectedModel: '',
      ankiConnectHost: '',
      selectedFunc: '',
    }
  },
  async mounted() {
    await this.funcStore.fetchFuncs();
    
    if (this.funcStore.hasSelectedFunc) {
      this.selectedFunc = this.funcStore.selectedFunc;
    }

    this.selectedDeck = this.ankiConnect.selectedDeck;
    this.selectedModel = this.ankiConnect.selectedModel;
    this.ankiConnectHost = this.ankiConnect.ankiConnectHost;

    this.ankiModels = await this.ankiConnect.getModelNames();
    this.ankiDecks = await this.ankiConnect.getDeckNames();
  },
  computed: {
    funcOptions() {
      return this.funcStore.funcs.map(func => {
        return {
          value: func._id,
          text: func.name
        }
      });
    }
  },
  methods: {
    setSelectedDeck(deckName) {
      this.selectedDeck = deckName;
      this.unsavedChanges = true;
    },
    setSelectedModel(modelName) {
      this.selectedModel = modelName;
      this.unsavedChanges = true;
    },
    setAnkiHost(host) {
      this.ankiConnectHost = host;
      this.unsavedChanges = true;
    },
    setSelectedFunc(funcId) {
      this.selectedFunc = funcId;
      this.unsavedChanges = true;
    },
    asOptions(arrayOfNames) {
      return arrayOfNames.map((name) => {
        return {
          text: name,
          value: name,
        };
      });
    },
    saveSettings() {
      if (!this.unsavedChanges)
        return;
      this.ankiConnect.setAddress(this.ankiConnectHost);
      this.ankiConnect.setActiveDeck(this.selectedDeck);
      this.ankiConnect.setActiveModel(this.selectedModel);
      this.funcStore.setSelectedFunc(this.selectedFunc);
      this.unsavedChanges = false;
    }
  },
};
</script>

<style scoped>
.big-warning {
  color: lightcoral;
  font-size: 20px;
  font-weight: bold;
}
</style>