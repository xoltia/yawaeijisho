import { readFileAsync, readJsonFile } from './util/json';
import config from './config';

export class TatoebaAPI {
    private _sentences?: Map<number, string>;
    private _lookupTable: { [word: string]: number[] } = {};

    async loadFiles(sentenceFile: string, tableFile: string): Promise<this> {
        this._sentences = await TatoebaAPI._loadSentenceDataFile(sentenceFile);
        this._lookupTable = await TatoebaAPI._loadLookupTableDataFile(tableFile);

        return this;
    }

    getSentenceById(id: number): string | undefined {
        return this._sentences?.get(id);
    }

    getSentencesByWord(word: string, start?: number, end?: number): string[] {
        const ids = this._lookupTable[word];

        if (!ids) {
            return [];
        }
        return ids.slice(start, end).map(id => this.getSentenceById(id));
    }

    countSentencesByWord(word: string): number {
        return this._lookupTable[word]?.length ?? 0;
    }

    private static async _loadSentenceDataFile(file: string): Promise<Map<number, string>> {
        const fileContent = await readFileAsync(file, 'utf8');
        // Split the file content by new line
        const lines = fileContent.split('\n');
        // Remove the last empty line
        lines.pop();
        // Extract the sentence from each line
        return new Map(lines.map(TatoebaAPI._getIdAndSentence));
    }

    private static _loadLookupTableDataFile(file: string): Promise<{ [word: string]: number[] }> {
        return readJsonFile(file);
    }

    private static _getIdAndSentence(line: string): [number, string] {
        const { id, sentence } = /(?<id>\d+)\tjpn\t(?<sentence>.+)/
            .exec(line)
            .groups;

        return [parseInt(id), sentence];
    }
}

const tatoeba = new TatoebaAPI();
export default tatoeba;
export function setup(): Promise<TatoebaAPI> {
    return tatoeba.loadFiles(config.tatoebaLocation, config.tatoebaLookupTableLocation);
}

