<template>
  <div style="display:flex;align-items:center;">
    <h2 class="writing">{{ `${kanji ? `${kanji}・` : ''}${kana}` }}</h2>
    <TagContainer :tags="tags" :tagLabelData="tagData"/>
  </div>
</template>

<script>
import TagContainer from './TagContainer.vue';

export default {
  name: 'Writing',
  components: {
      TagContainer
  },
  props: {
    kanji: {
      type: String,
      required: false
    },
    kana: {
      type: String,
      required: true
    },
    tags: {
      type: Array,
      required: true
    },
    tagData: Object
  }
}
</script>

<style scoped>
h2.writing {
  margin: 0;
  margin-right: 15px;
}
</style>
