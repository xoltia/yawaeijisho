<template>
  <div class="loader-wrapper">
      <div class="loader"></div>
  </div>
</template>

<style scoped>
.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #b06bff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
