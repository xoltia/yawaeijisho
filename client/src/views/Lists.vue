<template>
  <Navbar :showListsLink="false"/>
  <div class="slighly-narrow">
    <h1>{{ $t('my-lists') }}</h1>
    <Loader v-if="listStore.isLoading"/>
    <div v-else class="lists">
      <List v-for="list in listStore.lists"
        :key="list._id"
        :list="list"
      />
    </div>
  </div>
</template>

<script>
import { useListStore } from '../store/useListStore';
import Navbar from '../components/Navbar.vue';
import Loader from '../components/Loader.vue';
import List from '../components/List.vue';

export default {
  name: 'Lists',
  components: {
    Navbar,
    Loader,
    List
  },
  setup() {
    const listStore = useListStore();
    return { listStore };
  },
  mounted() {
    this.listStore.fetchLists();
  }
}
</script>

<style scoped>
.lists {
  display: flex;
  flex-direction: column;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.slighly-narrow {
  text-align: center;
  margin-top: 60px;
  margin: auto;
  max-width: 1300px;
}
</style>