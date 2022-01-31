const fs = require('fs');
const {
    kanaStringCompare,
    kanjiStringCompare,
    kanaStringStartsWith,
    kanjiStringStartsWith
} = require('./stringCompare');
/* IMPORTANT!
 * Indices should be located using original JMDict word data and NOT words list!
 * This allows for changing the structure of data in the words list without affecting how
 * indexing works. However, this means that the words list should map one-to-one with the
 * original list and the order should not be altered!
 */
let jmdict;
let words = [];

/* TODO: Wildcards */

/**
 * Loads JMDict for use, also sets module.exports.tags
 * @param {String} location Location of JSON JMDict file location
 */
function loadJmdict(location) {
    jmdict = require(location);
    module.exports.tags = jmdict.tags;
}

/**
 * Creates list of words which will be pulled from using search functions. 
 * Indices must be built before searching
 */
function buildWordList() {
    words = jmdict.words.map((word, _) => {
        /*
         * Array of possible definitions and the possible ways they can be written
         * Format is [[[WRITINGS], [DEFINITIONS]]...]
         * Where each writing is a kana/kanji pair and a sense if the tags and glosses
         * Ex: { writings: [["京都", "きょうと"], ...], senses: [{tags: [...], gloss: ["..."]}] }
         */
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
    });
}

/**
 * Builds indices used for searching. Also creates and exports appropriate search functions.
 * When generating indices this function will take some time to sort them
 * @param {boolean} storeIndices
 * Whether or not to use premade index file.
 * If such a file does not exist it will be created for use on next run
 */
function buildIndices(storeIndices=false) {
    let kanjiIndex = [];
    let kanaIndex = [];

    if (storeIndices && fs.existsSync('./kanjiIndexSorted.json') && fs.existsSync('./kanaIndexSorted.json')) {
        kanjiIndex = require('./kanjiIndexSorted.json');
        kanaIndex = require('./kanaIndexSorted.json');
    } else {
        for (let [index, word] of jmdict.words.entries()) {
            for (let { text } of word.kanji)
                kanjiIndex.push([text, index]);
            for (let { text } of word.kana)
                kanaIndex.push([text, index]);
        };
    
        kanjiIndex.sort((k1, k2) => kanjiStringCompare(k1[0], k2[0]));
        kanaIndex.sort((k1, k2) => kanaStringCompare(k1[0], k2[0]));
        
        if (storeIndices) {
            fs.writeFileSync('./kanjiIndexSorted.json', JSON.stringify(kanjiIndex));
            fs.writeFileSync('./kanaIndexSorted.json', JSON.stringify(kanaIndex));
        }
    }

    module.exports.searchKanji = createSearchFunction(kanjiIndex, kanjiStringStartsWith);
    module.exports.searchKana = createSearchFunction(kanaIndex, kanaStringStartsWith);
}

/* Helper functions */

/**
 * Checks if two arrays contain the same values where order does not matter
 * @param {Array} arr1 First array
 * @param {Array} arr2 Second array
 * @returns {boolean}
 */
 function arrayCompare(arr1, arr2) {
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

/**
 * Uses binary search to find appropriate key. Once a location is found, it searches for duplicates
 * @param {Array<[String, Number]>} index Index array to search where each element is an array containing a key-index pair
 * @param {String} key Key to search for
 * @param {function(String, String): Number} compareFunc
 * @returns {Array<Number>} All indices where an entry with the specified key can be found
 */
function binarySearchIndex(index, key, compareFunc) {
    let start = 0;
    let end = index.length - 1;

    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const diff = compareFunc(index[mid][0], key);

        if (diff < 0)
            start = mid + 1;
        else if (diff > 0)
            end = mid - 1;
        else {
            // Now that one match has been found need to check for duplicates
            let firstInstance = mid;
            let lastInstance = mid + 1;

            while (firstInstance > 0) {
                // If previous element isn't duplicate break
                if (compareFunc(index[firstInstance - 1][0], key) !== 0)
                    break;
                firstInstance--;
            }
            
            while (lastInstance < (index.length - 1)) {
                // If next element isn't duplicate break
                if (compareFunc(index[lastInstance][0], key) !== 0)
                    break;
                lastInstance++;
            }

            // Return index of each entry
            return [
                ...new Set(index
                    .slice(firstInstance, lastInstance)
                    .map(entry => entry[1])
                )
            ];
        }
    }
    // If the key was not found return blank array, meaning no index
    return [];
}

/**
 * Creates a function which searches for a word from the provided index
 * @param {Array<[String, Number]>} index Index array used by the search function
 * @param {function(String, String): Number} compareFunc
 * @returns {function(String): Array} The search function
 */
function createSearchFunction(index, compareFunc) {
    return (word) =>
        binarySearchIndex(index, word, compareFunc).map(i => words[i]);
}

/**
 * Sets up JMDict module for use
 * @param {String} jmdictLocation JMDict JSON data file location
 * @param {Boolean} useIndexFile Whether or not to use existing index file (or create one if none found)
 * @param {Boolean} logProgress Whether to log messages as each step is reached
 */
function setup(jmdictLocation, useIndexFile, logProgress=true) {
    if (logProgress) console.log('Loading JMDict file...');
    loadJmdict(jmdictLocation);
    if (logProgress) console.log('Building word list...');
    buildWordList();
    if (logProgress) console.log(useIndexFile ?
            'Loading indices (this will take a while on the first run)...' :
            'Building indices (this will take some time)...'
    );
    buildIndices(useIndexFile);
    if (logProgress) console.log("JMDict module ready");
}

/* Exports */
module.exports = { setup };