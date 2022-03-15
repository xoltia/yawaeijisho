<template>
    <div class="modal-bg" v-if="show" :style="{ top: scrollHeight }">
      <div class="modal">
        <div class="header" v-if="showX">
          <font-awesome-icon icon="x" @click="$emit('close')" class="close-btn"></font-awesome-icon>
        </div>
        <div class="content" :style="showX ? { padding: '50px', paddingTop: '15px' } : { padding: '50px' }">
          <slot></slot>
        </div>
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
    },
    showX: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
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
}

.modal .header {
  padding: 25px 50px 0 0;
  text-align: right;
}

.modal .close-btn:hover {
  cursor: pointer;
  color: lightcoral;
}

@media only screen and (max-width: 600px) {
  .modal-bg {
    background: whitesmoke;
  }
}
</style>
