<template>
  <select v-model="selectedLang">
    <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">
      {{ lang }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'LocaleSwitcher',
  data () {
    return {
      langs: ['ja', 'en'],
      selectedLang: this.$i18n.locale,
    }
  },
  watch: {
    selectedLang: function(value) {
      this.$i18n.locale = value;
      localStorage.setItem('preferences.lang', value);
    }
  }
}
</script>
