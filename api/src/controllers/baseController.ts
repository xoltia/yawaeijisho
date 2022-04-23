import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import LRU from 'lru-cache';

import JMDict from '../jmdict';
import KanjiDic from '../kanjidic';
import { parse } from '../mecab';
import config from '../config';
import { DefaultWordType } from '../jmdict/mapper';
import { AuthorizedRequest } from '../middleware/authorization';
import List, { IList } from '../models/List';

const cache = new LRU<string, DefaultWordType[]>({
    max: config.cacheMax,
    maxAge: config.cacheMaxAge
});

// Words which are present in a users lists
interface ListWord extends DefaultWordType {
    lists: Types.ObjectId[]
};

export const getTags = (_: Request, res: Response) => {
    res.json(JMDict.tags);
};

export const getDefinitions = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    let entries = getEntries(req.params.word);
    const page = Number(req.query.page);
    const size = Number(req.query.size);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;
    entries = entries.slice(rangeStart, rangeEnd);
    if (req.userId)
        entries = await attachLists(req.userId, entries);

    res.json(entries);
});

export function getKanji(req: Request, res: Response): void {
    const { kanji } = req.params;

    const kanjiList = KanjiDic.getAllKanjiFromString(kanji);
    res.json(kanjiList);
};

export const getWordCount = (req: Request, res: Response) => {
    res.json(getEntries(req.params.word).length);
};

export const getWordById = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    // 404 if no word with ID exists
    let word = JMDict.getWord(req.params.id);
    if (!word) {
        res.sendStatus(404);
        return;
    }
    if (req.userId)
        word = (await attachLists(req.userId, [word]))[0];
    res.json(word);
});

export const getWordsByIds = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const ids = req.query.id as string[];
    // Don't send more words than would be allowed with a normal search
    ids.length = Math.min(ids.length, config.maxPageSize);

    // At this point API will have errors if any of the IDs were invalid
    // so mapping should work without checking for invalid IDs
    let words = ids.map(id => JMDict.getWord(id));
    if (req.userId)
        words = await attachLists(req.userId, words);
    res.json(words);
});

export const wakachi = (req: Request, res: Response) => {
    parse(req.params.phrase, (result) => {
        const response = result.map(data => [
            data[0],
            data[1]['品詞'] == '記号' ? null : data[1]['原形']
        ]);
        res.json(response);
    });
};

/* --- HELPER FUNCTIONS --- */

function getEntries(word: string): DefaultWordType[] {
    if (cache.has(word))
        return cache.get(word);
        
    const entries = JMDict.searchIndex(/^[\u3040-\u309f\u30a0-\u30ff]+$/.test(word) ? 'kana' : 'kanji', word);

    // TODO: Maybe this should be done when creating indexes?
    entries.sort((a, b) => {
        if (a.common && b.common)
            return 0;
        else if (a.common && !b.common)
            return -1;
        else
            return 1;
    });
    
    // Don't cache empty results
    if (entries.length === 0)
        return entries;
    
    cache.set(word, entries);
    return entries;
}

// TODO: Redo this so that it takes in JMDict ids instead of full words (and start word search as search for lists is occuring asynchronously),
// also try to use aggregates instead of finding the lists for each word here.
async function attachLists(userId: string | Types.ObjectId, words: DefaultWordType[]): Promise<ListWord[]> {
    // Get all lists which contain any of these words
    const ids = words.map(w => w.id);
    const lists: IList[] = await List.find({
        creator: userId,
        words: { $in: ids }
    }).select('words');
    
    const wordsWithLists: ListWord[] = new Array(words.length);

    // Find which words matched
    for (let [i, word] of words.entries()) {
        wordsWithLists[i] = {
            ...word,
            lists: lists
                .filter(list => list.words.some((wordId) => wordId === word.id))
                .map(list => list.id)
        };
    }

    return wordsWithLists;
}
