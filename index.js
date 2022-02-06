const express = require('express');
const path = require('path');
const jmdict = require('./jmdict');
const config = require('./config');

const app = express();

// If environment set to production serve built client files
if (config.isProduction) {
    app.use(express.static(path.join(__dirname, '/client/dist')));
}

app.use('/api', require('./routes'));

// Set up JMDict module before starting server or search functions will not work
jmdict.setup(
    config.jmdictLocation,
    config.useIndexFile,
    !config.isProduction
);

// Port must be 3080 to work with client when running from dev server
app.listen(config.port, function(err) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});