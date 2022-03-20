import { Request, Response } from 'express';
import LRU from 'lru-cache';
import { validationResult } from 'express-validator';
import JMDict from '../jmdict';
import { parse } from '../mecab';
import config from '../config';
import { DefaultWordType } from '../jmdict/mapper';

const cache = new LRU<string, DefaultWordType[]>({
    max: config.cacheMax,
    maxAge: config.cacheMaxAge
});

function getEntries(word: string) {
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

export const tags = (_: Request, res: Response) => {
    res.json(JMDict.tags);
};

export const define = (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const page = Number(req.query.page);
    const size = Number(req.query.size);
    const entries = getEntries(req.params.word);
    const rangeStart = page * size;
    const rangeEnd = (rangeStart < 0 ? entries.length + rangeStart : rangeStart) + size;

    res.json(entries.slice(rangeStart, rangeEnd));
};

export const count = (req: Request, res: Response) => {
    res.json(getEntries(req.params.word).length);
};

export const getById = (req: Request, res: Response) => {
    // 404 if no word with ID exists
    const word = JMDict.getWord(req.params.id);
    if (!word)
        return res.sendStatus(404);
    res.json(word);
};

export const getMultipleByIds = (req: Request, res: Response) => {
    const ids = req.query.id as string[];
    // Don't send more words than would be allowed with a normal search
    ids.length = Math.min(ids.length, config.maxPageSize);

    // At this point API will have errors if any of the IDs were invalid
    // so mapping should work without checking for invalid IDs
    const words = ids.map(id => JMDict.getWord(id));
    
    res.json(words);
};

export const wakachi = (req: Request, res: Response) => {
    parse(req.params.phrase, (result) => {
        const response = result.map(data => [
            data[0],
            data[1]['品詞'] == '記号' ? null : data[1]['原形']
        ]);
        res.json(response);
    });
};
