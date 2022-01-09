<!-- TODO: COMPONENTS -->

<template>
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
  },
  methods: {
    getTags(writing) {
      const [kanji, kana] = writing;
      let tags = this.word.kanaTags[kana];
      if (kanji)
        tags = this.word.kanjiTags[kanji].concat(tags);
      return tags;
    }
  }
}
</script>

<style scoped>
.sense-container {
  text-align: left;
  margin-top: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #d0dbe6;
}
</style>
