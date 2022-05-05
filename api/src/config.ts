import * as dotenv from 'dotenv';
import * as path from 'path';
import { URL } from 'url';
dotenv.config();

type Port = string | number;

interface DbConfig {
    host: string,
    port: Port,
    name: string,
    username?: string,
    password?: string,
    connectionString: string
};

interface Config {
    publicFolder: string,
    jmdictLocation: string,
    useIndexFile: boolean,
    isProduction: boolean,
    maxPageSize: number,
    port: Port
    tokenSecret: string,
    db: DbConfig,
    cacheMax: number,
    cacheMaxAge: number,
    mecabLocation: string,
    useShiftJISMecab: boolean,
    funcboxUri: URL,
    readyBeep: boolean,
    kanjidicLocation: string,
    tatoebaLocation: string,
    tatoebaLookupTableLocation: string,
};

const config: Config = {
    publicFolder: process.env.PUBLIC_FOLDER || path.join(__dirname, '../../client/dist'),
    jmdictLocation: process.env.JMDICT_LOCATION,
    mecabLocation: process.env.MECAB_LOCATION || 'mecab',
    useIndexFile: process.env.USE_INDEX_FILE === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    maxPageSize: process.env.MAX_PAGE_SIZE ? Number(process.env.MAX_PAGE_SIZE) : 25,
    get port() {
        return process.env.PORT || (this.isProduction ? 80 : 3080)
    },
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
    cacheMax: process.env.CACHE_MAX_COUNT ? Number(process.env.CACHE_MAX_COUNT) : 10000,
    cacheMaxAge: process.env.CACHE_MAX_AGE ? Number(process.env.CACHE_MAX_COUNT) : undefined,
    useShiftJISMecab: process.env.MECAB_SHIFT_JIS === 'true',
    funcboxUri: new URL(process.env.FUNCBOX_URI ? process.env.FUNCBOX_URI : 'ws://localhost:3090/ws'),
    readyBeep: process.env.USE_READY_BEEP ? process.env.USE_READY_BEEP === 'true' : false,
    kanjidicLocation: process.env.KANJIDIC_LOCATION,
    tatoebaLocation: process.env.TATOEBA_LOCATION,
    tatoebaLookupTableLocation: process.env.TATOEBA_LOOKUP_TABLE_LOCATION
};

export default config;
