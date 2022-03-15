<template>
  <div class="result">
    <div class="word">
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

    <div class="actions">
      <a v-show="showListActions && hasActiveList" class="action" @click="$emit('add-to-active', word.id)">Add to active list</a>
      <a v-show="showListActions" class="action" @click="$emit('add-to-list', word.id)">Add to list</a>
      <a class="action" @click="searchOnGoo">Search on Goo Dictionary</a>
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
    hasActiveList: {
      type: Boolean,
      default: false
    },
    showListActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-to-list', 'add-to-active'],
  methods: {
    getTags(writing) {
      const [kanji, kana] = writing;
      let tags = this.word.kanaTags[kana];
      if (kanji)
        tags = this.word.kanjiTags[kanji].concat(tags);
      return tags;
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

.result .word {
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
  }

  .action {
    margin: 0px 10px 20px 0;
  }
}
</style>
