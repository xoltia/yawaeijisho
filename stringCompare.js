const HIR_START = 'ぁ'.charCodeAt();
const HIR_END = 'ゖ'.charCodeAt();
const KAT_START = 'ァ'.charCodeAt();
const KOKAKIMOHJI_MAP = {
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
};

const ONBIKI_MAP = {
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
};

/**
 * Whether kana is a kurikaeshi character
 * @param {String} char 
 * @returns {Boolean}
 */
function isKurikaeshiKigou(char) {
    return char === 'ゝ' || char === 'ヽ' ||
           char === 'ゞ' || char === 'ヾ';
};

/**
 * Creates kana string for comparison
 * @param {*} str
 * @returns {Array}
 */ 
function createComparableChars(str) {
    let finalChars = new Array(str.length);
    
    // TODO: Update to use ONLY char codes, also use map instead of loop?
    for (let i = 0; i < str.length; i++) {
        let char = str.charAt(i);
        let charCode = str.charCodeAt(i);

        if (charCode >= HIR_START && charCode <= HIR_END) {
            // Convert all hiragana characters to katakana
            charCode = charCode + (KAT_START - HIR_START);
            char = String.fromCharCode(charCode);
        }

        if (char in KOKAKIMOHJI_MAP) {
            // If small character, find normal version from map
            finalChars[i] = KOKAKIMOHJI_MAP[char].charCodeAt();  
        } else if (char === 'ー' && i > 0) {
            finalChars[i] = ONBIKI_MAP[String.fromCharCode(finalChars[i - 1])].charCodeAt();
        } else if (isKurikaeshiKigou(char) && i > 0) {
            // If char code is even then it is the dakuten character
            finalChars[i] = finalChars[i - 1] + (charCode % 2 === 0);
        } else {
            finalChars[i] = charCode;
        }
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
 * @param {Number?} cutoff Number to stop comparison at, defulats to shortest string length (full comparison)
 * @returns {Number} Negative if A occurs before B, positive if B after A, and 0 if A = B
 */
function kanaStringCompare(referenceString, compareString) {
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
 * Check if the reference kana string starts with the string being compared 
 * @param {String} referenceString String being checked
 * @param {String} compareString Suffix being looked for
 * @returns {Number}
 */
 function kanaStringStartsWith(referenceString, compareString) {
    const refLength = referenceString.length;
    const compLength = compareString.length;
    const refStringBeginning = referenceString.slice(0, Math.min(refLength, compLength));
    return kanaStringCompare(refStringBeginning, compareString);
}

/**
 * Checks if two kanji strings are the same
 * @param {String} referenceString Reference kana string
 * @param {String} compareString Comparison kana string
 * @returns {Number}
 */
function kanjiStringCompare(referenceString, compareString) {
    return referenceString.localeCompare(compareString, 'ja');
}

/**
 * Check if the reference kanji string strarts with the string being compared 
 * @param {String} referenceString String being checked
 * @param {String} compareString Suffix being looked for
 * @returns {Number}
 */
function kanjiStringStartsWith(referenceString, compareString) {
    const refLength = referenceString.length;
    const compLength = compareString.length;
    const refStringBeginning = referenceString.slice(0, Math.min(refLength, compLength));
    return kanjiStringCompare(refStringBeginning, compareString, 'ja');
}


module.exports = {
    kanaStringCompare,
    kanaStringStartsWith,
    kanjiStringCompare,
    kanjiStringStartsWith,
};