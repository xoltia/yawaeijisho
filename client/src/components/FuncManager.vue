<template>
  <div style="text-align: center">
    <Input
      v-if="!editingFuncName"
      inputType="select"
      :style="{ width: '75%', display: 'inline', height: '100%' }"
      :options="funcOptions"
      :value="selectedFunc?._id ?? 'new'"
      @input="setSelectedFunc"
    />
    <Input
      v-else
      inputType="text"
      :style="{ width: '75%', display: 'inline', height: '100%' }"
      :value="selectedFunc?.name ?? ''"
      @input="setNewFuncName"
    />
    <a class="btn" style="margin: 3px 8px; padding: 7px 12px; font-size: 14px;" @click="saveSelectedFunc">
      {{ selectedFunc === null ? $t('create') : $t('save') }}
    </a>
    <a v-if="selectedFunc" class="btn" style="margin: 3px; padding: 7px 12px; font-size: 14px;" @click="startNameEdit">
      {{ $t('edit-name') }}
    </a>
  </div>
  <div id="editor" class="editor-container" style="width: 100%; height: 600px"></div>
</template>

<script>
import loader from "@monaco-editor/loader";
import { toRaw } from 'vue-demi';
import Input from '../components/Input.vue';
import { useFuncStore } from '../store/useFuncStore';

const LIB_SOURCE = `
type XRef = [string, string, number] | [string, number | string] | [string];

interface JMDictKanji {
    common: boolean,
    text: string,
    tags: string[]
};

interface JMDictKana {
    common: boolean,
    text: string,
    tags: string[],
    appliesToKanji: string[]
};

interface JMDictLanguageSource {
    lang: string,
    full: boolean,
    wasei: boolean,
    text: string | null
};

interface JMDictGloss {
    type: 'literal' | 'figurative' | 'explanation' | null,
    lang: string,
    text: string
};

interface JMDictSense {
    partOfSpeech: string[],
    appliesToKanji: string[],
    appliesToKana: string[],
    related: XRef[],
    antonym: XRef[],
    field: string[],
    dialect: string[],
    misc: string[],
    info: string[],
    languageSource:JMDictLanguageSource[],
    gloss: JMDictGloss[]
};

interface JMDictWord {
    id: string,
    kanji: JMDictKanji[],
    kana: JMDictKana[],
    sense: JMDictSense[],
};

type Tags = Record<string, string>;

interface Definition {
    tags: Tags,
    gloss: string[]
};

interface Sense {
    writings: Array<[kanji: string | null, kana: string]>,
    defintions: Definition[]
};

interface DefaultWord {
    id: string,
    kanaTags: Tags,
    kanjiTags: Tags,
    common: boolean,
    senses: Sense[]
};

declare const word: JMDictWord;
declare const jWord: JMDictWord;
declare const yWord: DefaultWord;
declare const tags: Tags;

/** 
 * Ask the client a question with possible options to respond with.
 * Note: it is not guaranteed a result with be from the provided options.
 */
declare function input(prompt: string, options: string[]): Promise<string>;

/**
 * Signify that you have finished processing the word and return a result.
 */
declare function finish(result: Record<string, string>): void;
`;

export default {
  name: 'FuncManager',
  data() {
    return {
      selectedFunc: null,
      editor: null,
      newFuncName: '',
      editingFuncName: false,
    };
  },
  components: { Input },
  setup() {
    const funcStore = useFuncStore();
    return { funcStore };
  },
  async mounted() {
    await this.funcStore.fetchFuncs();

    loader.init().then((monaco) => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(LIB_SOURCE);

      this.editor = monaco.editor.create(document.getElementById('editor'), {
        language: 'javascript',
        theme: 'vs',
        value: `/**
 * There are two values you can access here.
 * jWord: Raw JMDict entry (recommended you use this)
 * yWord: The word entry as served by the API
 * word: Shorthand for jWord
 */`
      });
    });
  },
  watch: {
    selectedFunc(newFunc) {
      const editorText = newFunc?.script ?? '';
      // Trying to do this through proxy makes everything explode (whole page freezes) for some reason
      toRaw(this.editor).setValue(editorText);
    }
  },
  computed: {
    funcOptions() {
      const options = this.funcStore.funcs.map((func) => ({
        text: func.name,
        value: func._id
      }));

      options.push({
        text: this.$t('new-function'),
        value: 'new'
      });

      return options;
    },
  },
  methods: {
    setSelectedFunc(funcId) {
      if (funcId !== 'new') {
        this.selectedFunc = this.funcStore.funcs.find(func => func._id === funcId);
        this.newFuncName = this.selectedFunc.name;
        return;
      }

      this.selectedFunc = null;
      this.newFuncName = '';
    },
    saveSelectedFunc() {
      const func = this.selectedFunc;
      if (func === null) {
        this.funcStore.createFunc({
          name: this.$t('new-function'),
          script: toRaw(this.editor).getValue(),
        }).then(this.setSelectedFunct);
      } else {
        this.funcStore.updateFunc(func._id, {
          name: this.newFuncName || func.name,
          script: toRaw(this.editor).getValue()
        }).then(this.setSelectedFunct);
      }

      this.editingFuncName = false;
    },
    startNameEdit() {
      this.editingFuncName = true;
    },
    setNewFuncName(value) {
      this.newFuncName = value;
    },
  }
};
</script>

<style scoped>
.btn-group {
  text-align: center;
}

.editor-container {
  margin-top: 10px;
}
</style>