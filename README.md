# Yawaeijisho

<img src="https://i.imgur.com/xsYUvO1.png"
     width="500">
     
Yet another Japanese-English dictionary

## Usage
Most features other than word lookup require you to make an account.

#### Lists
Once you have an account, you can click the lists link in the top left (desktop)/menu (mobile) to create a list.
Once you have a list, you can use the link actions on words to add them to lists.


#### Anki
In order to use Anki you need to have Anki-Connect and to add the site domain to your CORS configuration. Click the
status dot in the top left to modify Anki-Connect URL if you are using a non-standard one. This page is also where you will pick a
deck and model to use for creating notes. Finally, you will need to write your own script for mapping words to your model. You can create such scripts from the "Functions tab" of the same page".

Within the word function context, you have access to both the raw JMDict entry and the processed entry as served by the API. (jWord/word and yWord respectively). You can get user input with the global function `input` which takes in a prompt string and an array of string options, returning a promise of the string selected (do not try to await instead use `.then`). Your script should have one call to `finish` with an object where the keys match with the expected models fields.

For example, if your Anki model has three fields (Word, Meaning, Reading) then your object should look like
```js
finish({
  'Word': word,
  'Meaning': meaning,
  'Reading': reading
});
```

Note that your script will NOT run in the browser, as such you only have access to these methods and objects as globals. You do not have any of the normal browser APIs.

## Planned and current features

This project is an attempt to make a website similar to jisho.org but with some additional features.

Original features:
- On-site word lists
- Anki note builder (using user created functions)
- Japanese UI option

Characteristics shared with Jisho.org:
- Whole sentence search
- Kanji info (only based on kanji included in search string, not reading)

Differences from Jisho.org:
- Word entries are broken down based on applicable kanji/kana pairs (where jisho would show one entry with some marked as "only applies to XXX", this app will show them as seperate entries
- Kanji info has different (currently less) info
- Results are loaded in on the same page instead of navigating to the next page
- Only Japanese -> English search. Input is automatically converted to kana if you type with EN input method.

Features I would like to implement:
- Wild card searches (* and ?)
- Example sentences
- Advanced searching (filters, sorters, radical search)
- More features for note functions

## API Setup
Current prerequisites include

- [Mecab](https://taku910.github.io/mecab/#download) with bin location in your %PATH%
- [JMDICT JSON](https://github.com/scriptin/jmdict-simplified) data file
- [Kanjidic JSON](https://github.com/xoltia/kanjidic2-xml2json) data file
- Properly configured environment variables

### Environment variables
| Variable        | Description                                                                                                                          | Default              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | 
| PORT            | Port which API server runs on (do not change if not production)                                                                      | production: 80 <br> dev: 3080 (same as front-end dev proxy)
| NODE_ENV        | 'production' or 'dev'; Production serves static files from client\dist                                                               | dev   |
| JMDICT_LOCATION | Location of JMDict file (important, will not run without)                                                                            | None  |
| USE_INDEX_FILE  | Whether or not to save created indexes (kanji/kana search indexes) to a file for re-use. Recommended to speed up subsequent startups | false |
| MAX_PAGE_SIZE   | Maximum amount of words allowed to be returned by /api/define endpoint                                                               | 25    | KANJIDIC_LOCATION | Location of Kanjidic file (important, will not run without)                                                                        | None
| TOKEN_SECRET     | Secret used to create user tokens                                                                                                   | None
| DB_CONNECTION_URI | MongoDB connection URL (optionally you can also specifiy individual components, view config.ts source file) | mongodb://localhost:27017/yawaeijisho
| MECAB_SHIFT_JIS  | 'true' if mecab installed with Shift JIS                                                                                            | false
| FUNCBOX_URI     | URL (with ws protocol) of server which will serve as the "funcbox"                                                                   | ws://localhost:3090/ws
| PUBLIC_FOLDER   | Where the built client is (when running in production)                                                                               | ../../client/dist

## Client setup
Uses basic vue cli commands. View the README file in the client directory for more info.

## Funcbox setup
Does not currently build on Windows (because of v8go dependency). You can use WSL to get around this. Simply build and run the program before running the API.

Run with `-help` for information about arguments.

### Starting
First, start the Funcbox server. Then run `npm start` in the API folder to start the API. Finally, run `npm run serve` in the client
folder. (You do not need to do this if running in production mode, however, make sure to run `npm run build-client` first)
