import asyncHandler from 'express-async-handler';
import List, { IList } from '../models/List';
import User from '../models/User';
import { isAuthorized, AuthorizedRequest } from '../middleware/authorization';
import { createError } from '../middleware/errors';

export const getCurrentUserLists = asyncHandler(async (req: AuthorizedRequest, res) => {
    const creator = req.userId;
    const lists = await List.find({ creator });
    res.json(lists);
});

export const getListByQuery = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const { username, title, id } = req.query;
    let list: IList;

    if (id) {
        list = await List.findById(id);
    } else {
        const creator = await User.findOne({ username }).select('_id');
        if (!creator) {
            res.sendStatus(404);
            return;
        }
            
        list = await List.findOne({ title, creator: creator.id });
    }

    if (!list) {
        res.sendStatus(404);
        return;
    }
    else if (list.public) {
        res.json(list);
        return;
    }

    isAuthorized(req, res, () => {
        if (req.userId === list.creator.toString())
            res.json(list);
        else
            res.sendStatus(404);
    }, 404);
});

export const addWordsToList = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const list = await List.findById(req.params.id).select('words creator');

    // No list found
    if (!list) {
        res.sendStatus(404);
        return;
    }

    // If list is found make sure this user is the creator
    // Pretend list doesn't exist if list isn't public and not authorized to change list
    else if (list.creator.toString() !== req.userId) {
        res.sendStatus(list.public ? 401 : 404);
        return;
    }

    await List.updateOne({ _id: list._id }, {
        $addToSet: {
            words: {
                $each: req.body
            }
        }
    });

    res.sendStatus(200);
});

export const deleteWordsFromList = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const list = await List.findById(req.params.id).select('words creator');

    // No list found
    if (!list) {
        res.sendStatus(404);
        return;
    }
        
    // If list is found make sure this user is the creator
    // Pretend list doesn't exist if list isn't public and not authorized to change list
    else if (list.creator.toString() !== req.userId) {
        res.sendStatus(list.public ? 401 : 404);
        return;
    }

    await List.updateOne({ _id: list._id }, {
        $pull: {
            words: {
                $in: req.body
            }
        }
    });

    res.sendStatus(200);
});

export const getListWords = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const list = await List.findById(req.params.id).select('words public creator');
    
    if (!list) {
        res.sendStatus(404);
        return;
    }
    else if (list.public) {
        res.json(list.words);
        return;
    }

    isAuthorized(req, res, () => {
        // Send list only if request made by creator
        if (req.userId === list.creator.toString()) {
            res.json(list.words);
        } else {
            res.sendStatus(404);
        }
    }, 404);
});

export const createList = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const {
        title,
        description,
        slug,
        public: pub
    } = req.body;

    const list = new List({
        creator: req.userId,
        title,
        description,
        slug,
        public: pub
    });

    try {
        await list.save();
    } catch (err) {
        if (err.code === 11000 && err.keyPattern.creator && err.keyPattern.slug) {
            res.status(400).json(createError(req, 'LISTS_SLUG_NOT_UNIQUE'));
            return;
        }
    }

    res.json(list);
});

export const deleteList = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const list = await List.findById(req.params.id).select('words public creator');
    
    // Return 404 if trying to delete nonexistant list
    if (!list) {
        res.sendStatus(404);
        return;
    }

    // Delete only if creator of list
    if (req.userId === list.creator.toString())
        List.deleteOne({ _uid: req.params.id }).then(() => res.sendStatus(200));
    else
        res.sendStatus(401);
});
