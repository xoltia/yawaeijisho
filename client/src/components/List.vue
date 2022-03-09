<template>
  <button @click="showList()" style="display: flex" class="list-collapsible dark" :class="[active ? 'active' : '']">
    <text style="width: 95%;">{{ list.title }}</text>
    <font-awesome-icon style="width: 5%;" :icon="'chevron-' + (active ? 'up' : 'down')"/>
  </button>
  <div class="list-content" :style="{ display: active ? 'block': 'none' }">
    <Loader style="margin: 10px" v-if="loadingWords"/>
    <div v-else>
      <div class="list-info">
        <p v-if="list.description">{{ list.description  }}</p>
        <h6 class="list-property">{{ $t('created-at') }}: {{ list.createdAt  }}</h6>
        <h6 class="list-property">{{ $t('id') }}: {{ list._id  }}</h6>
      </div>
      <div class="words">
        <div class="word-selectors">
          <button class="word-selector"
            v-for="(word, index) in listWords"
            @click="this.selectedWord = index"
            :key="'selector-' + word.id"
            :word="word"
            :class="[selectedWord === index ? 'active' : '']"
          >{{ wordSelectorLabel(word) }}</button>
          <button class="word-selector"
            @click="this.loadNextWordPage"
            v-if="remainingWords > 0"
          >{{ $t('load-more') }} ({{ remainingWords }}{{ $t('remaining') }})</button>
        </div>
        <div class="word-view">
          <SearchResult v-if="listWords.length > 0"
            :word="listWords[selectedWord]"
            :tagData="tagData"
            :compact="true"
          />
          <div style="text-align: center; margin-top: 100px" v-else>
            {{ $t('nothing-added') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../components/Loader.vue';
import SearchResult from '../components/SearchResult.vue';

export default {
  name: 'List',
  components: {
    Loader,
    SearchResult
  },
  data() {
    return {
      page: -1,
      listWordIDs: [],
      listWords: [],
      loadingWords: true,
      active: false,
      selectedWord: 0
    }
  },
  props: {
    list: Object,
    pageSize: {
      type: Number,
      default: 25
    },
    tagData: Object
  },
  computed: {
    remainingWords() {
      return Math.max(0, this.listWordIDs.length - this.page * this.pageSize)
    }
  },
  methods: {
    wordSelectorLabel(word) {
      // Get kanji kana pair of first writing
      const [kanji, kana] = word.senses[0].writings[0];
      return kanji ? kanji + '・' + kana : kana;
    },
    async showList() {
      this.active = !this.active;

      // Load first page as soon as first opened
      if (this.page === -1) {
        this.loadingWords = true;
        this.listWords = [];
        this.page = 0;
        this.listWordIDs = await this.getWordIDs();
        await this.loadNextWordPage();
        this.loadingWords = false;
      }
    },
    async getWordIDs() {
      const response = await this.$http.get(`/api/lists/${this.list._id}/words`);
      return response.data;
    },
    async loadNextWordPage() {
      const nextBegin = this.page * this.pageSize;
      const nextEnd = nextBegin + this.pageSize;
      const nextSet = this.listWordIDs.slice(nextBegin, nextEnd);
      if (nextSet.length === 0)
          return;

      const response = await this.$http.get('/api/words', {
          params: { id: nextSet.join(',') }
      });

      this.listWords.push(...response.data);
      this.page++;
    }
  }
}
</script>


<style scoped>
.list-property {
  margin: 0;
  display: inline-block;
  margin-right: 15px;
}

.words {
  display: flex;
  height: 500px;
}

.word-selector {
  cursor: pointer;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  overflow-wrap: break-word;
  margin: 0;
  padding: 10px;
  font-weight: bold;
  color: #2c3e50;
  /*border-bottom: 1px solid #2c3e50;*/
}

.word-selector:nth-child(even) {
  background-color: whitesmoke;
}

.word-selectors {
  background-color: #eee;
  width: 25%;
  overflow-wrap: break-word;
  margin-right: 10px;
  overflow-y: scroll;
}

.list-collapsible {
  background-color: #eee;
  color: #2c3e50;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  overflow-wrap: break-word;
  font-weight: bold;
  font-size: 20px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.list-collapsible.active {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
}

.word-selector.active, .list-collapsible:hover {
  background-color: #b06bff;
  color: white;
}

.active.dark {
  background-color: #2c3e50;
  color: white;
}

.list-content {
  padding: 0;
  display: none;
  overflow: hidden;
  background-color: #f1f1f1;
  text-align: left;
  margin-bottom: 10px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.list-info {
  background-color: #e2e2e2; 
  padding: 18px;
}

.list-info p {
  margin-top: 0;
}

.word-view {
  width: 75%;
  overflow-y: scroll;
}
</style>
