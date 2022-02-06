require('dotenv').config();
const express = require('express');
const { query } = require('express-validator');
const path = require('path');
const jmdict = require('./jmdict');
const { search, count } = require('./api');
const { parse } = require('./mecab');

const app = express();

// If environment set to production serve built client files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/client/dist')));
}

app.get('/api/tags',
    (req, res) => res.json(jmdict.tags)
);

app.get('/api/wakachi/:phrase', (req, res) => {
    parse(req.params.phrase, (result) => {
        res.json(result.map(data =>
            [
                data[0], // Matched text
                data[1]['品詞'] == '記号' ? null : data[1]['原形'], // Standard form or null if symbol
            ]
        ));
    });
});

app.get('/api/count/:word',
    (req, res) => res.json(count(req.params.word))
);

app.get('/api/define/:word', 
    query('page').isInt().default(0),
    query('size').isInt({ min: 1 }).default(process.env.MAX_PAGE_SIZE || 25),
    (req, res) => res.json(
        search(req.params.word, {
            page: Number(req.query.page),
            size: Number(req.query.size)
        })
    )
);

// Set up JMDict module before starting server or search functions will not work
jmdict.setup(
    process.env.JMDICT_LOCATION,
    process.env.USE_INDEX_FILE === 'true',
    process.env.env !== 'PRODUCTION'
);

// Port must be 3080 to work with client when running from dev server
app.listen(process.env.PORT || 3080, function(err) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});