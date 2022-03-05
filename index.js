const express = require('express');
const path = require('path');
const jmdict = require('./jmdict');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use('/api', require('./routes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lists', require('./routes/lists'));

// If environment set to production serve built client files
if (config.isProduction) {
    app.use(express.static(path.join(__dirname, '/client/dist')));
}

// Set up JMDict module before starting server or search functions will not work
jmdict.setup(
    config.jmdictLocation,
    config.useIndexFile,
    !config.isProduction
);

mongoose.connect(config.db.connectionString, (err) => {
    if (err) {
        console.log('Failed to connect to MongoDB. Current database config is:\n', JSON.stringify(config.db, null, 2));
        console.log('Error:\n', err.message);
        process.exit(1);
    }

    console.log(`Conencted to Mongo DB server at ${config.db.connectionString}`);

    app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));
});
