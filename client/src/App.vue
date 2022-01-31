<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Noto Sans JP', sans-serif;;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin: auto;
  max-width: 900px;
}

.highlight {
  color: #b06bff;
}

.highlight-bg {
  background: #b06bff;
}

@media (max-width: 1100px) {
  #app {
    margin: 0 15%;
  }
}

@media (max-width: 700px) {
  #app {
    margin: 0 10px;
  }
}
</style>
