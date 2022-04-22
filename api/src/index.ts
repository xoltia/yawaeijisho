import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import config from './config';
import { setup as setupJMDict } from './jmdict';
import {
    baseRouter,
    authRouter,
    usersRouter,
    listsRouter,
    funcRouter
} from './routes';
import { setupWsProxy } from './controllers/syncController.ws';
import assert = require('assert');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api', baseRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/lists', listsRouter);
app.use('/api/funcs', funcRouter);

// If environment set to production serve built client files
if (config.isProduction) {
    app.use(express.static(config.publicFolder));
}

console.log('Preparing JMDict module')

setupJMDict()
    .then(() => {
        console.log('JMDict module ready')
        mongoose.connect(config.db.connectionString, (err) => {
            if (err) {
                console.log('Failed to connect to MongoDB. Current database config is:\n', JSON.stringify(config.db, null, 2));
                console.log('Error:\n', err.message);
                process.exit(1);
            }
        
            console.log(`Conencted to Mongo DB server at ${config.db.connectionString}`);
            console.log(`Using funcbox at ${config.funcboxUri}`);

            const funcboxUri = config.funcboxUri;
            const verificationUrl = `http://${funcboxUri.host}/check_alive`;

            console.log(`Verifying funcbox instance is running. (${verificationUrl})`);

            const req = http.get(verificationUrl, (res) => {
                // Currently no reason this should happen but may in the future
                assert(res.statusCode === 200, 'Status code returned from funcbox check_alive was not HTTP OK');
                setupWsProxy(server, funcboxUri.toString());
                server.listen(config.port, () => {
                    // Because I get bored watching the console waiting for everything to be ready
                    if (config.readyBeep)
                        process.stdout.write('\x07');
                    console.log(`Server listening on port ${config.port}`);
                });
            });

            req.on('error', () => {
                console.log('Failed to verify funcbox is running. Please make sure that a funcbox instance is running at the provided host:', funcboxUri.host);
                process.exit(1);
            });
        });
    });
