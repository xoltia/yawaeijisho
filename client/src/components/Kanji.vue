<template>
  <h2 style="margin: 0; margin-right: 15px; font-size: 60px">{{ literal }}</h2>
  <h3 v-if="meanings.length > 0" style="font-weight: 500">{{ meanings.join(', ') }}</h3>
  <h4 v-if="kunyomi.length > 0" style="margin: 5px 0">{{ $t('kunyomi') }}: {{ kunyomi.join(', ') }}</h4>
  <h4 v-if="onyomi.length > 0" style="margin: 5px 0">{{ $t('onyomi') }}: {{ onyomi.join(', ') }}</h4>
  <h4 v-if="nanori.length > 0" style="margin: 5px 0">{{ $t('nanori') }}: {{ nanori.join(', ') }}</h4>
  <h4 v-if="jlpt && gradeLevel" style="margin: 5px 0">
    JLPT {{ 'N' + jlpt }}, {{ $t('school-grade', [gradeLevel]) }}
  </h4>
  <h4 v-else-if="jlpt" style="display: inline; margin: 5px">JLPT {{ 'N' + jlpt }}</h4>
  <h4 v-else-if="gradeLevel" style="display: inline; margin: 5px">{{ $t('school-grade', [gradeLevel]) }}</h4>
</template>

<script>
export default {
  name: 'Kanji',
  props: {
    literal: {
      type: String,
      required: true
    },
    meanings: {
      type: Array,
      default: () => []
    },
    kunyomi: {
      type: Array,
      default: () => []
    },
    onyomi: {
      type: Array,
      default: () => []
    },
    nanori: {
      type: Array,
      default: () => []
    },
    jlpt: {
      type: Number,
      default: null
    },
    gradeLevel: {
      type: Number,
      default: null
    }
  },
}
</script>