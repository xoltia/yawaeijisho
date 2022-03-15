<template>
  <div style="display: inline-block" @mouseenter="showTags = true" @mouseleave="showTags = false">
    <h2 class="writing"
      :style="{ borderBottom: (tags.length > 0 && !showTags) ? '2px dotted #2c3e50' : ''  }"
    >{{ `${kanji ? `${kanji}・` : ''}${kana}` }}</h2>
    <TagContainer :tags="tags" :tagLabelData="tagData" v-show="showTags"/>
  </div>
</template>

<script>
import TagContainer from './TagContainer.vue';

export default {
  name: 'Writing',
  components: {
    TagContainer
  },
  data() {
    return {
      showTags: false
    };
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
