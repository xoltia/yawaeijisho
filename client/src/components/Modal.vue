<template>
    <div class="modal-bg" v-if="show" :style="{ top: scrollHeight }">
      <div class="modal">
        <slot></slot>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Modal',
  data() {
    return {
      scrollHeight: '0px'
    }
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    show(isShowing) {
      // Show scrolling again if modal isn't visible
      if (!isShowing) {
        document.documentElement.style.overflow = 'auto';
        return;
      }

      // Compute new scroll height to move modal to everytime it is going to be shown
      this.scrollHeight = (document.documentElement.scrollTop || document.body.scrollTop) + 'px';
      // No scrolling off of modal
      document.documentElement.style.overflow = 'hidden';
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
  left: 0;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(110, 110, 110, 0.3);
  z-index: 2;
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
