require('dotenv').config();
const path = require('path');
const jmdict = require('./jmdict');

console.log('Loading JMDict file...');
jmdict.loadJmdict(process.env.JMDICT_LOCATION);
console.log('Building word list...');
jmdict.buildWordList();
console.log(process.env.USE_INDEX_FILE === 'true' ?
    'Loading indices (this while take a while on the first run)...' :
    'Building indices (this while take some time)...'
);
jmdict.buildIndices(process.env.USE_INDEX_FILE === 'true');
console.log("JMDict module ready");

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

fastify.get('/api/define/:word', function (request, reply) {
    const { word } = request.params;
    // Tests if word contains characters only in hiragana and katakana unicode blocks and searches by kana if so
    const isKana = /^[\u3040-\u309f\u30a0-\u30ff]+$/.test(word);
    const entries = isKana ? jmdict.searchKana(word) : jmdict.searchKanji(word);

    reply.send(entries);
});

// Port must be 3080 to work with client when running from dev server
fastify.listen(process.env.PORT || 3080, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});