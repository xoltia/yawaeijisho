require('dotenv').config();

const config = {
    jmdictLocation: process.env.JMDICT_LOCATION,
    useIndexFile: process.env.USE_INDEX_FILE === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    maxPageSize: process.env.MAX_PAGE_SIZE || 25,
    port: process.env.PORT || (this.isProduction ? 80 : 3080)
};

module.exports = config;
