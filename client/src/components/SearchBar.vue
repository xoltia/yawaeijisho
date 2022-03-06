<template>
  <div id="search-bar">
    <input
      id="search-input"
      ref="search"
      v-model.lazy="searchInput"
      @keyup.enter="search"
      :placeholder="$t('search-placeholder')"
    />
    <button
      id="search-button"
      class="highlight-bg"
      @click="search"
      :disabled="disabled">{{ $t('search-button') }}</button>
  </div>
</template>

<script>
import { bind as bindWanakana } from 'wanakana';

export default {
  name: 'SearchBar',
  data() {
    return {
      searchInput: this.$route.query.q ?? '',
    }
  },
  props: {
    disabled: Boolean
  },
  mounted() {
    this.focusInput();
    bindWanakana(this.$refs.search);
  },
  methods: {
    focusInput() {
      this.$refs.search.focus();
    },
    search() {
      if (this.disabled || this.searchInput.length === 0)
        return;
      this.$emit('search-word', this.$data.searchInput.trim());
    }
  },
  emits: ['search-word']
}
</script>

<style scoped>
#search-bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 50px;
  margin-bottom: 20px;
}

#search-input, #search-button {
  display: inline-block;
  font-size: 20px;
  border-radius: 0;
  -webkit-appearance: none;
  font-family: inherit;
}

#search-input {
  width: 100%;
  padding: 0px 10px;
  border: 1px solid #aab6c2;
  border-right: none;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}

#search-input:focus {
  outline: none;
}

#search-button {
  width: 100px;
  color: white;
  border: 1px solid #b06bff;
  border-left: none;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}

#search-button:hover {
  border: 1px solid #a352ff;
  border-left: none;
  background: #a352ff;
  cursor: pointer;
}

#search-button:disabled {
  cursor: auto;
  background: #f3f3f3;
  color: gray;
  border: 1px solid #aab6c2;
  border-left: none;
}
</style>
