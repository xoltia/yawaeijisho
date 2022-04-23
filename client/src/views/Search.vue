<template>
  <Navbar :showHomeLink="false"/>
  <ListSelector
    v-if="authStore.isAuthenticated"
    :show="showListSelector"
    :disabledLists="pendingWordExistingLists"
    @selected="addWordToList"
    @close="showListSelector = false"
  />
  <NoteBuilder
    v-if="wordToProcess"
    :script="funcStore.selectedFuncScript"
    :wordId="wordToProcess"
    @finished="wordToProcess = null"
  />
  <div class="narrow">
    <h1 :class="[$i18n.locale !== 'ja' ? 'title with-sub' : 'title']">
      <text class="highlight">Ya</text>和英辞書
    </h1>
    <h2 class="subtitle" v-if="$i18n.locale !== 'ja'">
      {{ $t('subtitle') }}
    </h2>
    <SearchBar
      @search-word="searchWord"
      :disabled="loadingWords"
      ref="searchBar"
    />
    <Sentence
      v-if="this.sentenceWords.length > 0 && !loadingWords"
      :words="this.sentenceWords"
      @search-word="searchWord"
    />
    <Loader v-if="loadingWords"/>
  </div>
  <div :class="[hasKanji ? 'slightly-narrow results-container' : 'narrow']">
    <div :class="[hasKanji ? 'words-results-container' : '']">
      <div v-if="words.length > 0 && hasKanji">
        <h1 style="display: inline-block">{{ $t('words') }}</h1>
        <span style="font-size: 18px; font-weight: 400" v-if="words.length > 0 && hasKanji">
          ー {{ $t('found-n', { n: totalWordCount }) }}
        </span>
      </div>
      <SearchResult
        v-for="word in words"
        :key="word.id"
        :word="word"
        :tagData="tagData"
        :showListActions="authStore.isAuthenticated"
        :showListAdd="true"
        :showListDelete="false"
        :hasActiveList="listStore.activeList !== null"
        :alreadyInActiveList="authStore.isAuthenticated ? checkIfInActiveList(word) : false"
        :showAnkiActions="canAddAnkiNotes"
        @add-to-list="beginAddWordToList"
        @add-to-active="addWordToActiveList"
        @add-anki-note="processWord"
      />
      <span style="display: block; margin-top: 15px" v-if="words.length > 0">
        <text v-if="totalWordCount != words.length"
          v-html="$t('n-words-shown', { totalWordCount, shownCount: words.length })"
        />
        <text v-else
          v-html="$t('all-words-shown')"
        />
      </span>
      <span v-if="this.errorName">
        {{$t(this.errorName)}}
      </span>
      <button v-if="hasNextPage" id="next-pg-btn" @click="loadNextPage()">{{ $t('load-more') }}</button>
    </div>
    <div v-if="hasKanji && !loadingWords" class="kanji-results-container">
      <h1 style="display: inline-block">{{ $t('kanji') }}</h1>
      <span style="font-size: 18px; font-weight: 400" v-if="words.length > 0 && hasKanji">
        ー {{ $t('found-n', { n: kanji.length }) }}
      </span>
      <Kanji v-for="k of kanji" :key="k.literal"
        :literal="k.literal"
        :meanings="k.meanings"
        :onyomi="k.onyomi"
        :kunyomi="k.kunyomi"
        :nanori="k.nanori"
        :jlpt="k.jlpt"
        :gradeLevel="k.gradeLevel"
      />
    </div>
  </div>
</template>

<script>
import SearchBar from '../components/SearchBar.vue';
import SearchResult from '../components/SearchResult.vue';
import Loader from '../components/Loader.vue';
import Sentence from '../components/Sentence.vue';
import Navbar from '../components/Navbar.vue';
import ListSelector from '../components/ListSelector.vue';
import NoteBuilder from '../components/NoteBuilder.vue';
import Kanji from '../components/Kanji.vue';
import { useAuthStore } from '../store/useAuthStore';
import { useListStore } from '../store/useListStore';
import { useFuncStore } from '../store/useFuncStore';
import { useAnkiStore } from '../store/useAnkiStore';

