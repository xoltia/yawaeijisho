<template>
  <div class="kanji">
    <h2 class="literal">{{ literal }}</h2>
    <div>
      <h3 v-if="meanings.length > 0" style="meanings">{{ meanings.join(', ') }}</h3>
      <h4 v-if="kunyomi.length > 0" class="readings">{{ $t('kunyomi') }}: {{ kunyomi.join(', ') }}</h4>
      <h4 v-if="onyomi.length > 0" class="readings">{{ $t('onyomi') }}: {{ onyomi.join(', ') }}</h4>
      <h4 v-if="nanori.length > 0" class="readings">{{ $t('nanori') }}: {{ nanori.join(', ') }}</h4>
      <h4 v-if="jlpt && gradeLevel" class="readings">
        JLPT {{ 'N' + jlpt }}, {{ $t('school-grade', [gradeLevel]) }}
      </h4>
      <h4 v-else-if="jlpt" class="readings">JLPT {{ 'N' + jlpt }}</h4>
      <h4 v-else-if="gradeLevel" style=" margin: 5px">{{ $t('school-grade', [gradeLevel]) }}</h4>
    </div>
  </div>
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

<style scoped>
.kanji {
  display: flex;
  flex-direction: row;
}

.literal {
  font-weight: 500;
  margin: 0;
  margin-right: 15px;
  font-size: 60px
}

.meanings {
  font-weight: 500;
}

.readings {
  margin: 5px 0;
  font-weight: 400;
}
</style>
