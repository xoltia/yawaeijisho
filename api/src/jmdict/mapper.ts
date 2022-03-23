import { JMDictWord } from './api';

type Tags = Record<string, string>;

interface Definition {
    tags: Tags,
    gloss: string[]
}

interface Sense {
    writings: Array<[kanji: string | null, kana: string]>,
    defintions: Definition[]
}

export interface DefaultWordType {
    id: string,
    kanaTags: Tags,
    kanjiTags: Tags,
    common: boolean,
    senses: Sense[]
}

export function baseWordMapper(word: JMDictWord): DefaultWordType {
    /* Array of possible definitions and the possible ways they can be written
    *  Format is [[[WRITINGS], [DEFINITIONS]]...]
    *  Where each writing is a kana/kanji pair and a sense if the tags and glosses
    *  Ex: { writings: [["京都", "きょうと"], ...], senses: [{tags: [...], gloss: ["..."]}] } */
    const senses = [];
    // List of kanji which are acceptable to use for a specific kana writing
    // Ex: { "きょうとうふ": ["*"] }
    const kanaApplKanji = word.kana.reduce((dict, kana) => ({ ...dict, [kana.text]: kana.appliesToKanji }), {});
    // Tags which apply to a specific kana/kanji, not a specific sense
    const kanaTags = word.kana.reduce((dict, kana) => ({ ...dict, [kana.text]: kana.tags }), {});
    const kanjiTags = word.kanji.reduce((dict, kanji) => ({ ...dict, [kanji.text]: kanji.tags }), {});
    const common = word.kanji.some((k) => k.common) || word.kana.some((k) => k.common);

    for (let sense of word.sense) {
        let applKanji = sense.appliesToKanji;
        let applKana = sense.appliesToKana;

        if (applKana[0] === '*')
            applKana = word.kana.map(k => k.text);
        if (applKanji[0] === '*')
            applKanji = word.kanji.map(k => k.text);

        // Array of possible writings where each element is an array of the kanji/kana pair
        // Ex: [["紅葉", "もみじ"], ["黄葉", "もみじ"]]
        const writings = applKanji.length === 0 ?
            applKana.map((kana) => [null, kana]) :
            applKana.map((kana) => applKanji.flatMap((kanji) => {
                if (kanaApplKanji[kana].length === 0)
                    return [[null, kana]];
                if (kanaApplKanji[kana][0] === '*' || kanaApplKanji[kana].includes(kanji))
                    return [[kanji, kana]];
                return [];
            })).flat();

        const tags = [
            ...sense.partOfSpeech,
            ...sense.field,
            ...sense.dialect,
        ];

        const gloss = sense.gloss.map((g) => g.text);
        const finalSense = senses.find((sense) => arrayCompare(sense.writings, writings));
        
        if (finalSense)
            finalSense.definitions.push({ tags, gloss });
        else
            senses.push({writings, definitions: [{ tags, gloss }]});
    }

    return { id: word.id, kanaTags, kanjiTags, common, senses };
};

// Checks if two arrays contain the same values where order does not matter
function arrayCompare(arr1: any[], arr2: any[]): boolean {
    // False if either arguments are not an array or if one is larger
    if (!(Array.isArray(arr1) && Array.isArray(arr2)))
        return false;
    if (arr1.length !== arr2.length)
        return false;

    for (let el of arr1) {
        // If array then check for another array which passes array compare
        if (Array.isArray(el) &&
            arr2.find((el2) => arrayCompare(el, el2)) !== undefined)
            continue;
        // Otherwise just check if the (non-array) element is present
        if (arr2.includes(el))
            continue;
        return false;
    }
    return true;
}
