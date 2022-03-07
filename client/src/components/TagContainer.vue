<template>
  <div class="tag-container">
    <Tag
      v-for="tag in tags"
      :key="tag"
      :tag="tag"
      :tagDetails="tagLabelData[tag]"
    />
  </div>
</template>

<script>
import Tag from './Tag.vue';

export default {
  name: 'TagContainer',
  components: {
    Tag
  },
  props: {
    tags: Array,
    tagLabelData: Object
  }
}
</script>

<style scoped>
.tag-container {
  display: flex;
}
</style>
