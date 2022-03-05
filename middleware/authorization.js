const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { tokenSecret } = require('../config');

// Verifies that user has a valid token and adds the userId property to the request object
module.exports.isAuthorized = (req, res, next, failCode=401) => {
    if (!req.headers.authorization)
        return res.sendStatus(failCode);
    try {
        // Verify token (format: Bearer token)
        const payload = jwt.verify(req.headers.authorization.slice(7), tokenSecret);
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
module.exports.isUser = asyncHandler(async (req, res, next) => {
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
