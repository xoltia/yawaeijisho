<template>
  <span class="tooltip">{{ text }}</span>
</template>

<script>
export default {
  name: 'Tooltip',
  props: {
    text: String
  }
}
</script>

<style scoped>
.tooltip {
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 0;
  right: -140px;
  margin-left: -60px;
}
</style>