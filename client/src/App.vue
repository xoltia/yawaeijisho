<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body {
  background: whitesmoke;
}

#app {
  font-family: 'Noto Sans JP', sans-serif;;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.narrow {
  text-align: center;
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
  .narrow {
    margin: 0 15%;
  }
}

@media (max-width: 700px) {
  .narrow {
    margin: 0 10px;
  }
}

/* TODO: Button component? */
.btn {
  padding: 10px 20px;
  border-radius: 3px;
  color: white;
  text-decoration: none;
  background: #b06bff;
  user-select: none;
}

.btn.invert {
  border: 1px solid #b06bff;
  color: #b06bff;
  background: transparent;
}

.btn.danger {
  border: 1px solid lightcoral;
  background: lightcoral;
  color: white;
}

.btn:hover {
  background: #a352ff;
  cursor: pointer;
}

.btn.invert:hover {
  color: white;
}

.btn.danger:hover {
  background: #ff5151;
}

.btn.disabled {
  cursor: auto;
  background: #f3f3f3;
  color: gray;
  border: 1px solid #aab6c2;
}

a {
  color: #2c3e50;
  text-decoration: none;
}
</style>