export default {
  name: 'Search',
  setup() {
    const listStore = useListStore();
    const authStore = useAuthStore();
    const funcStore = useFuncStore();
    const ankiStore = useAnkiStore();

    return {
      listStore,
      authStore,
      funcStore,
      ankiStore
    };
  },
  data() {
    return {
      words: [],
      kanji: [],
      loadingWords: false,
      tagData: {},
      lastSearch: null,
      page: 1,
      pageSize: 25,
      totalWordCount: 0,
      sentenceWords: [],
      errorName: '',
      showListSelector: false,
      // Word (ID) currently waiting to be added to a list
      wordToAdd: null,
      // Word ID which is currently being processed by the active function
      wordToProcess: null
    }
  },
  components: {
    SearchBar,
    SearchResult,
    Loader,
    Sentence,
    Navbar,
    ListSelector,
    NoteBuilder,
    Kanji
  },
  async mounted() {
    // Load tag data
    const response = await fetch(`/api/tags`);
    this.tagData = await response.json();

    // Check query param for initial word search
    if (this.$route.query.q)
      await this.searchWord(this.$route.query.q);
    
    // Cannot get active func script without fetching funcs first
    if (this.canAddAnkiNotes)
      await this.funcStore.fetchFuncs();
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
    // Lists which the pending word is already in
    pendingWordExistingLists() {
      if (!this.wordToAdd)
        return [];
      return this.words.find(word => word.id === this.wordToAdd).lists;
    },
    canAddAnkiNotes() {
      return this.authStore.isAuthenticated && this.ankiStore.isInitialized && this.funcStore.hasSelectedFunc;
    },
    hasKanji() {
      return this.kanji.length > 0;
    }
  },
  methods: {
    async getWordsCount(word) {
      const response = await this.$http.get(`/api/count/${word}`);
      return response.data;
    },
    async getWords(word) {
      // The API considers page 0 to be the first page
      const response = await this.$http.get(`/api/define/${word}?page=${this.page - 1}&size=${this.pageSize}`);
      return response.data;
    },
    async wakachi(sentence) {
      const response = await this.$http.get(`/api/wakachi/${sentence}`);
      return response.data;
    },
    async getKanji(sentence) {
      const response = await this.$http.get(`/api/kanji/${sentence}`);
      return response.data;
    },
    error(errorName) {
      // Reset state
      this.words = [];
      this.kanji = [];
      this.sentenceWords = [];
      this.lastSearch = '';
      this.loadingWords = false;

      // Show error message
      this.errorName = errorName;
    },
    // Search word (or phrase if not found as word)
    // Setting final to true means that the search will stop if not found as a single word
    async searchWord(word, final=false) {
      this.$router.replace({ path: '/', query: { q: word } });
      // API will not accept >250 length params
      // Each kana/kanji character encoded = 9 length so max of 27 characters
      if (encodeURIComponent(word).length > 250) {
        return this.error('search-too-long-err');
      }
      // Reset state so old results don't show while loading
      this.page = 1;
      this.words = [];
      this.kanji = [];
      this.errorName = '';
      this.loadingWords = true;

      // See how many total matches there are
      this.totalWordCount = await this.getWordsCount(word);

      // Didn't find any words try to search as sentence
      if (this.totalWordCount === 0) {
        // If this search is already comming from a sentence search then stop
        if (final) {
          return this.error('nothing-found-err');
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

      [this.kanji, this.words] = await Promise.all([
        this.getKanji(word),
        this.getWords(word)
      ]);

      // Keep track of the last full search so that the next page method knows what to search
      this.lastSearch = word;
      this.loadingWords = false;

      // Wait for DOM updates then scroll down to show more results
      await this.$nextTick();
      this.$refs.searchBar.$el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
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
    },
    beginAddWordToList(word) {
      this.wordToAdd = word;
      this.showListSelector = true;
    },
    async addWordToList(list) {
      // Add word to list using store
      await this.listStore.addWordToList(list, this.wordToAdd);

      // Make sure that the client knows the word is in the list
      const wordAdded = this.words.find(w => w.id === this.wordToAdd);
      wordAdded.lists.push(list);

      // Reset list selection state
      this.wordToAdd = null;
      this.showListSelector = false;
    },
    async addWordToActiveList(word) {
      await this.listStore.addWordToActiveList(word);

      // Make sure that the client knows the word is in the list
      const wordAdded = this.words.find(w => w.id === word);
      wordAdded.lists.push(this.listStore.activeList);
    },
    checkIfInActiveList(word) {
      return word.lists.includes(this.listStore.activeList);
    },
    processWord(wordId) {
      this.wordToProcess = wordId;
    }
  }
}
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: row;
}

.words-results-container {
  margin: 1rem;
  width: 80%;
}

.kanji-results-container {
  margin: 1rem;
  width: 20%;
}

@media screen and (max-width: 1300px) {
  .results-container {
    flex-direction: column;
  }

  .words-results-container {
    width: 100%;
    margin: 0;
  }

  .kanji-results-container {
    width: 100%;
    margin: 0;
  }
}

.title {
  font-size: 100px;
  font-weight: 900;
  width: 100%;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                        supported by Chrome, Edge, Opera and Firefox */
}

.title.with-sub {
  margin-bottom: 0;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 2em;
  margin-top: 0;
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
  .subtitle {
    font-size: 12px;
  }
}

@media (max-width: 700px) {
  .title {
    font-size: 45px;
  }
  .subtitle {
    font-size: 10px;
  }
}
</style>
