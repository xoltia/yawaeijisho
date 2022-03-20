import JMDictAPI, { IndexNumber, JMDictWord, Index } from './api';
import { baseWordMapper, DefaultWordType } from './mapper';
import {
    kanaStringCompare,
    kanaStringStartsWith,
    kanjiStringCompare,
    kanjiStringStartsWith
} from './stringCompare';
import config from '../config';

function kanaBuilder(word: JMDictWord, index: IndexNumber): Index {
    return word.kana.map(({ text }) => [text, index]);
}

function kanjiBuilder(word: JMDictWord, index: IndexNumber): Index {
    return word.kanji.map(({ text }) => [text, index]);
}

const JMDict = new JMDictAPI<DefaultWordType, 'kanji' | 'kana'>();
    
export default JMDict;
export function setup() {
    return JMDict
        .withMapper(baseWordMapper)
        .useIndexFiles()
        .loadFile(config.jmdictLocation)
        .then(j => j.buildWordList())
        .then(j => j.createIndex('kana', kanaBuilder, kanaStringCompare, kanaStringStartsWith))
        .then(j => j.createIndex('kanji', kanjiBuilder, kanjiStringCompare, kanjiStringStartsWith));
}
