type CompareFunction = (a: string, b: string) => number;

const HIR_START = 'ぁ'.charCodeAt(0);
const HIR_END = 'ゖ'.charCodeAt(0);
const KAT_START = 'ァ'.charCodeAt(0);
const CHOUONKIGOU = 'ー'.charCodeAt(0);
const KURIKAESHIKIGOU = 'ゝ'.charCodeAt(0);
const KAT_KURIKAESHIKIGOU = 'ヽ'.charCodeAt(0);
const KOKAKIMOJI_MAP = createCharCodeMap({
    'ァ': 'ア',
    'ィ': 'イ',
    'ゥ': 'ウ',
    'ェ': 'エ',
    'ォ': 'オ',
    'ッ': 'ツ',
    'ャ': 'ヤ',
    'ュ': 'ユ',
    'ョ': 'ヨ',

    'ヮ': 'ワ' // Only appears in like 3 words?
});

const ONBIKI_MAP = createCharCodeMap({
    'ア': 'ア',  'イ': 'イ',  'ウ': 'ウ',  'エ': 'エ',  'オ': 'オ',
                              'ヴ': 'ウ',

    'カ': 'ア',  'キ': 'イ',  'ク': 'ウ',  'ケ': 'エ',  'コ': 'オ',
    'ガ': 'ア',  'ギ': 'イ',  'グ': 'ウ',  'ゲ': 'エ',  'ゴ': 'オ',    // K

    'サ': 'ア',  'シ': 'イ',  'ス': 'ウ',  'セ': 'エ',  'ソ': 'オ',
    'ザ': 'ア',  'ジ': 'イ',  'ズ': 'ウ',  'ゼ': 'エ',  'ゾ': 'オ',    // S

    'タ': 'ア',  'チ': 'イ',  'ツ': 'ウ',  'テ': 'エ',  'ト': 'オ',
    'ダ': 'ア',  'ヂ': 'イ',  'ヅ': 'ウ',  'デ': 'エ',  'ド': 'オ',    // T

    'ナ': 'ア',  'ニ': 'イ',  'ヌ': 'ウ',  'ネ': 'エ',  'ノ': 'オ',    // N

    'ハ': 'ア',  'ヒ': 'イ',  'フ': 'ウ',  'ヘ': 'エ',  'ホ': 'オ',
    'バ': 'ア',  'ビ': 'イ',  'ブ': 'ウ',  'ベ': 'エ',  'ボ': 'オ',
    'パ': 'ア',  'ピ': 'イ',  'プ': 'ウ',  'ペ': 'エ',  'ポ': 'オ',    // H

    'マ': 'ア',  'ミ': 'イ',  'ム': 'ウ',  'メ': 'エ',  'モ': 'オ',    // M

    'ヤ': 'ア',               'ユ': 'ウ',               'ヨ': 'オ',    // Y

    'ラ': 'ア',  'リ': 'イ',  'ル': 'ウ',  'レ': 'エ',  'ロ': 'オ',    // R

    'ワ': 'ア',  'ヰ': 'イ',                            'ヲ': 'オ',    // W

    'ン': 'ン',
});

/**
 * Create a map with UTF-16 char code keys and values from an object
 */
function createCharCodeMap(obj: Record<string, string>): Map<number, number> {
    return new Map(
        Object.entries(obj).map(([k, v]) =>
            [k.charCodeAt(0), v.charCodeAt(0)]
        )
    );
};

/**
 * Whether kana is a kurikaeshi character
 */
function isKurikaeshiKigou(charCode: number): boolean {
    return charCode === KURIKAESHIKIGOU || charCode === KURIKAESHIKIGOU + 1 ||
           charCode === KAT_KURIKAESHIKIGOU || charCode === KAT_KURIKAESHIKIGOU + 1;
};

/**
 * Creates array of character codes for comparison
 */ 
function createComparableChars(str: string): Uint16Array {
    var buf = new ArrayBuffer(str.length * 2);
    var finalChars = new Uint16Array(buf);
    
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);

        // Convert all hiragana characters to katakana
        if (charCode >= HIR_START && charCode <= HIR_END)
            charCode = charCode + (KAT_START - HIR_START);

        // If small character, find normal version from map
        if (KOKAKIMOJI_MAP.has(charCode))
            finalChars[i] = KOKAKIMOJI_MAP.get(charCode);  
        // If vowel extension replace with appropriate vowel
        else if (charCode === CHOUONKIGOU && i > 0)
            finalChars[i] = ONBIKI_MAP.get(finalChars[i - 1]);
        // If char code is even then it is the dakuten character
        else if (isKurikaeshiKigou(charCode) && i > 0)
            finalChars[i] = finalChars[i - 1] + Number(charCode % 2 === 0);
        // Not a special case, just return the character
        else
            finalChars[i] = charCode;
    }

    return finalChars;
}

/**
 * Checks if two strings of Japanese text are the same.
 * Uses process similar to described in JIS X 4061. Notable exceptions include
 * lack of dakuten/handakuten replacement and not accounting for non-kana characters.
 * For ex. は != ぱ
 * @param {String} referenceString Reference kana string
 * @param {String} compareString Comparison kana string
 * @returns {Number} Negative if A occurs before B, positive if B after A, and 0 if A = B
 */
function kanaStringCompare(referenceString: string, compareString: string): number {
    const comparableRef = createComparableChars(referenceString);
    const comparableComp = createComparableChars(compareString);
    const min = Math.min(referenceString.length, compareString.length);

    for (let i = 0; i < min; i++) {
        const refCharCode = comparableRef[i];
        const compCharCode = comparableComp[i];

        if (refCharCode !== compCharCode)
            return refCharCode - compCharCode;
    }
    return referenceString.length - compareString.length;
}

/**
 * Checks if two kanji strings are the same
 * @param {String} referenceString Reference kana string
 * @param {String} compareString Comparison kana string
 * @returns {Number}
 */
function kanjiStringCompare(referenceString: string, compareString: string): number {
    return referenceString.localeCompare(compareString, 'ja');
}

/**
 * Takes a function which compares strings for an exact match and returns a function which
 * compares strings for whether the reference string starts with the comparison string
 * @param {function(String, String): Number} compareFunc 
 * @returns {function(String, String): Number}
 */
function createStartsWithFunc(compareFunc: CompareFunction): CompareFunction {
    return (referenceString, compareString) => {
        const refLength = referenceString.length;
        const compLength = compareString.length;
        const refStringBeginning = referenceString.slice(0, Math.min(refLength, compLength));
        return compareFunc(refStringBeginning, compareString);
    }
}

const kanaStringStartsWith = createStartsWithFunc(kanaStringCompare);
const kanjiStringStartsWith = createStartsWithFunc(kanjiStringCompare);

export {
    kanaStringStartsWith,
    kanjiStringStartsWith,
    kanaStringCompare,
    kanjiStringCompare
};
