<template>
    <div class="word-container">
      <div v-for="[i, word] in this.words.entries()"
      :key="i"
      class="word"
      :class="[word[1] !== null ? '' : 'unsearchable']"
      @click="search(word[1])">
        {{word[0]}}
      </div>
    </div>
</template>

<script>
export default {
  name: 'Sentence',
  props: {
    words: Array
  },
  methods: {
    search(word) {
      if (word === null)
        return;
      this.$emit('search-word', word, true);
    }
  },
  emits: ['search-word']
}
</script>

<style scoped>
.word-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.word {
  font-size: 25px;
  margin: 0px 4px;
  text-decoration: underline;
}

.word:hover {
  cursor: pointer;
}

.word.unsearchable {
  text-decoration: none;
  cursor: unset;
}
</style>
