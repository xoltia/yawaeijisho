<template>
  <h1 class="title">
    <text class="highlight">や</text>和英辞書
  </h1>
  <SearchBar
    @search-word="searchWord"
    :disabled="loadingWords"
  />
  <Loader v-if="loadingWords"/>
  <SearchResult v-else
    v-for="word in words"
    :key="word.id"
    :word="word"
    :tagData="tagData"
  />
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
  methods: {
    async searchWord(word) {
      this.loadingWords = true;
      const response = await fetch(`/api/define/${word}`)
      this.words = await response.json();
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
