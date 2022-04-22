import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import config from '../config';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
    id: string
};

// Represents a request which may need to be authorized
export interface AuthorizedRequest extends Request {
    userId?: string,
    user?: IUser
};

// Tries to set user ID but doesn't error if not
export function optionalAuthorized(req: AuthorizedRequest, res: Response, next: NextFunction): void {
    if (!req.headers.authorization)
        return next();

    try {
        // Verify token (format: Bearer token)
        const payload = jwt.verify(req.headers.authorization.slice(7), config.tokenSecret) as JwtPayload;
        // Add userId request object and continue
        req.userId = payload.id;
    } finally {
        next();
    }
};

// Verifies that user has a valid token and adds the userId property to the request object
export function isAuthorized(req: AuthorizedRequest, res: Response, next: NextFunction, failCode: number=401): any {
    if (!req.headers.authorization)
        return res.sendStatus(failCode);
    try {
        // Verify token (format: Bearer token)
        const payload = jwt.verify(req.headers.authorization.slice(7), config.tokenSecret) as JwtPayload;
        // Add userId request object and continue
        req.userId = payload.id;
    } catch (e) {
        // If there was an error then the authorization header was
        // in an incorrect format or had an invalid token
        return res.sendStatus(failCode);
    }
    
    next();
};

// Adds user object to request from userId
// Unecessary unless user information is needed to prevent DB calls on every authorization
export const isUser = asyncHandler(async (req: AuthorizedRequest, res, next): Promise<any> => {
    // Cannot continue if not authorized
    if (!req.userId)
        throw Error('isUser should not be called before isAuthorized');

    // Make sure user is in database and add user property to request object
    // Remove password from object, no route except for pre-authorized ones should
    // need to handle passwords
    const user = await User.findById(req.userId).select('-password');
    if (!user)
        return res.sendStatus(401);
    req.user = user;
    next();
});


// Checks a header and returns User ID if auth successful else null
export function checkToken(token: string): string | null {
    try {
        // Verify token (format: Bearer token)
        const payload = jwt.verify(token, config.tokenSecret) as JwtPayload;
        return payload.id;
    } catch (e) {
        return null;
    }
}
