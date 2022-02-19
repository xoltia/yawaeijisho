require('dotenv').config();

const config = {
    jmdictLocation: process.env.JMDICT_LOCATION,
    useIndexFile: process.env.USE_INDEX_FILE === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    maxPageSize: process.env.MAX_PAGE_SIZE || 25,
    port: process.env.PORT || (this.isProduction ? 80 : 3080),
    tokenSecret: process.env.TOKEN_SECRET,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        name: process.env.DB || 'yawaeijisho',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        get connectionString() {
            // If set explicitely, return the string
            if (process.env.DB_CONNECTION_URI)
                return process.env.DB_CONNECTION_URI;

            // Otherwise try to build one from other variables
            const userInfo = this.username ? `${this.username}:${this.password}@` : '';
            return `mongodb://${userInfo}${this.host}:${this.port}/${this.name}`;
        }
    },
};

module.exports = config;
