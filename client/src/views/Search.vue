<template>
  <Navbar />
  <div class="narrow">
    <h1 class="title">
      <text class="highlight">や</text>和英辞書
    </h1>
    <SearchBar
      @search-word="searchWord"
      :disabled="loadingWords"
    />
    <Sentence
      v-if="this.sentenceWords.length > 0 && !loadingWords"
      :words="this.sentenceWords"
      @search-word="searchWord"
    />
    <SearchResult
      v-for="word in words"
      :key="word.id"
      :word="word"
      :tagData="tagData"
    />
    <span style="display: block" v-if="words.length > 0">
      <text v-if="totalWordCount != words.length">
        <b>{{ totalWordCount }}</b>語の言葉の中で<b>{{ words.length }}</b>語が表示されています
      </text>
      <text v-else>
        すべての言葉が表示されています
      </text>
    </span>
    <span v-if="this.errorMessage">
      {{this.errorMessage}}
    </span>
    <button v-if="hasNextPage" id="next-pg-btn" @click="loadNextPage()">もっと見る</button>
    <Loader v-if="loadingWords"/>
  </div>
</template>

<script>
import SearchBar from '../components/SearchBar.vue';
import SearchResult from '../components/SearchResult.vue';
import Loader from '../components/Loader.vue';
import Sentence from '../components/Sentence.vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'Search',
  data() {
    return {
      words: [],
      loadingWords: false,
      tagData: {},
      lastSearch: null,
      page: 1,
      pageSize: 25,
      totalWordCount: 0,
      sentenceWords: [],
      errorMessage: ''
    }
  },
  components: {
    SearchBar,
    SearchResult,
    Loader,
    Sentence,
    Navbar
  },
  async mounted() {
    // Load tag data
    const response = await fetch(`/api/tags`);
    this.tagData = await response.json();

    // Check query param for initial word search
    if (this.$route.query.q)
      await this.searchWord(this.$route.query.q);
  },
  computed: {
    hasNextPage() {
      // There must have been a previous full search, no current search being done, and there must still be more pages
      return this.lastSearch &&
             !this.loadingWords &&
             this.page < this.totalPages;
    },
    totalPages() {
      return Math.ceil(this.totalWordCount / this.pageSize);
    },
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
    async wakachi(sentence) {
      const response = await fetch(`/api/wakachi/${sentence}`);
      return response.json();
    },
    error(message) {
      // Reset state
      this.words = [];
      this.sentenceWords = [];
      this.lastSearch = '';
      this.loadingWords = false;

      // Show error message
      this.errorMessage = message;
    },
    // Search word (or phrase if not found as word)
    // Setting final to true means that the search will stop if not found as a single word
    async searchWord(word, final=false) {
      this.$router.replace({ path: '/', query: { q: word } });
      // API will not accept >250 length params
      // Each kana/kanji character encoded = 9 length so max of 27 characters
      if (encodeURIComponent(word).length > 250) {
        return this.error('検索語句が長い過ぎます。２７文字以下にしてください');
      }
      // Reset state so old results don't show while loading
      this.page = 1;
      this.words = [];
      this.errorMessage = '';
      this.loadingWords = true;

      // See how many total matches there are
      this.totalWordCount = await this.getWordsCount(word);
      // Reset words array
      this.words = await this.getWords(word);

      // Didn't find any words try to search as sentence
      if (this.words.length === 0) {
        // If this search is already comming from a sentence search then stop
        if (final) {
          return this.error('何も見つかりませんでした');
        }

        const words = await this.wakachi(word);
        if (words.length === 0) {
          this.loadingWords = false;
          return;
        }

        this.sentenceWords = words;
        this.loadingWords = false;
        return;
      } else {
        // Clear sentence words once a single word is searched
        this.sentenceWords = [];
      }

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

<style scoped>
.title {
  font-size: 100px;
  font-weight: bold;
  width: 100%;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                        supported by Chrome, Edge, Opera and Firefox */
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
  .title {
    font-size: 65px;
  }
}

@media (max-width: 700px) {
  .title {
    font-size: 45px;
  }
}
</style>
