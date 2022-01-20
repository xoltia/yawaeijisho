<template>
  <h1 class="title">
    <text class="highlight">や</text>和英辞書
  </h1>
  <SearchBar
    @search-word="searchWord"
    :disabled="loadingWords"
  />
  <SearchResult
    v-for="word in words"
    :key="word.id"
    :word="word"
    :tagData="tagData"
  />
  <button v-if="hasNextPage" id="next-pg-btn" @click="loadNextPage()">もっと見る</button>
  <Loader v-if="loadingWords"/>
</template>

<script>
import SearchBar from './components/SearchBar.vue';
import SearchResult from './components/SearchResult.vue';
import Loader from './components/Loader.vue';

export default {
  name: 'App',
  data() {
    return {
      words: [],
      loadingWords: false,
      tagData: {},
      lastSearch: null,
      page: 1,
      pageSize: 25,
      totalPages: 0
    }
  },
  components: {
    SearchBar,
    SearchResult,
    Loader
  },
  async mounted() {
    const response = await fetch(`/api/tags`);
    this.tagData = await response.json();
  },
  computed: {
    hasNextPage() {
      // There must have been a previous full search, no current search being done, and there must still be more pages
      return this.lastSearch &&
             !this.loadingWords &&
             this.page < this.totalPages;
    }
  },
  methods: {
    async getWordsCount(word) {
      const response = await fetch(`/api/count/${word}`);
      return response.json();
    },
    async getWords(word) {
      // The API considers page 0 to be the first page
      const response = await fetch(`/api/define/${word}?page=${this.page - 1}&size=${this.pageSize}`);
      return response.json();
    },
    async searchWord(word) {
      // Reset state so old results don't show while loading
      this.page = 1;
      this.words = [];
      this.loadingWords = true;

      // See how many total matches there are and determine how many possible pages there are
      const wordsCount = await this.getWordsCount(word);
      this.totalPages = Math.ceil(wordsCount / this.pageSize);
      // Reset words array
      this.words = await this.getWords(word);
      // Keep track of the last full search so that the next page method knows what to search
      this.lastSearch = word;

      this.loadingWords = false;
    },
    async loadNextPage() {
      // Increase page count and show loading
      this.page += 1;
      this.loadingWords = true;

      // Research the word now that the page number has changed
      const nextPage = await this.getWords(this.lastSearch);
      // Combine the old results with the next page
      this.words = [...this.words, ...nextPage];
      // Stop showing as loading
      this.loadingWords = false;
    }
  }
}
</script>

<style>
#app {
  font-family: 'Noto Sans JP', sans-serif;;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin: auto;
  max-width: 900px;
}

.title {
  font-size: 100px;
  font-weight: bold;
  width: 100%;
}

.highlight {
  color: #b06bff;
}

.highlight-bg {
  background: #b06bff;
}

#next-pg-btn {
  background: none;
  border: none;
  padding: 0;
  color: #b06bff;
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 1100px) {
  #app {
    margin: 0 15%;
  }
  .title {
    font-size: 65px;
  }
}

@media (max-width: 700px) {
  #app {
    margin: 0 10px;
  }
  .title {
    font-size: 45px;
  }
}
</style>
