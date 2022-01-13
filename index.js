require('dotenv').config();
const path = require('path');
const jmdict = require('./jmdict');
// Max amount of words which can be searched at once
const maxPageSize = process.env.MAX_PAGE_SIZE || 25;
const cache = {}; // TODO: Use a proper cache and not just an object

const fastify = require('fastify')({
    logger: true
});

if (process.env.NODE_ENV === 'production') {
    console.log('Serving from client dist')
    fastify.register(require('fastify-static'), {
        root: path.join(__dirname, '/client/dist'),
    });
}

fastify.get('/api/tags', function(request, reply) {
    reply.send(jmdict.tags);
});

fastify.get('/api/count/:word', function (request, reply) {
    const { word } = request.params;
    return getEntries(word).length;
});

fastify.get('/api/define/:word', {
    schema: {
        querystring: {
            offset: { type: 'integer' },
            size: { type: 'integer' }
        }
    }
}, function (request, reply) {
    const { word } = request.params;
    // Page number
    const page = request.query.page || 0;
    // Page size, default to max page size if page not specified or if invalid size (<0)
    const size = request.query.size && request.query.size > 0 ? request.query.size : maxPageSize;
    
    const entries = getEntries(word);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;
    const words = entries.slice(rangeStart, rangeEnd);

    reply.send(words);
});

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

console.log('Loading JMDict file...');
jmdict.loadJmdict(process.env.JMDICT_LOCATION);
console.log('Building word list...');
jmdict.buildWordList();
console.log(process.env.USE_INDEX_FILE === 'true' ?
    'Loading indices (this will take a while on the first run)...' :
    'Building indices (this will take some time)...'
);
jmdict.buildIndices(process.env.USE_INDEX_FILE === 'true');
console.log("JMDict module ready");

// Port must be 3080 to work with client when running from dev server
fastify.listen(process.env.PORT || 3080, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});