<template>
  <h3 class="title">{{ title }}</h3>
  <input v-if="!paragraph"
    :class="['input', errors.length > 0 ? 'error' : '']"
    :type="inputType"
    :disabled="disabled"
    v-model="inputValue"/>
  <textarea v-else rows="4"
    :class="['input', errors.length > 0 ? 'error' : '']"
    :disabled="disabled"
    v-model="inputValue"/>
  <div class="error-msg" v-for="err in errors" :key="err.name">
    {{ err.message || err.name }}
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    title: {
      type: String,
      required: false
    },
    inputType: {
      type: String,
      default: 'text'
    },
    paragraph: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: null,
    errors: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    inputValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  emits: ['input']
}
</script>

<style scoped>
.input {
  font-size: 15px;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid lightgray;
  width: 300px;
  display: block;
}

@media screen and (max-width: 500px) {
  .input {
    width: 250px;
  }

  textarea.input {
    resize: auto;
  }
}

@media screen and (max-width: 300px) {
  .input {
    width: 200px;
  }

  textarea.input {
    resize: auto;
  }
}

textarea.input {
  resize: vertical;
}

.input[type='checkbox'] {
  width: auto;
  display: inline-block;
  margin: 20px 20px 0 10px;
}

.title {
  margin: 7px 0;
  font-size: 14px;
  display: inline-block;
}

.error-msg {
  font-size: 10px;
  padding: 3px;
  color: lightcoral;
  border-radius: 3px;
  margin-bottom: 10px;
}

.input.error {
  border-color: lightcoral;
}
</style>
