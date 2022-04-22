<template>
  <Navbar/>
  <div class="narrow" style="margin-top: 50px; text-align: left">
    <div style="tabs">
      <div :class="createTabClass('anki-connect')" @click="activeTab = 'anki-connect'">Anki Connect</div>
      <div :class="createTabClass('func-manager')" @click="activeTab = 'func-manager'">Functions</div>
    </div>

    <div class="content">
      <AnkiConnectSettings
        v-if="activeTab === 'anki-connect'"/>

      <FuncManager
        v-if="activeTab === 'func-manager'"/>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import AnkiConnectSettings from '../components/AnkiConnectSettings.vue';
import FuncManager from '../components/FuncManager.vue';

export default {
  name: 'AnkiSettings',
  data() {
    return {
      activeTab: 'anki-connect'
    };
  },
  components: {
    Navbar,
    AnkiConnectSettings,
    FuncManager
  },
  methods: {
    createTabClass(tabName) {
      return ['tab', this.activeTab === tabName ? 'active' : ''];
    }
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: row;
}

.tab {
  font-weight: bold;
  display: inline-block;
  padding: 10px 20px;
}

.tab:hover {
  cursor: pointer;
}

.tab.active {
  border-bottom: 3px solid #b06bff;
  color: #b06bff;
}

.content {
  padding: 20px;
  border-top: 1px solid #2c3e50;
}
</style>