const jmdict = require('../jmdict');
const { parse } = require('../mecab');

// TODO: proper cache
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

module.exports.tags = (_, res) => {
    res.json(jmdict.tags);
};

module.exports.define =  (req, res) => {
    const page = Number(req.query.page);
    const size = Number(req.query.size);
    const entries = getEntries(req.params.word);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;

    res.json(entries.slice(rangeStart, rangeEnd));
};

module.exports.count = (req, res) => {
    res.json(getEntries(req.params.word).length);
};

module.exports.wakachi = (req, res) => {
    parse(req.params.phrase, (result) => {
        const response = result.map(data => [
            data[0],
            data[1]['品詞'] == '記号' ? null : data[1]['原形']
        ]);
        res.json(response);
    });
};
