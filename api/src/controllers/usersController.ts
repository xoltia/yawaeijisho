import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthorizedRequest } from '../middleware/authorization';

export const getCurrentUser = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    res.json(req.user);
});

export const userExists = asyncHandler(async (req: AuthorizedRequest, res): Promise<void> => {
    const username = req.params.username;
    const exists = (await User.exists({ username })) !== null;
    res.status(exists ? 200 : 404).json(exists);
});
