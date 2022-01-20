/**
 * This file contains functions which provide the main functionality of each API endpoint
 * registered in the main file
 */

const jmdict = require('./jmdict');
const maxPageSize = process.env.MAX_PAGE_SIZE || 25;
const defaultSearchOptions = {
    page: 0,
    size: maxPageSize
};

const cache = {};

function getEntries(word) {
    if (word in cache)
        return cache[word];
        
    const entries = /^[\u3040-\u309f\u30a0-\u30ff]+$/.test(word) ?
           jmdict.searchKana(word) :
           jmdict.searchKanji(word);
    
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
    const {
        page,
        size
    } = Object.assign({}, defaultSearchOptions, options);

    const entries = getEntries(word);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;
    return entries.slice(rangeStart, rangeEnd);
}

module.exports = {
    search,
    count
};