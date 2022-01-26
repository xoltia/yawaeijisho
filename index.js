require('dotenv').config();
const path = require('path');
const jmdict = require('./jmdict');
const { search, count } = require('./api');

const fastify = require('fastify')({
    logger: true
});

// If environment set to production serve built client files
if (process.env.NODE_ENV === 'production') {
    fastify.register(require('fastify-static'), {
        root: path.join(__dirname, '/client/dist'),
    });
}

fastify.get('/api/tags', function(request, reply) {
    reply.send(jmdict.tags);
});

fastify.get('/api/count/:word', function (request, reply) {
    reply.send(count(request.params.word));
});

fastify.get('/api/define/:word', {
    schema: {
        querystring: {
            offset: { type: 'integer' },
            size: { type: 'integer' }
        }
    }
}, function (request, reply) {
    // Page number
    const page = request.query.page || 0;
    // Page size, default to max page size if page not specified or if invalid size (<0)
    const size = request.query.size && request.query.size > 0 ? request.query.size : (process.env.MAX_PAGE_SIZE || 25);

    reply.send(search(request.params.word, { page, size }));
});

// Set up JMDict module before starting server or search functions will not work
jmdict.setup(
    process.env.JMDICT_LOCATION,
    process.env.USE_INDEX_FILE === 'true',
    process.env.env !== 'PRODUCTION'
);

// Port must be 3080 to work with client when running from dev server
fastify.listen(process.env.PORT || 3080, function (err) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});