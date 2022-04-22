type XRef = [string, string, number] | [string, number | string] | [string];

type JMDictKanji = {
    common: boolean,
    text: string,
    tags: string[]
};

type JMDictKana = {
    common: boolean,
    text: string,
    tags: string[],
    appliesToKanji: string[]
};

type JMDictLanguageSource = {
    lang: string,
    full: boolean,
    wasei: boolean,
    text: string | null
};

type JMDictGloss = {
    type: 'literal' | 'figurative' | 'explanation' | null,
    lang: string,
    text: string
};

type JMDictSense = {
    partOfSpeech: string[],
    appliesToKanji: string[],
    appliesToKana: string[],
    related: XRef[],
    antonym: XRef[],
    field: string[],
    dialect: string[],
    misc: string[],
    info: string[],
    languageSource:JMDictLanguageSource[],
    gloss: JMDictGloss[]
};


type JMDictWord = {
    id: string,
    kanji: JMDictKanji[],
    kana: JMDictKana[],
    sense: JMDictSense[],
};

type Tags = Record<string, string>;

type Definition = {
    tags: Tags,
    gloss: string[]
};

type Sense = {
    writings: Array<[kanji: string | null, kana: string]>,
    defintions: Definition[]
};

type DefaultWord = {
    id: string,
    kanaTags: Tags,
    kanjiTags: Tags,
    common: boolean,
    senses: Sense[]
};

declare const word: JMDictWord;
declare const jWord: JMDictWord;
declare const yWord: DefaultWord;
