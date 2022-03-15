<template>
  <Modal :show="show" style="text-align: center;" :showX="true" @close="$emit('close')">
    <Input
      inputType="select"
      :options="listOptions"
      @input="(list) => selectedList = list"
    />
    <Input
      :title="$t('make-active')"
      inputType="checkbox"
      :value="makeActive"
      @input="(checked) => makeActive = checked"
    />
    <br>
    <a :class="['btn', !selectedList ? 'disabled' : '']" style="display: block" @click="selectList">
      {{ makeActive ? $t('select-and-make-active') : $t('select') }}
    </a>
  </Modal>
</template>

<script>
import Modal from './Modal.vue';
import Input from './Input.vue';
import { useListStore } from '../store/useListStore';

export default {
  name: 'ListSelector',
  components: {
    Modal,
    Input
  },
  emits: ['selected', 'close'],
  data() {
    return {
      selectedList: '',
      makeActive: false,
    }
  },
  props: {
    show: Boolean
  },
  setup() {
    const listStore = useListStore();
    return { listStore };
  },
  async mounted() {
    this.listStore.getLists();
  },
  computed: {
    listOptions() {
      return this.listStore.lists.reduce((dict, list) => {
        return {
          [list._id]: list.title,
          ...dict
        };
      }, {});
    }
  },
  methods: {
    selectList() {
      if (!this.selectedList) return;
      if (this.makeActive)
        this.listStore.setActiveList(this.selectedList);
      this.$emit('selected', this.selectedList);
    }
  }
}
</script>
