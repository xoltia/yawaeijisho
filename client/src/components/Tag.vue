<template>
  <div class="tag"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    :style="{ backgroundColor: tagColor }">
    {{ tag }}
    <Tooltip :text="tagDetails" v-show="showTooltip"/>
  </div>
</template>

<script>
import Tooltip from './Tooltip.vue';
import ColorHash from 'color-hash';
const colorHash = new ColorHash({lightness: 0.5});

export default {
  components: {
    Tooltip
  },
  data() {
    return {
      showTooltip: false
    };
  },
  props: {
    tag: String,
    tagDetails: String,
  },
  computed: {
    tagColor() {
      return colorHash.hex(this.tag);
    }
  }
}
</script>

<style scoped>
.tag {
  min-width: 20px;
  border-radius: 5px;
  text-align: center;
  font-size: 4px;
  padding: 3px 5px;
  margin-right: 5px;
  color: white;

  /* Needed for tooltip to work */
  position: relative;
  display: inline-block;
}
</style>