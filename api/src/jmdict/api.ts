import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/* IMPORTANT!
 * Indices should be located using original JMDict word data and NOT words list!
 * This allows for changing the structure of data in the words list without affecting how
 * indexing works. However, this means that the words list should map one-to-one with the
 * original list and the order should not be altered!
 */

export type XRef = [string, string, number] | [string, number | string] | [string];

export interface JMDictKanji {
    common: boolean,
    text: string,
    tags: string[]
};

export interface JMDictKana extends JMDictKanji {
    appliesToKanji: string[]
};

export interface JMDictLanguageSource {
    lang: string,
    full: boolean,
    wasei: boolean,
    text: string | null
};

export interface JMDictGloss {
    type: 'literal' | 'figurative' | 'explanation' | null,
    lang: string,
    text: string
};

export interface JMDictSense {
    partOfSpeech: string[],
    appliesToKanji: string[],
    appliesToKana: string[],
    related: XRef[],
    antonym: XRef[],
    field: string[],
    dialect: string[],
    misc: string[],
    info: string[],
    languageSource:JMDictLanguageSource[],
    gloss: JMDictGloss[]
};

export interface JMDictWord {
    id: string,
    kanji: JMDictKanji[],
    kana: JMDictKana[],
    sense: JMDictSense[],
};

export interface JMDict {
    version: string,
    dictDate: string,
    dictRevisions: string[]
    tags: Record<string, string>,
    words: JMDictWord[]
};

export type IndexNumber = number;
// Pair with the key which the sorter will use to find a given record and the number to be returned by the sorter
export type IndexRecord = [any, IndexNumber];
// Collection of index records
export type Index = IndexRecord[];
// Function which maps finds the value(s) from a word and returns index records
export type IndexBuilder = (word: JMDictWord, index: number) => Index;
// Function which compares index values
export type IndexSorter = (r1: any, r2: any) => number;
// Function which compares values of already sorted index
export type IndexKeyComparer = (r1: any, r2: any) => number;
// Function which searches for a record with a given value
export type IndexSearcher = (key: any) => IndexNumber[];
// Function used to map the processed word list
export type WordMapper<WordType> = (jmdictWord: JMDictWord) => WordType;

export default class JMDictAPI<WordType, IndexNames extends string> {
    // Loaded JMDict data
    private _jmdict?: JMDict;
    // Words we want to return instead of raw data
    private _processedWords?: WordType[];
    // Function for processing words
    private _wordMapper?: WordMapper<WordType>;
    // Whether or not to try and load from index files before using index builders
    private _useIndexFiles = false;
    // Record of indexes and their search functions by name
    private _indexes: Partial<Record<IndexNames, IndexSearcher>> = {};
    // Map of words by their ID
    private _wordIds: Map<string, IndexNumber> = new Map();

    async loadFile(jmdictFileLocation: string): Promise<this> {
        this._jmdict = await this._loadJSON(jmdictFileLocation);

        // Create map of word IDs
        for (let [index, word] of this._jmdict.words.entries())
            this._wordIds.set(word.id, index);

        return this;
    }

    useIndexFiles(): this {
        this._useIndexFiles = true;
        return this;
    }

    withMapper(mapper: WordMapper<WordType>): this {
        this._wordMapper = mapper;
        return this;
    }

    buildWordList(): this {
        this._processedWords = this._jmdict.words.map(this._wordMapper);
        return this;
    }

    async createIndex(name: IndexNames, builder: IndexBuilder, sorter: IndexSorter, comparer: IndexKeyComparer): Promise<this> {
        // Load index from file if exists else build it
        const filename = name + '-index.json';
        const hasIndexFile = this._useIndexFiles && fs.existsSync(filename);
        const index: IndexRecord[] = hasIndexFile ?
            await this._loadIndex(filename) : this._buildIndex(builder);

        // If it had to be created now it needs to be sorted
        if (!hasIndexFile)
            index.sort((record1, record2) => sorter(record1[0], record2[0]));

        // If it wanted to use index file but coudldn't, then create one
        if (!hasIndexFile && this._useIndexFiles)
            await writeFile(filename, JSON.stringify(index));

        this._indexes[name] = this._createSearchFunction(index, comparer);
        return this;
    }

    searchIndex(name: IndexNames, key: any): WordType[] {
        const searchFunc = this._indexes[name];
        return searchFunc(key).map(index => this._processedWords[index]);
    }

    isValidId(wordId: string): boolean {
        return this._wordIds.has(wordId);
    }

    getWord(wordId: string): WordType {
        return this._processedWords[this._wordIds.get(wordId)];
    }

    getUnprocessedWord(wordId: string) {
        return this._jmdict.words[this._wordIds.get(wordId)];
    }

    get tags(): Record<string, string> {
        return this._jmdict.tags;
    }

    private async _loadJSON(filename: string): Promise<any> {
        const fileContent = await readFile(filename);
        return JSON.parse(fileContent.toString());
    }

    private async _loadIndex(filename: string): Promise<Index> {
        return await this._loadJSON(filename);
    };

    private _buildIndex(builder: IndexBuilder): Index {
        return Array
            .from(this._jmdict.words.entries())
            .flatMap(([indexNumber, word]) => builder(word, indexNumber));
    };

    private _createSearchFunction(index: Index, compareFunc: IndexKeyComparer): IndexSearcher {
        return (key) => this._binarySearchIndex(index, key, compareFunc);
    }

    private _binarySearchIndex(index: Index, key: any, compareFunc: IndexKeyComparer): IndexNumber[] {
        let start = 0;
        let end = index.length - 1;
    
        while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            const diff = compareFunc(index[mid][0], key);
    
            if (diff < 0)
                start = mid + 1;
            else if (diff > 0)
                end = mid - 1;
            else {
                // Now that one match has been found need to check for duplicates
                let firstInstance = mid;
                let lastInstance = mid + 1;
    
                while (firstInstance > 0) {
                    // If previous element isn't duplicate break
                    if (compareFunc(index[firstInstance - 1][0], key) !== 0)
                        break;
                    firstInstance--;
                }
                
                while (lastInstance < (index.length - 1)) {
                    // If next element isn't duplicate break
                    if (compareFunc(index[lastInstance][0], key) !== 0)
                        break;
                    lastInstance++;
                }
    
                // Return index of each entry
                return [
                    ...new Set(index
                        .slice(firstInstance, lastInstance)
                        .map(entry => entry[1])
                    )
                ];
            }
        }
        // If the key was not found return blank array, meaning no index
        return [];
    }
}
