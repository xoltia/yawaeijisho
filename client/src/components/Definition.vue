<template>
  <div class="definition-container">
    <div class="definition"><b>{{ number + 1 }}.</b> {{ definition.gloss.join('; ') }}</div>
    <TagContainer :tags="definition.tags" :tagLabelData="tagData"/>
  </div>
</template>

<script>
import TagContainer from './TagContainer.vue';

export default {
  name: 'Definition',
  components: {
    TagContainer
  },
  props: {
    tagData: Object,
    definition: Object,
    number: Number
  }
}
</script>

<style scoped>  
.definition-container {
  margin-top: 5px;
}
.definition {
  margin-bottom: 3px;
}
</style>
