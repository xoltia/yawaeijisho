import { readJsonFile } from '../util/json';

export interface Kanji {
    literal: string,
    onyomi?: string[],
    kunyomi?: string[],
    nanori?: string[],
    jlpt?: number,
    gradeLevel?: number,
};

export default class KanjiDicAPI {
    private readonly _kanji: Map<string, Kanji> = new Map();

    async loadFile(kanjiDicFileLocation: string): Promise<this> {
        const kanjiDic = await readJsonFile(kanjiDicFileLocation);

        for (let kanji of kanjiDic)
            this._kanji.set(kanji.literal, kanji);

        return this;
    }

    hasKanji(literal: string): boolean {
        return this._kanji.has(literal);
    }

    getKanji(literal: string): Kanji | undefined {
        return this._kanji.get(literal);
    }

    getAllKanjiFromString(phrase: string): Kanji[] {
        const kanji: Kanji[] = [];

        for (let char of phrase)
            if (this.hasKanji(char))
                kanji.push(this.getKanji(char)!);

        return kanji;
    }
};
