import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { createError } from '../middleware/errors';
import config from '../config';

export const signIn = asyncHandler(async (req, res): Promise<any> => {
    const { username, password } = req.body;
    // Check user exists and has correct password
    const user = await User.findOne({ username });
    const correctLogin = user && await user.comparePassword(password);

    if (!correctLogin)
        return res.status(403).json(createError(req, 'AUTH_$_INCORRECT_CREDENTIALS'));

    res.json(jwt.sign({ id: user._id }, config.tokenSecret));
});

export const signUp = asyncHandler(async (req, res): Promise<any> => {
    const { username, password } = req.body;
    // Make sure user doesn't already exist
    if (await User.exists({ username }))
        return res.status(403).json(createError(req, 'AUTH_USERNAME_TAKEN'));

    const user = await User.create({ username, password });
    res.json(jwt.sign({ id: user._id }, config.tokenSecret));
});
