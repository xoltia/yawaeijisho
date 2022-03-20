import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthorizedRequest } from '../middleware/authorization';

export const me = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    res.json(req.user);
});

export const exists = asyncHandler(async (req: AuthorizedRequest, res): Promise<any> => {
    const username = req.params.username;
    const exists = await User.exists({ username });
    res.json(exists !== null);
});
