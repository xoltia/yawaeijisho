<template>
  <Navbar :showListsLink="false"/>
  <Modal :show="showCreateModal">
    <h2 class="highlight form-title">{{ $t('new-list') }}</h2>
    <Input
      :title="$t('title')"
      :value="title"
      @input="(value) => title = value"
      :errors="errors.title || []"/>
    <Input
      :title="$t('description')"
      inputType="paragraph"
      :value="description" @input="(value) => description = value"
      :errors="errors.description || []"/>
    <Input
      :title="$t('slug')"
      :value="slug"
      :disabled="autoSlug"
      @input="(value) => slug = value"
      :errors="errors.slug || []"/>
    <Input
      :title="$t('auto-slug')"
      inputType="checkbox"
      :value="autoSlug" @input="(value) => autoSlug = value"/>
    <Input
      :title="$t('public')"
      inputType="checkbox"
      :value="isPublic" @input="(value) => isPublic = value"/>

    <Loader v-if="creatingList"/>
    <div v-else style="margin-top: 20px;">
      <a :class="['btn', canSubmit ? '' : 'disabled']" style="margin-right: 10px" @click="createList">{{ $t('submit') }}</a>
      <a class="btn invert" @click="closeModal">{{ $t('cancel') }}</a>
    </div>
  </Modal>
  <Modal :show="showDeleteModal" style="text-align: center">
    <h4 style="margin-top: 0; margin-bottom: 40px">{{ $t('deletion-confirmation') }}</h4>
    <a class="btn danger" style="margin: 5px;" @click="confirmDelete">{{ $t('delete') }}</a>
    <a class="btn invert" style="margin: 5px;" @click="this.showDeleteModal = false">{{ $t('cancel') }}</a>
  </Modal>
  <div class="slighly-narrow">
    <div class="header">
      <h1>{{ $t('my-lists') }}</h1>
      <a class="btn" @click="this.showCreateModal = true">{{ $t('create-list') }}</a>
    </div>
    <Loader v-if="listStore.isLoading"/>
    <div v-else class="lists">
      <List v-for="list in listStore.lists"
        :key="list._id"
        :list="list"
        :tagData="tagData"
        @delete="startDelete"
      />
    </div>
  </div>
</template>

<script>
import { useListStore } from '../store/useListStore';
import Navbar from '../components/Navbar.vue';
import Loader from '../components/Loader.vue';
import List from '../components/List.vue';
import Modal from '../components/Modal.vue';
import Input from '../components/Input.vue';

export default {
  name: 'Lists',
  components: {
    Navbar,
    Loader,
    List,
    Modal,
    Input
  },
  data() {
    return {
      tagData: {},
      showCreateModal: false,
      showDeleteModal: false,

      // Data for creating a new list
      title: '',
      description: '',
      slug: '',
      autoSlug: false,
      isPublic: true,

      // State relating to list creaton
      errors: {},
      creatingList: false,

      // ID of list currently up for deletion (awaiting user confirmation)
      pendingDeletion: null,
    }
  },
  setup() {
    const listStore = useListStore();
    return { listStore };
  },
  async mounted() {
    this.listStore.fetchLists();
    // TODO: reusable tags across all routes?
    const response = await fetch(`/api/tags`);
    this.tagData = await response.json();
  },
  computed: {
    canSubmit() {
      return this.title.length >= 3;
    }
  },
  methods: {
    closeModal() {
      // Reset create state and hide modal
      this.title = '';
      this.description = '';
      this.slug = '';
      this.autoSlug = false;
      this.isPublic = true;
      this.showCreateModal = false;
    },
    async createList() {
      if (!this.canSubmit)
        return;

      // Reset errors and show list is being created
      this.errors = {};
      this.creatingList = true;
      try
        {
          // Try to create the list
          await this.listStore.createList({
            title: this.title,
            description: this.description,
            slug: this.autoSlug ? undefined : this.slug,
            public: this.isPublic
          });
          this.creatingList = false;
          this.closeModal();
      } catch (e) {
        // Failed to create list
        this.creatingList = false;
        // Parse errors and map to error object
        for (let err of (e.response.data.errors || [e.response.data])) {
          const param = err.error.split('_')[1].toLowerCase();
          const message = err.message;
          this.errors[param] = this.errors[param] || [];
          this.errors[param].push({ name: err.error, message });
        }
      }
    },
    startDelete(id) {
      //await this.listStore.deleteList(id);
      this.pendingDeletion = id;
      this.showDeleteModal = true;
    },
    confirmDelete() {
      this.listStore.deleteList(this.pendingDeletion);
      this.showDeleteModal = false;
    }
  }
}
</script>

<style scoped>
.form-title {
  margin-top: 0;
  font-weight: 300;
}

.lists {
  display: flex;
  flex-direction: column;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.header {
  display: flex;
  padding: 0 25px;
  margin-top: 50px;
  align-items: center;
}

.header .btn {
  margin-left: auto;
  height: 100%;
}

@media only screen and (max-width: 400px) {
  .header {
    padding: 0;
    flex-direction: column;
  }

  .header .btn {
    margin: 0 0 15px 0;
  }
}

.slighly-narrow {
  margin-top: 60px;
  margin: auto;
  max-width: 1300px;
}
</style>
