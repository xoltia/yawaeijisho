/**
 * This file contains functions which provide the main functionality of each API endpoint
 * registered in the main file
 */

const jmdict = require('./jmdict');
const cache = {};

function getEntries(word) {
    if (word in cache)
        return cache[word];
        
    const entries = /^[\u3040-\u309f\u30a0-\u30ff]+$/.test(word) ?
           jmdict.searchKana(word) :
           jmdict.searchKanji(word);

    // TODO: Maybe this should be done when creating indexes?
    entries.sort((a, b) => {
        if (a.common && b.common)
            return 0;
        else if (a.common && !b.common)
            return -1;
        else
            return 1;
    });
    
    // Don't cache empty results
    if (entries.length === 0)
        return entries;
    
    cache[word] = entries;
    return entries;
}

function count(word) {
    return getEntries(word).length;
}

function search(word, options) {
    const { page, size } = options;

    const entries = getEntries(word);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;
    return entries.slice(rangeStart, rangeEnd);
}

module.exports = {
    search,
    count
};