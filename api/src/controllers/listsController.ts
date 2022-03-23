import asyncHandler from 'express-async-handler';
import List, { IList } from '../models/List';
import User from '../models/User';
import { isAuthorized, AuthorizedRequest } from '../middleware/authorization';
import { createError } from '../middleware/errors';

export const getMyLists = asyncHandler(async (req: AuthorizedRequest, res) => {
    const creator = req.userId;
    const lists = await List.find({ creator });
    res.json(lists);
});

export const getList = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const { username, title, id } = req.query;
    let list: IList;

    if (id) {
        list = await List.findById(id);
    } else {
        const creator = await User.findOne({ username }).select('_id');
        if (!creator)
            return res.sendStatus(404);
        list = await List.findOne({ title, creator: creator.id });
    }

    if (!list)
        return res.sendStatus(404);
    else if (list.public)
        return res.json(list);

    isAuthorized(req, res, () => {
        if (req.userId === list.creator.toString()) {
            res.json(list);
        } else {
            res.sendStatus(404);
        }
    }, 404);
});

export const addWordsToList = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const list = await List.findById(req.params.id).select('words creator');

    // No list found
    if (!list)
        return res.sendStatus(404);
    // If list is found make sure this user is the creator
    // Pretend list doesn't exist if list isn't public and not authorized to change list
    else if (list.creator.toString() !== req.userId)
        return res.sendStatus(list.public ? 401 : 404);

    await List.updateOne({ _id: list._id }, {
        $addToSet: {
            words: {
                $each: req.body
            }
        }
    });

    res.sendStatus(200);
});

export const deleteWordsFromList = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const list = await List.findById(req.params.id).select('words creator');

    // No list found
    if (!list)
        return res.sendStatus(404);
    // If list is found make sure this user is the creator
    // Pretend list doesn't exist if list isn't public and not authorized to change list
    else if (list.creator.toString() !== req.userId)
        return res.sendStatus(list.public ? 401 : 404);

    await List.updateOne({ _id: list._id }, {
        $pull: {
            words: {
                $in: req.body
            }
        }
    });

    res.sendStatus(200);
});

export const getListWords = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const list = await List.findById(req.params.id).select('words public creator');
    
    if (!list)
        return res.sendStatus(404);
    else if (list.public)
        return res.json(list.words);

    isAuthorized(req, res, () => {
        // Send list only if request made by creator
        if (req.userId === list.creator.toString()) {
            res.json(list.words);
        } else {
            res.sendStatus(404);
        }
    }, 404);
});

export const postList = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
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
        if (err.code === 11000 && err.keyPattern.creator && err.keyPattern.slug)
            return res.status(400).json(createError(req, 'LISTS_SLUG_NOT_UNIQUE'));
    }

    res.json(list);
});

export const deleteList = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const list = await List.findById(req.params.id).select('words public creator');
    
    // Return 404 if trying to delete nonexistant list
    if (!list)
        return res.sendStatus(404);

    // Delete only if creator of list
    if (req.userId === list.creator.toString())
        List.deleteOne({ _uid: req.params.id }).then(() => res.sendStatus(200));
    else
        res.sendStatus(401);
});
