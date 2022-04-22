import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AuthorizedRequest } from '../middleware/authorization';
import Func, { IFunc } from '../models/Func';

export const postFunc = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const { name, script } = req.body as IFunc;

    const func =  await Func.create({
        name: name,
        script: script,
        creator: req.userId
    });

    res.json(func);
});

export const getFuncById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const func = await Func.findById(req.params.id);
    
    if (!func) {
        res.sendStatus(404);
        return;
    }

    res.json(func);
});

export const getCurrentUserFuncs = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const currentUser = req.userId;
    const funcs = await Func.find(req.query.name ?
        { creator: currentUser, name: req.query.name } :
        { creator: currentUser }
    );

    res.json(funcs);
});

export const updateFunc = asyncHandler(async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const currentUserId = req.userId;
    const func = await Func.findById(req.params.id);

    if (!func) {
        res.sendStatus(404);
        return;
    }

    if (!func.creator.equals(currentUserId)) {
        res.sendStatus(403);
        return;
    }

    const updatedFunc = await Func.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body }
    }, { new: true });

    res.json(updatedFunc);
});
