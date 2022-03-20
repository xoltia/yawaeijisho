import express from 'express';
import mongoose from 'mongoose';
import config from './config';
import { setup as setupJMDict } from './jmdict';
import baseRouter from './routes';
import authRouter from './routes/auth';
import userRouter from './routes/users';
import listRouter from './routes/lists';

const app = express();

app.use(express.json());
app.use('/api', baseRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/lists', listRouter);

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
    
        app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));
    });
});
