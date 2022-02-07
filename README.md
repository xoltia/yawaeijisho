# Yawaeijisho

<img src="https://i.imgur.com/eMzq9RV.png"
     width="500">
     
Yet another Japanese-English dictionary

## Planned and current features

This project is an attempt to make a website similar to jisho.org but with some features that would be convenient to have.
Features I would like to implement once most jisho.org-like features are already present include:

- On-site decks of saved words
- Ability to map decks to anki decks and export to anki

Other features which still need implementing include

- Wild card searches (* and ?)
- Kanji info
- Example sentences
- Better sorting (show common words first)
- Advanced searching (filters, sorters, radical search)
- Query & search URL

Current features are

- Single word search (kana or kanji)
- Input is automatically converted to kana using wanakana (no English->Japanese search)
- Results show kana/kanji reading pairs and tags in easy to understand format
- Searching a sentence lets you select word from broken up sentence
- Loading more results adds to current page instead of reload

## Setup
Current prerequisites include

- [Mecab](https://taku910.github.io/mecab/#download) with bin location in your %PATH%
- [JMDICT JSON](https://github.com/scriptin/jmdict-simplified) data file
- Properly configured environment variables

### Environment variables
| Variable        | Description                                                                                                                          | Default              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | 
| PORT            | Port which API server runs on (do not change if not production)                                                                      | production: 80 <br> dev: 3080 (same as front-end dev proxy)
| NODE_ENV        | 'production' or 'dev'; Production serves static files from client\dist                                                               | dev   |
| JMDICT_LOCATION | Location of JMDict file (important, will not run without)                                                                            | None  |
| USE_INDEX_FILE  | Whether or not to save created indexes (kanji/kana search indexes) to a file for re-use. Recommended to speed up subsequent startups | false |
| MAX_PAGE_SIZE   | Maximum amount of words allowed to be returned by /api/define endpoint                                                               | 25    |

### Starting

Run `npm start` to start both the server and the vue-cli.

`npm run start-server` and `npm run start-client` to start one of the two.

You only need to start the server if running production, since built files will be served. However, make sure to run `npm run build-client` first.
