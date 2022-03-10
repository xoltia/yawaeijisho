<template>
    <div class="modal-bg" v-show="show">
      <div class="modal">
        <slot></slot>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    show() {
      document.documentElement.style.overflow = this.show ? 'hidden' : 'auto';
      // TODO: allow user to stay at scroll height
      window.scrollTo(0, 0);
    }
  }
}
</script>

<style scoped>
html, body {
  overflow: hidden;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(110, 110, 110, 0.3);
}

.modal {
  background: whitesmoke;
  border-radius: 7px;
  padding: 50px;
}

@media only screen and (max-width: 600px) {
  .modal-bg {
    background: whitesmoke;
  }
}
</style>
