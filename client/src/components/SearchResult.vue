<template>
  <div class="result" :class="[forceCompactStyle ? 'compact-mode' : '']">
    <div class="word" :class="[forceCompactStyle ? 'compact-mode' : '']">
      <div class="sense-container" v-for="sense in word.senses" :key="sense.writings">
        <Writing v-for="writing in sense.writings"
          :key="writing"
          :kanji="writing[0]"
          :kana="writing[1]"
          :tags="getTags(writing)"
          :tagData="tagData"
        />
        <Definition v-for="(definition, index) in sense.definitions"
          :key="index"
          :number="index"
          :definition="definition"
          :tagData="tagData"
        />
      </div>
    </div>

    <div class="actions" :class="[forceCompactStyle ? 'compact-mode' : '']">
      <a v-show="showListActions && showListAdd && hasActiveList" :class="['action', alreadyInActiveList ? 'disabled': '']" @click="addToActive">
        {{ alreadyInActiveList ? $t('already-in-active') : $t('add-to-active') }}
      </a>
      <a v-show="showListActions && showListAdd" class="action" @click="$emit('add-to-list', word.id)">
        {{ $t('add-to-list') }}
      </a>
      <a v-show="showListActions && showListDelete" class="action" @click="$emit('delete-from-list', word.id)">
        {{ $t('delete-from-list') }}
      </a>
      <a class="action" @click="searchOnGoo">
        {{ $t('search-goo') }}
      </a>
      <a v-show="showAnkiActions" class="action" @click="$emit('add-anki-note', word.id)">
        {{ $t('add-anki-note') }}
      </a>
    </div>
  </div>
</template>

<script>
import Writing from './Writing.vue';
import Definition from './Definition.vue';

export default {
  name: 'SearchResult',
  components: {
    Writing,
    Definition
  },
  props: {
    word: Object,
    tagData: Object,
    // Whether or not there is an active list
    hasActiveList: {
      type: Boolean,
      default: false
    },
    // If set to true then the add to active list button is disabled
    alreadyInActiveList: {
      type: Boolean,
      default: false
    },
    // If false does not show any list actions
    showListActions: {
      type: Boolean,
      default: false
    },
    // If false does not show word list addition action (both active and selection add)
    showListAdd: {
      type: Boolean,
      default: true
    },
    // If false does not show list word deletion action
    showListDelete: {
      type: Boolean,
      default: false
    },
    // If false does not show add to anki action
    showAnkiActions: {
      type: Boolean,
      default: false
    },
    forceCompactStyle: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-to-list', 'add-to-active', 'delete-from-list', 'add-anki-note'],
  methods: {
    getTags(writing) {
      const [kanji, kana] = writing;
      let tags = this.word.kanaTags[kana];
      if (kanji)
        tags = this.word.kanjiTags[kanji].concat(tags);
      return tags;
    },
    addToActive() {
      if (this.alreadyInActiveList)
        return;
      this.$emit('add-to-active', this.word.id);
    },
    searchOnGoo() {
      // First kanji or kana
      const [firstKanji, firstKana] = this.word.senses[0].writings[0];
      const searchTerm = firstKanji || firstKana;
      window.open(`https://dictionary.goo.ne.jp/srch/all/${searchTerm}/m1u/`, '_blank');
    }
  }
}
</script>

<style scoped>
.sense-container {
  text-align: left;
  margin: 15px 0;
  padding-bottom: 10px;
}

.result {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #d0dbe6;
}

.word {
  width: 90%;
}

.actions {
  display: flex;
  flex-direction: column;
  width: 10%;
  text-align: right;
  align-items: right;
  justify-content: center;
}

.action {
  font-size: 11px;
  margin: 5px 0;
  color: #b06bff;
  text-decoration: underline;
}

.action:hover {
  cursor: pointer;
}

.action.disabled {
  color: gray;
}

.action.disabled:hover {
  cursor: default;
}

@media screen and (max-width: 1100px) {
  .result {
    flex-direction: column;
  }

  .word, .actions {
    width: 100%;
  }

  .actions {
    flex-direction: row;
    align-items: center;
    justify-content: left;
    text-align: left;
    flex-wrap: wrap;
  }

  .action {
    margin: 0px 10px 20px 0;
  }
}

/* Do everything that is normally done in response to screen resize no matter screen size */
.result.compact-mode {
  flex-direction: column;
}

.word.compact-mode, .actions.compact-mode {
  width: 100%;
}

.actions.compact-mode {
  flex-direction: row;
  align-items: center;
  justify-content: left;
  text-align: left;
  flex-wrap: wrap;
}

.actions.compact-mode > .action {
  margin: 0px 10px 20px 0;
}
</style>
